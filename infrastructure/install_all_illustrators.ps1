param(
    [Parameter(Mandatory = $false)]
    [string]$RepoUrl = "https://github.com/andrebids/Scripts",

    [Parameter(Mandatory = $true)]
    [string]$LogPath,

    [switch]$SkipElevation
)

$ErrorActionPreference = "Stop"

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $LogPath -Value ("[{0}] {1}" -f $timestamp, $Message) -Encoding UTF8
}

function Ensure-Directory {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
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
        Set-Content -Path $probe -Value "ok" -Encoding ASCII -ErrorAction Stop
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
    Write-Log ("Trying ACL update on: {0}" -f $Path)
    & icacls $Path /grant "${identity}:(OI)(CI)M" /T /C 2>&1 | ForEach-Object {
        if ($_ -ne $null) {
            Write-Log $_.ToString()
        }
    }
    return ($LASTEXITCODE -eq 0)
}

function Invoke-Git {
    param([string[]]$Arguments)
    Write-Log ("git {0}" -f ($Arguments -join " "))
    & git @Arguments 2>&1 | ForEach-Object {
        if ($_ -ne $null) {
            Write-Log $_.ToString()
        }
    }
    if ($LASTEXITCODE -ne 0) {
        throw ("git failed with code {0}: git {1}" -f $LASTEXITCODE, ($Arguments -join " "))
    }
}

function Get-LegendaTargets {
    $targets = New-Object System.Collections.Generic.List[string]
    $programFolders = @($env:ProgramFiles, ${env:ProgramFiles(x86)}) | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -Unique

    foreach ($programFolder in $programFolders) {
        $adobeRoot = Join-Path $programFolder "Adobe"
        if (-not (Test-Path -LiteralPath $adobeRoot)) {
            continue
        }

        Get-ChildItem -Path $adobeRoot -Directory -Filter "Adobe Illustrator *" -ErrorAction SilentlyContinue | ForEach-Object {
            $presetsDir = Join-Path $_.FullName "Presets"
            if (-not (Test-Path -LiteralPath $presetsDir)) {
                return
            }

            Get-ChildItem -Path $presetsDir -Directory -ErrorAction SilentlyContinue | ForEach-Object {
                $scriptsDir = Join-Path $_.FullName "Scripts"
                $targets.Add((Join-Path $scriptsDir "Legenda"))
            }
        }
    }

    return $targets | Sort-Object -Unique
}

function Replace-TargetFolder {
    param(
        [string]$Source,
        [string]$Target
    )

    Write-Log ("Install target: {0}" -f $Target)
    $scriptsDir = Split-Path -Path $Target -Parent
    Ensure-Directory -Path $scriptsDir

    if (-not (Test-WriteAccess -Path $scriptsDir)) {
        [void](Grant-ModifyPermission -Path $scriptsDir)
    }
    if (-not (Test-WriteAccess -Path $scriptsDir)) {
        throw ("No write access to Scripts folder: {0}" -f $scriptsDir)
    }

    if (Test-Path -LiteralPath $Target) {
        try {
            Remove-Item -LiteralPath $Target -Recurse -Force -ErrorAction Stop
        } catch {
            Write-Log ("Failed deleting target, trying ACL fix: {0}" -f $Target)
            [void](Grant-ModifyPermission -Path $Target)
            Remove-Item -LiteralPath $Target -Recurse -Force -ErrorAction Stop
        }
    }

    Ensure-Directory -Path $Target
    & robocopy $Source $Target /MIR /R:2 /W:1 /NFL /NDL /NJH /NJS /NP 2>&1 | ForEach-Object {
        if ($_ -ne $null) {
            Write-Log $_.ToString()
        }
    }

    $copyExitCode = $LASTEXITCODE
    if ($copyExitCode -ge 8) {
        throw ("robocopy failed with code {0} for {1}" -f $copyExitCode, $Target)
    }

    Invoke-Git -Arguments @("config", "--global", "--add", "safe.directory", $Target)
    Write-Log ("Install success: {0}" -f $Target)
}

Ensure-Directory -Path (Split-Path -Path $LogPath -Parent)
Set-Content -Path $LogPath -Value "" -Encoding UTF8

Write-Log ("Installer started. Repo: {0}" -f $RepoUrl)

if ((-not (Test-IsAdministrator)) -and (-not $SkipElevation)) {
    Write-Log "Process is not elevated. Requesting administrator elevation."
    try {
        $pwsh = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
        $argList = @(
            "-NoProfile",
            "-ExecutionPolicy", "Bypass",
            "-File", $PSCommandPath,
            "-RepoUrl", $RepoUrl,
            "-LogPath", $LogPath,
            "-SkipElevation"
        )

        $elevated = Start-Process -FilePath $pwsh -ArgumentList $argList -Verb RunAs -Wait -PassThru
        exit $elevated.ExitCode
    } catch {
        Write-Log ("Elevation canceled or failed: {0}" -f $_.Exception.Message)
        exit 5
    }
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Log "Git is not available in PATH."
    exit 2
}

if (-not (Get-Command robocopy -ErrorAction SilentlyContinue)) {
    Write-Log "robocopy is not available."
    exit 3
}

$targets = Get-LegendaTargets
if ($targets.Count -eq 0) {
    Write-Log "No Adobe Illustrator installations were detected."
    exit 20
}

$tempRoot = Join-Path $env:TEMP ("LegendaInstall_" + [guid]::NewGuid().ToString("N"))
$sourceDir = Join-Path $tempRoot "Legenda"

try {
    Ensure-Directory -Path $tempRoot
    Invoke-Git -Arguments @("clone", "--depth", "1", $RepoUrl, $sourceDir)

    $okTargets = 0
    $failedTargets = @()

    foreach ($target in $targets) {
        try {
            Replace-TargetFolder -Source $sourceDir -Target $target
            $okTargets++
        } catch {
            $failedTargets += $target
            Write-Log ("Install failed on {0}: {1}" -f $target, $_.Exception.Message)
        }
    }

    Write-Log ("INSTALL_SUMMARY total={0} success={1} failed={2}" -f $targets.Count, $okTargets, $failedTargets.Count)
    if ($failedTargets.Count -gt 0) {
        Write-Log "Failed targets list:"
        foreach ($failed in $failedTargets) {
            Write-Log (" - {0}" -f $failed)
        }
        exit 10
    }

    Write-Log "Installer finished successfully."
    exit 0
} catch {
    Write-Log ("Fatal installer error: {0}" -f $_.Exception.Message)
    exit 1
} finally {
    try {
        if (Test-Path -LiteralPath $tempRoot) {
            Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
        }
    } catch {}
}
