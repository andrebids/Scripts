param(
    [Parameter(Mandatory = $true)]
    [string]$SourceDir,

    [Parameter(Mandatory = $true)]
    [string]$RunId,

    [Parameter(Mandatory = $true)]
    [string]$StatusPath,

    [Parameter(Mandatory = $true)]
    [string]$LogPath,

    [string]$RepoOwner = "andrebids",
    [string]$RepoName = "Scripts",
    [string]$Branch = "main",

    [switch]$SkipElevation
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$script:StatusBase = [ordered]@{
    runId = $RunId
    state = "RUNNING"
    message = "Atualizacao iniciada."
    startedAt = (Get-Date).ToString("s")
    finishedAt = $null
    sourceDir = $SourceDir
    repo = "$RepoOwner/$RepoName"
    branch = $Branch
    logPath = $LogPath
}

function Ensure-Directory {
    param([string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return
    }

    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Write-Log {
    param([string]$Message)

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -LiteralPath $LogPath -Value ("[{0}] {1}" -f $timestamp, $Message) -Encoding UTF8
}

function Write-Status {
    param(
        [string]$State,
        [string]$Message,
        [int]$ExitCode,
        [hashtable]$Extra
    )

    $status = [ordered]@{}
    foreach ($key in $script:StatusBase.Keys) {
        $status[$key] = $script:StatusBase[$key]
    }

    $status["state"] = $State
    $status["message"] = $Message
    $status["exitCode"] = $ExitCode

    if ($State -ne "RUNNING" -and $State -ne "ELEVATING" -and $State -ne "DOWNLOADING" -and $State -ne "COPYING") {
        $status["finishedAt"] = (Get-Date).ToString("s")
    }

    if ($Extra) {
        foreach ($key in $Extra.Keys) {
            $status[$key] = $Extra[$key]
        }
    }

    Ensure-Directory -Path (Split-Path -Path $StatusPath -Parent)
    $status | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $StatusPath -Encoding UTF8
}

function Read-JsonFile {
    param([string]$Path)

    $content = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
    return $content | ConvertFrom-Json
}

function Test-IsAdministrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Quote-ProcessArgument {
    param([string]$Value)

    if ($null -eq $Value) {
        return '""'
    }

    return '"' + $Value.Replace('"', '\"') + '"'
}

function Get-VersionParts {
    param([string]$Version)

    if ([string]::IsNullOrWhiteSpace($Version)) {
        return @(0)
    }

    $matches = [regex]::Matches($Version, "\d+")
    if ($matches.Count -eq 0) {
        return @(0)
    }

    $parts = @()
    foreach ($match in $matches) {
        $parts += [int]$match.Value
    }
    return $parts
}

function Compare-Version {
    param(
        [string]$Left,
        [string]$Right
    )

    $leftParts = @(Get-VersionParts -Version $Left)
    $rightParts = @(Get-VersionParts -Version $Right)
    $max = [Math]::Max($leftParts.Count, $rightParts.Count)

    for ($i = 0; $i -lt $max; $i++) {
        $leftValue = 0
        $rightValue = 0

        if ($i -lt $leftParts.Count) {
            $leftValue = $leftParts[$i]
        }
        if ($i -lt $rightParts.Count) {
            $rightValue = $rightParts[$i]
        }

        if ($leftValue -gt $rightValue) {
            return 1
        }
        if ($leftValue -lt $rightValue) {
            return -1
        }
    }

    return 0
}

function Test-WriteAccess {
    param([string]$Path)

    try {
        Ensure-Directory -Path $Path
        $probe = Join-Path $Path ("write_test_" + [guid]::NewGuid().ToString("N") + ".tmp")
        Set-Content -LiteralPath $probe -Value "ok" -Encoding ASCII -ErrorAction Stop
        Remove-Item -LiteralPath $probe -Force -ErrorAction SilentlyContinue
        return $true
    } catch {
        return $false
    }
}

function Should-IncludeFile {
    param([string]$Path)

    $normalized = ($Path -replace "\\", "/")
    $lower = $normalized.ToLowerInvariant()

    $excludedExact = @(
        "installer_log.txt",
        "update_log.txt",
        "update_status.txt",
        "update_running.lock"
    )

    if ($excludedExact -contains $lower) {
        return $false
    }

    if ($lower.StartsWith(".git/") -or
        $lower.StartsWith(".github/") -or
        $lower.EndsWith(".tmp") -or
        $lower.EndsWith(".lock") -or
        $lower.EndsWith(".log")) {
        return $false
    }

    return $true
}

function Invoke-GitHubJson {
    param([string]$Url)

    return Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 60 -Headers @{
        "User-Agent" = "Legenda-Updater"
        "Accept" = "application/vnd.github+json"
    }
}

Ensure-Directory -Path (Split-Path -Path $LogPath -Parent)
Set-Content -LiteralPath $LogPath -Value "" -Encoding UTF8
Write-Status -State "RUNNING" -Message "Atualizacao iniciada." -ExitCode 0 -Extra @{}
Write-Log ("Starting GitHub project update. Source={0} Repo={1}/{2} Branch={3}" -f $SourceDir, $RepoOwner, $RepoName, $Branch)
$workDir = $null
$totalTimer = [Diagnostics.Stopwatch]::StartNew()

try {
    if (-not (Test-Path -LiteralPath $SourceDir)) {
        Write-Log ("Source folder not found: {0}" -f $SourceDir)
        Write-Status -State "INVALID_SOURCE" -Message "A pasta local do script nao foi encontrada." -ExitCode 21 -Extra @{}
        exit 21
    }

    $resolvedSource = (Resolve-Path -LiteralPath $SourceDir).Path
    $localVersionPath = Join-Path $resolvedSource "assets\version.json"
    $localVersion = "0.0.0"

    if (Test-Path -LiteralPath $localVersionPath) {
        try {
            $localVersion = (Read-JsonFile -Path $localVersionPath).version
        } catch {
            Write-Log ("Could not read local version: {0}" -f $_.Exception.Message)
        }
    }

    $versionUrl = "https://api.github.com/repos/$RepoOwner/$RepoName/commits/" + [Uri]::EscapeDataString($Branch)
    try {
        $commit = (Invoke-GitHubJson -Url $versionUrl).sha
        if ($commit -notmatch '^[0-9a-f]{40}$') { throw "Invalid GitHub commit." }
        $script:StatusBase["commit"] = $commit
        $versionUrl = "https://raw.githubusercontent.com/$RepoOwner/$RepoName/$commit/assets/version.json"
        Write-Log ("Fetching remote version: {0}" -f $versionUrl)
        $remoteVersionData = Invoke-GitHubJson -Url $versionUrl
        if ([string]::IsNullOrWhiteSpace($remoteVersionData.version)) { throw "Missing remote version." }
    } catch {
        Write-Log ("Remote version fetch failed: {0}" -f $_.Exception.Message)
        Write-Status -State "DOWNLOAD_FAILED" -Message "Nao foi possivel consultar a versao remota." -ExitCode 30 -Extra @{
            localVersion = $localVersion
            failedUrl = $versionUrl
        }
        exit 30
    }
    $remoteVersion = $remoteVersionData.version

    Write-Log ("Version check: local={0} remote={1}" -f $localVersion, $remoteVersion)
    if ((Compare-Version -Left $remoteVersion -Right $localVersion) -le 0) {
        Write-Status -State "ALREADY_CURRENT" -Message "A versao local ja esta atualizada." -ExitCode 0 -Extra @{
            localVersion = $localVersion
            remoteVersion = $remoteVersion
        }
        exit 0
    }

    if (-not (Test-WriteAccess -Path $resolvedSource)) {
        if ((-not (Test-IsAdministrator)) -and (-not $SkipElevation)) {
            Write-Log ("No write access to source folder. Requesting administrator elevation: {0}" -f $resolvedSource)
            Write-Status -State "ELEVATING" -Message "A pedir permissao de administrador." -ExitCode 0 -Extra @{
                localVersion = $localVersion
                remoteVersion = $remoteVersion
                folder = $resolvedSource
            }

            try {
                $pwsh = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
                $argList = @(
                    "-NoProfile",
                    "-ExecutionPolicy", "Bypass",
                    "-File", (Quote-ProcessArgument -Value $PSCommandPath),
                    "-SourceDir", (Quote-ProcessArgument -Value $resolvedSource),
                    "-RunId", (Quote-ProcessArgument -Value $RunId),
                    "-StatusPath", (Quote-ProcessArgument -Value $StatusPath),
                    "-LogPath", (Quote-ProcessArgument -Value $LogPath),
                    "-RepoOwner", (Quote-ProcessArgument -Value $RepoOwner),
                    "-RepoName", (Quote-ProcessArgument -Value $RepoName),
                    "-Branch", (Quote-ProcessArgument -Value $Branch),
                    "-SkipElevation"
                )

                $elevated = Start-Process -FilePath $pwsh -ArgumentList $argList -Verb RunAs -WindowStyle Hidden -Wait -PassThru
                exit $elevated.ExitCode
            } catch {
                Write-Log ("Elevation canceled or failed: {0}" -f $_.Exception.Message)
                Write-Status -State "ELEVATION_FAILED" -Message "Permissao de administrador recusada ou falhou." -ExitCode 5 -Extra @{
                    localVersion = $localVersion
                    remoteVersion = $remoteVersion
                    folder = $resolvedSource
                }
                exit 5
            }
        }

        Write-Log ("No write access to source folder after elevation attempt: {0}" -f $resolvedSource)
        Write-Status -State "NEEDS_PERMISSION" -Message "Sem permissao de escrita na pasta do Illustrator." -ExitCode 20 -Extra @{
            localVersion = $localVersion
            remoteVersion = $remoteVersion
            folder = $resolvedSource
        }
        exit 20
    }

    $tempBase = [IO.Path]::GetFullPath((Join-Path ([IO.Path]::GetTempPath()) "LegendaUpdate"))
    $workDir = Join-Path $tempBase ([guid]::NewGuid().ToString("N"))
    Ensure-Directory -Path $workDir
    $archivePath = Join-Path $workDir "project.zip"
    $extractDir = Join-Path $workDir "extracted"
    $archiveUrl = "https://codeload.github.com/$RepoOwner/$RepoName/zip/$commit"
    $phaseTimer = [Diagnostics.Stopwatch]::StartNew()

    Write-Log ("Downloading archive: {0}" -f $archiveUrl)
    Write-Status -State "DOWNLOADING" -Message "A descarregar projeto do GitHub." -ExitCode 0 -Extra @{
        localVersion = $localVersion
        remoteVersion = $remoteVersion
        phase = "DOWNLOAD"
    }
    try {
        Invoke-WebRequest -Uri $archiveUrl -UseBasicParsing -TimeoutSec 120 -OutFile $archivePath -Headers @{"User-Agent" = "Legenda-Updater"}
    } catch {
        Write-Log ("Archive download failed: {0}" -f $_.Exception.Message)
        Write-Status -State "DOWNLOAD_FAILED" -Message "Falha ao descarregar o ZIP do GitHub." -ExitCode 30 -Extra @{
            localVersion = $localVersion
            remoteVersion = $remoteVersion
            failedUrl = $archiveUrl
        }
        exit 30
    }
    Write-Log ("Download completed in {0:N2}s." -f $phaseTimer.Elapsed.TotalSeconds)

    # Keep DOWNLOADING for older JSX clients, which treat unknown states as terminal.
    Write-Status -State "DOWNLOADING" -Message "A descompactar projeto." -ExitCode 0 -Extra @{
        localVersion = $localVersion
        remoteVersion = $remoteVersion
        phase = "EXTRACTING"
    }
    $phaseTimer.Restart()
    try {
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        $archive = [IO.Compression.ZipFile]::OpenRead($archivePath)
        try {
            $extractPrefix = [IO.Path]::GetFullPath($extractDir) + [IO.Path]::DirectorySeparatorChar
            foreach ($entry in $archive.Entries) {
                $entryPath = $entry.FullName.Replace('/', '\')
                $target = [IO.Path]::GetFullPath((Join-Path $extractDir $entryPath))
                if ($entryPath.Contains(':') -or [IO.Path]::IsPathRooted($entryPath) -or
                    -not $target.StartsWith($extractPrefix, [StringComparison]::OrdinalIgnoreCase)) {
                    throw "Unsafe ZIP path: $($entry.FullName)"
                }
            }
        } finally {
            $archive.Dispose()
        }
        [IO.Compression.ZipFile]::ExtractToDirectory($archivePath, $extractDir)
        $roots = @(Get-ChildItem -LiteralPath $extractDir -Force)
        if ($roots.Count -ne 1 -or -not $roots[0].PSIsContainer) { throw "Invalid ZIP root folder." }
        $downloadDir = $roots[0].FullName
        $files = @(Get-ChildItem -LiteralPath $downloadDir -Recurse -File -Force | ForEach-Object {
            $relativePath = $_.FullName.Substring($downloadDir.Length + 1).Replace('\', '/')
            if (Should-IncludeFile -Path $relativePath) { [pscustomobject]@{path = $relativePath} }
        } | Sort-Object @{Expression = {$_.path -eq 'assets/version.json'}}, path)
    } catch {
        Write-Log ("Invalid archive: {0}" -f $_.Exception.Message)
        Write-Status -State "INVALID_PACKAGE" -Message "Nao foi possivel validar ou descompactar o ZIP." -ExitCode 32 -Extra @{
            localVersion = $localVersion
            remoteVersion = $remoteVersion
        }
        exit 32
    }
    $downloaded = $files.Count
    Write-Log ("Extraction completed in {0:N2}s. Files={1}" -f $phaseTimer.Elapsed.TotalSeconds, $files.Count)

    $requiredFiles = @(
        "script.jsx",
        "assets\version.json",
        "infrastructure\update.jsx",
        "infrastructure\update_runner.bat",
        "infrastructure\update_project_from_github.ps1"
    )

    foreach ($requiredFile in $requiredFiles) {
        $requiredPath = Join-Path $downloadDir $requiredFile
        if (-not (Test-Path -LiteralPath $requiredPath -PathType Leaf)) {
            Write-Log ("Required file missing from downloaded project: {0}" -f $requiredFile)
            Write-Status -State "INVALID_PACKAGE" -Message "O projeto descarregado esta incompleto." -ExitCode 32 -Extra @{
                localVersion = $localVersion
                remoteVersion = $remoteVersion
                missingFile = $requiredFile
            }
            exit 32
        }
    }

    try {
        $packageVersion = (Read-JsonFile -Path (Join-Path $downloadDir "assets\version.json")).version
    } catch {
        Write-Log ("Invalid package version: {0}" -f $_.Exception.Message)
        $packageVersion = $null
    }
    if ([string]::IsNullOrWhiteSpace($packageVersion) -or (Compare-Version -Left $packageVersion -Right $remoteVersion) -ne 0) {
        Write-Log ("Downloaded package version mismatch: package={0} remote={1}" -f $packageVersion, $remoteVersion)
        Write-Status -State "INVALID_PACKAGE" -Message "A versao descarregada nao corresponde a versao remota." -ExitCode 32 -Extra @{
            localVersion = $localVersion
            remoteVersion = $remoteVersion
            packageVersion = $packageVersion
        }
        exit 32
    }

    Write-Log "Copying downloaded files to current installation."
    $phaseTimer.Restart()
    Write-Status -State "COPYING" -Message "A copiar ficheiros para a pasta atual." -ExitCode 0 -Extra @{
        localVersion = $localVersion
        remoteVersion = $remoteVersion
        filesTotal = $files.Count
        filesDownloaded = $downloaded
        filesCopied = 0
    }

    $copied = 0
    foreach ($file in $files) {
        $relativePath = ($file.path -replace "\\", "/")
        $source = Join-Path $downloadDir ($relativePath -replace "/", [System.IO.Path]::DirectorySeparatorChar)
        $destination = Join-Path $resolvedSource ($relativePath -replace "/", [System.IO.Path]::DirectorySeparatorChar)
        Ensure-Directory -Path (Split-Path -Path $destination -Parent)

        try {
            Copy-Item -LiteralPath $source -Destination $destination -Force -ErrorAction Stop
            $copied++
        } catch {
            Write-Log ("Copy failed for {0}: {1}" -f $relativePath, $_.Exception.Message)
            Write-Status -State "COPY_FAILED" -Message "Falha ao copiar ficheiro para a pasta do Illustrator." -ExitCode 31 -Extra @{
                localVersion = $localVersion
                remoteVersion = $remoteVersion
                failedFile = $relativePath
                filesDownloaded = $downloaded
                filesCopied = $copied
                filesTotal = $files.Count
            }
            exit 31
        }

        if (($copied % 20) -eq 0 -or $copied -eq $files.Count) {
            Write-Status -State "COPYING" -Message "A copiar ficheiros para a pasta atual." -ExitCode 0 -Extra @{
                localVersion = $localVersion
                remoteVersion = $remoteVersion
                filesTotal = $files.Count
                filesDownloaded = $downloaded
                filesCopied = $copied
            }
        }
    }

    $installedVersion = (Read-JsonFile -Path $localVersionPath).version
    if ((Compare-Version -Left $installedVersion -Right $remoteVersion) -ne 0) { throw "Installed version mismatch." }
    Write-Log ("Copy completed in {0:N2}s. Total={1:N2}s." -f $phaseTimer.Elapsed.TotalSeconds, $totalTimer.Elapsed.TotalSeconds)
    Write-Log ("Update finished successfully. installed={0} files={1}" -f $installedVersion, $copied)
    Write-Status -State "UPDATED" -Message "Atualizacao concluida." -ExitCode 0 -Extra @{
        localVersion = $localVersion
        remoteVersion = $remoteVersion
        installedVersion = $installedVersion
        filesDownloaded = $downloaded
        filesCopied = $copied
        filesTotal = $files.Count
    }
    exit 0
} catch {
    Write-Log ("Fatal error: {0}" -f $_.Exception.Message)
    Write-Status -State "FAILED" -Message $_.Exception.Message -ExitCode 1 -Extra @{}
    exit 1
} finally {
    if ($workDir) {
        try {
            $cleanupPath = [IO.Path]::GetFullPath($workDir)
            if (-not $cleanupPath.StartsWith($tempBase + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
                throw "Invalid temporary folder for cleanup."
            }
            Remove-Item -LiteralPath $cleanupPath -Recurse -Force -ErrorAction Stop
        } catch {
            try { Write-Log ("Temporary cleanup failed: {0}" -f $_.Exception.Message) } catch {}
        }
    }
}
