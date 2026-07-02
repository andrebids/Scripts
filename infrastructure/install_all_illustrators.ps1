param(
    [string]$RunId = ("install_" + [guid]::NewGuid().ToString("N")),

    [string]$StatusPath = "",

    [string]$LogPath = "",

    [string]$RepoOwner = "andrebids",

    [string]$RepoName = "Scripts",

    [string]$Branch = "main",

    [string[]]$TargetPath = @(),

    [switch]$SkipElevation
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

if ([string]::IsNullOrWhiteSpace($StatusPath) -or [string]::IsNullOrWhiteSpace($LogPath)) {
    $baseDir = Join-Path $env:LOCALAPPDATA "Legenda\Installer"
    if ([string]::IsNullOrWhiteSpace($env:LOCALAPPDATA)) {
        $baseDir = Join-Path $env:TEMP "Legenda\Installer"
    }
    if ([string]::IsNullOrWhiteSpace($StatusPath)) {
        $StatusPath = Join-Path $baseDir ("status_" + $RunId + ".json")
    }
    if ([string]::IsNullOrWhiteSpace($LogPath)) {
        $LogPath = Join-Path $baseDir ("install_" + $RunId + ".log")
    }
}

$script:StatusBase = [ordered]@{
    runId = $RunId
    state = "RUNNING"
    message = "Instalacao iniciada."
    startedAt = (Get-Date).ToString("s")
    finishedAt = $null
    repo = "$RepoOwner/$RepoName"
    branch = $Branch
    logPath = $LogPath
    statusPath = $StatusPath
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

    if ($State -ne "RUNNING" -and $State -ne "ELEVATING" -and $State -ne "DOWNLOADING" -and $State -ne "INSTALLING") {
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

function Test-IsAdministrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
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

function Grant-ModifyPermission {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        return $false
    }

    $identity = "$env:USERDOMAIN\$env:USERNAME"
    $systemRoot = $env:SystemRoot
    if ([string]::IsNullOrWhiteSpace($systemRoot)) {
        $systemRoot = $env:windir
    }
    $icacls = Join-Path $systemRoot "System32\icacls.exe"
    if (-not (Test-Path -LiteralPath $icacls)) {
        Write-Log ("icacls.exe not found: {0}" -f $icacls)
        return $false
    }

    Write-Log ("Trying ACL update on: {0}" -f $Path)
    $aclLog = Join-Path $env:TEMP ("legenda_icacls_" + [guid]::NewGuid().ToString("N") + ".log")
    $aclExitCode = $null
    try {
        & $icacls $Path /grant "${identity}:(OI)(CI)M" /T /C > $aclLog 2>&1
        $aclExitCode = $LASTEXITCODE

        if (Test-Path -LiteralPath $aclLog) {
            Get-Content -LiteralPath $aclLog -ErrorAction SilentlyContinue | ForEach-Object {
                if ($_ -ne $null) {
                    Write-Log $_.ToString()
                }
            }
        }
    } finally {
        if (Test-Path -LiteralPath $aclLog) {
            Remove-Item -LiteralPath $aclLog -Force -ErrorAction SilentlyContinue
        }
    }

    if ($null -eq $aclExitCode) {
        Write-Log ("icacls did not report an exit code for {0}; continuing with write-access checks." -f $Path)
        return $true
    }

    if ($aclExitCode -ne 0) {
        Write-Log ("icacls failed with code {0} on {1}" -f $aclExitCode, $Path)
        return $false
    }

    return $true
}

function Read-JsonFile {
    param([string]$Path)

    $content = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
    return $content | ConvertFrom-Json
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

function ConvertTo-RawUrlPath {
    param([string]$Path)

    $segments = @($Path -split "/")
    $encodedSegments = @()
    foreach ($segment in $segments) {
        $encodedSegments += [Uri]::EscapeDataString($segment)
    }
    return ($encodedSegments -join "/")
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

    return Invoke-RestMethod -Uri $Url -Method Get -Headers @{
        "User-Agent" = "Legenda-Installer"
        "Accept" = "application/vnd.github+json"
    }
}

function Get-LegendaTargets {
    param([string[]]$ExplicitTargets)

    $targets = @()

    if ($ExplicitTargets -and $ExplicitTargets.Count -gt 0) {
        foreach ($target in $ExplicitTargets) {
            if ([string]::IsNullOrWhiteSpace($target)) {
                continue
            }
            $targets += [pscustomobject]@{
                Illustrator = "Explicit target"
                Language = ""
                ScriptsDir = (Split-Path -Path $target -Parent)
                Target = $target
            }
        }
        return $targets
    }

    $programFolders = @($env:ProgramFiles, ${env:ProgramFiles(x86)}) | Where-Object {
        $_ -and (Test-Path -LiteralPath $_)
    } | Select-Object -Unique

    foreach ($programFolder in $programFolders) {
        $adobeRoot = Join-Path $programFolder "Adobe"
        if (-not (Test-Path -LiteralPath $adobeRoot)) {
            continue
        }

        Get-ChildItem -Path $adobeRoot -Directory -Filter "Adobe Illustrator*" -ErrorAction SilentlyContinue | ForEach-Object {
            $illustratorName = $_.Name
            $presetsDir = Join-Path $_.FullName "Presets"
            if (-not (Test-Path -LiteralPath $presetsDir)) {
                return
            }

            Get-ChildItem -Path $presetsDir -Directory -ErrorAction SilentlyContinue | ForEach-Object {
                $scriptsDir = Join-Path $_.FullName "Scripts"
                $targets += [pscustomobject]@{
                    Illustrator = $illustratorName
                    Language = $_.Name
                    ScriptsDir = $scriptsDir
                    Target = (Join-Path $scriptsDir "Legenda")
                }
            }
        }
    }

    return @($targets | Sort-Object -Property Target -Unique)
}

function Get-GitHubPackage {
    param([string]$DestinationRoot)

    $versionUrl = "https://raw.githubusercontent.com/$RepoOwner/$RepoName/$Branch/assets/version.json"
    Write-Log ("Fetching remote version: {0}" -f $versionUrl)

    try {
        $remoteVersionData = Invoke-GitHubJson -Url $versionUrl
    } catch {
        throw ("Nao foi possivel consultar a versao remota: {0}" -f $_.Exception.Message)
    }

    $remoteVersion = $remoteVersionData.version
    $treeUrl = "https://api.github.com/repos/$RepoOwner/$RepoName/git/trees/$Branch" + "?recursive=1"
    Write-Log ("Fetching repository tree: {0}" -f $treeUrl)

    try {
        $treeResponse = Invoke-GitHubJson -Url $treeUrl
    } catch {
        throw ("Nao foi possivel obter a lista de ficheiros do GitHub: {0}" -f $_.Exception.Message)
    }

    if ($treeResponse.truncated) {
        throw "A lista de ficheiros do GitHub veio incompleta."
    }

    $files = @($treeResponse.tree | Where-Object {
        $_.type -eq "blob" -and (Should-IncludeFile -Path $_.path)
    })

    if ($files.Count -eq 0) {
        throw "Nao foram encontrados ficheiros para descarregar."
    }

    $packageDir = Join-Path $DestinationRoot "Legenda"
    if (Test-Path -LiteralPath $packageDir) {
        Remove-Item -LiteralPath $packageDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    Ensure-Directory -Path $packageDir

    Write-Log ("Downloading {0} files to {1}" -f $files.Count, $packageDir)
    Write-Status -State "DOWNLOADING" -Message "A descarregar projeto do GitHub." -ExitCode 0 -Extra @{
        remoteVersion = $remoteVersion
        filesTotal = $files.Count
        filesDownloaded = 0
    }

    $client = New-Object System.Net.WebClient
    $client.Headers.Add("User-Agent", "Legenda-Installer")

    $downloaded = 0
    try {
        foreach ($file in $files) {
            $relativePath = ($file.path -replace "\\", "/")
            $destination = Join-Path $packageDir ($relativePath -replace "/", [System.IO.Path]::DirectorySeparatorChar)
            Ensure-Directory -Path (Split-Path -Path $destination -Parent)

            $rawPath = ConvertTo-RawUrlPath -Path $relativePath
            $downloadUrl = "https://raw.githubusercontent.com/$RepoOwner/$RepoName/$Branch/$rawPath"
            $client.DownloadFile($downloadUrl, $destination)
            $downloaded++

            if (($downloaded % 20) -eq 0 -or $downloaded -eq $files.Count) {
                Write-Status -State "DOWNLOADING" -Message "A descarregar projeto do GitHub." -ExitCode 0 -Extra @{
                    remoteVersion = $remoteVersion
                    filesTotal = $files.Count
                    filesDownloaded = $downloaded
                }
            }
        }
    } finally {
        $client.Dispose()
    }

    $requiredFiles = @(
        "script.jsx",
        "installer.bat",
        "assets\version.json",
        "infrastructure\install_all_illustrators.ps1",
        "infrastructure\update.jsx",
        "infrastructure\update_runner.bat",
        "infrastructure\update_project_from_github.ps1"
    )

    foreach ($requiredFile in $requiredFiles) {
        $requiredPath = Join-Path $packageDir $requiredFile
        if (-not (Test-Path -LiteralPath $requiredPath)) {
            throw ("O projeto descarregado esta incompleto. Ficheiro em falta: {0}" -f $requiredFile)
        }
    }

    $packageVersion = (Read-JsonFile -Path (Join-Path $packageDir "assets\version.json")).version
    if ((Compare-Version -Left $packageVersion -Right $remoteVersion) -ne 0) {
        throw ("A versao descarregada ({0}) nao corresponde a versao remota ({1})." -f $packageVersion, $remoteVersion)
    }

    return [pscustomobject]@{
        Path = $packageDir
        Version = $packageVersion
        Files = $files
        FilesTotal = $files.Count
        FilesDownloaded = $downloaded
    }
}

function Install-LegendaTarget {
    param(
        [object]$TargetInfo,
        [object]$Package
    )

    $target = $TargetInfo.Target
    $scriptsDir = $TargetInfo.ScriptsDir
    Write-Log ("Install target: {0}" -f $target)

    try {
        Ensure-Directory -Path $scriptsDir
    } catch {
        $parent = Split-Path -Path $scriptsDir -Parent
        [void](Grant-ModifyPermission -Path $parent)
        Ensure-Directory -Path $scriptsDir
    }

    [void](Grant-ModifyPermission -Path $scriptsDir)
    if (-not (Test-WriteAccess -Path $scriptsDir)) {
        throw ("Sem permissao de escrita na pasta Scripts: {0}" -f $scriptsDir)
    }

    if (Test-Path -LiteralPath $target) {
        try {
            Remove-Item -LiteralPath $target -Recurse -Force -ErrorAction Stop
        } catch {
            Write-Log ("Failed deleting target, trying ACL fix: {0}" -f $target)
            [void](Grant-ModifyPermission -Path $target)
            Remove-Item -LiteralPath $target -Recurse -Force -ErrorAction Stop
        }
    }

    Ensure-Directory -Path $target

    foreach ($file in $Package.Files) {
        $relativePath = ($file.path -replace "\\", "/")
        $source = Join-Path $Package.Path ($relativePath -replace "/", [System.IO.Path]::DirectorySeparatorChar)
        $destination = Join-Path $target ($relativePath -replace "/", [System.IO.Path]::DirectorySeparatorChar)
        Ensure-Directory -Path (Split-Path -Path $destination -Parent)
        Copy-Item -LiteralPath $source -Destination $destination -Force -ErrorAction Stop
    }

    [void](Grant-ModifyPermission -Path $target)
    $installedVersion = (Read-JsonFile -Path (Join-Path $target "assets\version.json")).version

    Write-Log ("Install success: {0} version={1}" -f $target, $installedVersion)
    return [pscustomobject]@{
        target = $target
        illustrator = $TargetInfo.Illustrator
        language = $TargetInfo.Language
        version = $installedVersion
    }
}

Ensure-Directory -Path (Split-Path -Path $LogPath -Parent)
Set-Content -LiteralPath $LogPath -Value "" -Encoding UTF8
Write-Status -State "RUNNING" -Message "Instalacao iniciada." -ExitCode 0 -Extra @{}
Write-Log ("Installer started. Repo={0}/{1} Branch={2}" -f $RepoOwner, $RepoName, $Branch)

if ((-not (Test-IsAdministrator)) -and (-not $SkipElevation) -and (-not ($TargetPath -and $TargetPath.Count -gt 0))) {
    Write-Log "Process is not elevated. Requesting administrator elevation."
    Write-Status -State "ELEVATING" -Message "A pedir permissao de administrador." -ExitCode 0 -Extra @{}

    try {
        $pwsh = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
        $argList = @(
            "-NoProfile",
            "-ExecutionPolicy", "Bypass",
            "-File", $PSCommandPath,
            "-RunId", $RunId,
            "-StatusPath", $StatusPath,
            "-LogPath", $LogPath,
            "-RepoOwner", $RepoOwner,
            "-RepoName", $RepoName,
            "-Branch", $Branch,
            "-SkipElevation"
        )

        $elevated = Start-Process -FilePath $pwsh -ArgumentList $argList -Verb RunAs -Wait -PassThru
        exit $elevated.ExitCode
    } catch {
        Write-Log ("Elevation canceled or failed: {0}" -f $_.Exception.Message)
        Write-Status -State "ELEVATION_FAILED" -Message "Permissao de administrador recusada ou falhou." -ExitCode 5 -Extra @{}
        exit 5
    }
}

$tempRoot = Join-Path $env:TEMP ("LegendaInstall_" + $RunId)

try {
    if (Test-Path -LiteralPath $tempRoot) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
    Ensure-Directory -Path $tempRoot

    $package = Get-GitHubPackage -DestinationRoot $tempRoot
    $targets = @(Get-LegendaTargets -ExplicitTargets $TargetPath)

    if ($targets.Count -eq 0) {
        Write-Log "No Adobe Illustrator installations were detected."
        Write-Status -State "NO_TARGETS" -Message "Nenhuma instalacao do Adobe Illustrator foi encontrada." -ExitCode 20 -Extra @{
            packageVersion = $package.Version
        }
        exit 20
    }

    Write-Log ("Targets found: {0}" -f $targets.Count)
    Write-Status -State "INSTALLING" -Message "A instalar em pastas do Illustrator." -ExitCode 0 -Extra @{
        packageVersion = $package.Version
        targetsTotal = $targets.Count
        targetsInstalled = 0
        targetsFailed = 0
        filesTotal = $package.FilesTotal
    }

    $installedTargets = @()
    $failedTargets = @()

    foreach ($target in $targets) {
        try {
            $installedTargets += Install-LegendaTarget -TargetInfo $target -Package $package
        } catch {
            $failedTargets += [pscustomobject]@{
                target = $target.Target
                illustrator = $target.Illustrator
                language = $target.Language
                error = $_.Exception.Message
            }
            Write-Log ("Install failed on {0}: {1}" -f $target.Target, $_.Exception.Message)
        }

        Write-Status -State "INSTALLING" -Message "A instalar em pastas do Illustrator." -ExitCode 0 -Extra @{
            packageVersion = $package.Version
            targetsTotal = $targets.Count
            targetsInstalled = $installedTargets.Count
            targetsFailed = $failedTargets.Count
            filesTotal = $package.FilesTotal
        }
    }

    Write-Log ("INSTALL_SUMMARY total={0} success={1} failed={2}" -f $targets.Count, $installedTargets.Count, $failedTargets.Count)

    if ($failedTargets.Count -gt 0) {
        Write-Log "Failed targets list:"
        foreach ($failed in $failedTargets) {
            Write-Log (" - {0}: {1}" -f $failed.target, $failed.error)
        }

        Write-Status -State "PARTIAL" -Message "Instalacao concluida parcialmente." -ExitCode 10 -Extra @{
            packageVersion = $package.Version
            targetsTotal = $targets.Count
            targetsInstalled = $installedTargets.Count
            targetsFailed = $failedTargets.Count
            installedTargets = $installedTargets
            failedTargets = $failedTargets
            filesTotal = $package.FilesTotal
        }
        exit 10
    }

    Write-Status -State "INSTALLED" -Message "Instalacao concluida com sucesso." -ExitCode 0 -Extra @{
        packageVersion = $package.Version
        targetsTotal = $targets.Count
        targetsInstalled = $installedTargets.Count
        targetsFailed = 0
        installedTargets = $installedTargets
        filesTotal = $package.FilesTotal
    }
    Write-Log "Installer finished successfully."
    exit 0
} catch {
    Write-Log ("Fatal installer error: {0}" -f $_.Exception.Message)
    if ($_.FullyQualifiedErrorId) {
        Write-Log ("Fatal error id: {0}" -f $_.FullyQualifiedErrorId)
    }
    if ($_.ScriptStackTrace) {
        Write-Log ("Fatal stack: {0}" -f ($_.ScriptStackTrace -replace "`r?`n", " | "))
    }
    Write-Status -State "FAILED" -Message $_.Exception.Message -ExitCode 1 -Extra @{}
    exit 1
} finally {
    try {
        if (Test-Path -LiteralPath $tempRoot) {
            Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
        }
    } catch {}
}
