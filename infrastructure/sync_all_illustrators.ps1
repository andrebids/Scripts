param(
    [Parameter(Mandatory = $true)]
    [string]$SourceDir,

    [Parameter(Mandatory = $true)]
    [string]$LogPath
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

    if ($LASTEXITCODE -ne 0) {
        Write-Log ("icacls failed with code {0} for {1}" -f $LASTEXITCODE, $Path)
        return $false
    }
    return $true
}

function Invoke-Git {
    param([string[]]$Arguments)
    Write-Log ("git {0}" -f ($Arguments -join " "))
    $previousErrorActionPreference = $ErrorActionPreference
    $commandExitCode = 0
    try {
        # Native tools like git often write progress to stderr; do not treat that as fatal.
        $ErrorActionPreference = "Continue"
        & git @Arguments 2>&1 | ForEach-Object {
            if ($_ -ne $null) {
                Write-Log $_.ToString()
            }
        }
        $commandExitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    if ($commandExitCode -ne 0) {
        throw ("git failed with code {0}: git {1}" -f $commandExitCode, ($Arguments -join " "))
    }
}

function Test-GitWorkingTreeDirty {
    try {
        $previousErrorActionPreference = $ErrorActionPreference
        $output = @()
        try {
            $ErrorActionPreference = "Continue"
            $output = & git status --porcelain 2>$null
        } finally {
            $ErrorActionPreference = $previousErrorActionPreference
        }

        if ($LASTEXITCODE -ne 0) {
            throw ("git status failed with code {0}" -f $LASTEXITCODE)
        }

        return ($output -and $output.Count -gt 0)
    } catch {
        throw ("Failed to check local git changes: {0}" -f $_.Exception.Message)
    }
}

function Get-LegendaTargets {
    param([string]$CurrentSourceDir)

    $targets = New-Object System.Collections.Generic.List[string]
    $targets.Add((Resolve-Path -LiteralPath $CurrentSourceDir).Path)

    $adobeRoot = Join-Path $env:ProgramFiles "Adobe"
    if (Test-Path -LiteralPath $adobeRoot) {
        Get-ChildItem -Path $adobeRoot -Directory -Filter "Adobe Illustrator *" -ErrorAction SilentlyContinue | ForEach-Object {
            $presetsDir = Join-Path $_.FullName "Presets"
            if (-not (Test-Path -LiteralPath $presetsDir)) {
                return
            }

            Get-ChildItem -Path $presetsDir -Directory -ErrorAction SilentlyContinue | ForEach-Object {
                $scriptsDir = Join-Path $_.FullName "Scripts"
                if (Test-Path -LiteralPath $scriptsDir) {
                    $targets.Add((Join-Path $scriptsDir "Legenda"))
                }
            }
        }
    }

    return $targets | Sort-Object -Unique
}

function Sync-ToTarget {
    param(
        [string]$From,
        [string]$To
    )

    $normalizedFrom = [System.IO.Path]::GetFullPath($From).TrimEnd("\")
    $normalizedTo = [System.IO.Path]::GetFullPath($To).TrimEnd("\")
    if ($normalizedFrom -ieq $normalizedTo) {
        Write-Log ("Skipping source folder sync: {0}" -f $To)
        return
    }

    Write-Log ("Sync start: {0}" -f $To)
    $scriptsDir = Split-Path -Path $To -Parent
    Ensure-Directory -Path $scriptsDir

    if (-not (Test-Path -LiteralPath $To)) {
        try {
            New-Item -ItemType Directory -Path $To -Force | Out-Null
        } catch {
            Write-Log ("Create folder failed on {0}. Trying ACL on parent." -f $scriptsDir)
            [void](Grant-ModifyPermission -Path $scriptsDir)
            New-Item -ItemType Directory -Path $To -Force | Out-Null
        }
    } else {
        try {
            Remove-Item -LiteralPath $To -Recurse -Force -ErrorAction Stop
            New-Item -ItemType Directory -Path $To -Force | Out-Null
        } catch {
            Write-Log ("Replace folder failed on {0}. Trying ACL fix." -f $To)
            [void](Grant-ModifyPermission -Path $To)
            Remove-Item -LiteralPath $To -Recurse -Force -ErrorAction Stop
            New-Item -ItemType Directory -Path $To -Force | Out-Null
        }
    }

    if (-not (Test-WriteAccess -Path $To)) {
        Write-Log ("No write access to {0}. Trying ACL fix." -f $To)
        [void](Grant-ModifyPermission -Path $To)
        if (-not (Test-WriteAccess -Path $To)) {
            throw ("No write access after ACL attempt: {0}" -f $To)
        }
    }

    $excludeFiles = @(
        "update_log.txt",
        "update_status.txt",
        "update_running.lock",
        "git_check.txt",
        "check_git.bat",
        "update_script.bat"
    )

    $previousErrorActionPreference = $ErrorActionPreference
    $copyExitCode = 0
    try {
        # robocopy can emit stderr even for non-fatal copy states.
        $ErrorActionPreference = "Continue"
        & robocopy $From $To /MIR /R:2 /W:1 /NFL /NDL /NJH /NJS /NP /XF @excludeFiles 2>&1 | ForEach-Object {
            if ($_ -ne $null) {
                Write-Log $_.ToString()
            }
        }
        $copyExitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    if ($copyExitCode -ge 8) {
        throw ("robocopy failed with code {0} for {1}" -f $copyExitCode, $To)
    }

    Write-Log ("Sync success: {0} (robocopy code {1})" -f $To, $copyExitCode)
}

Ensure-Directory -Path (Split-Path -Path $LogPath -Parent)
Set-Content -Path $LogPath -Value "" -Encoding UTF8

Write-Log ("Starting update from source: {0}" -f $SourceDir)

if (-not (Test-Path -LiteralPath $SourceDir)) {
    Write-Log ("Source folder not found: {0}" -f $SourceDir)
    exit 91
}

Write-Log "Running update without elevation."

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Log "Git is not available in PATH."
    exit 2
}

if (-not (Get-Command robocopy -ErrorAction SilentlyContinue)) {
    Write-Log "robocopy is not available."
    exit 3
}

$resolvedSource = (Resolve-Path -LiteralPath $SourceDir).Path
Push-Location $resolvedSource

try {
    if (-not (Test-WriteAccess -Path $resolvedSource)) {
        Write-Log ("No write access to source. Trying ACL fix: {0}" -f $resolvedSource)
        [void](Grant-ModifyPermission -Path $resolvedSource)
        if (-not (Test-WriteAccess -Path $resolvedSource)) {
            throw ("Source folder is not writable: {0}" -f $resolvedSource)
        }
    }

    Invoke-Git -Arguments @("config", "--global", "--add", "safe.directory", $resolvedSource)

    $isDirty = Test-GitWorkingTreeDirty
    if ($isDirty) {
        Write-Log "Local changes detected. Skipping git fetch/reset/clean and syncing current local files."
    } else {
        Invoke-Git -Arguments @("fetch", "origin", "main")
        Invoke-Git -Arguments @("reset", "--hard", "origin/main")
        Invoke-Git -Arguments @("clean", "-fd")
    }

    $targets = Get-LegendaTargets -CurrentSourceDir $resolvedSource
    Write-Log ("Targets found: {0}" -f $targets.Count)

    $okTargets = 0
    $failedTargets = @()

    foreach ($target in $targets) {
        try {
            Sync-ToTarget -From $resolvedSource -To $target
            $okTargets++
        } catch {
            $failedTargets += $target
            Write-Log ("Sync failed on {0}: {1}" -f $target, $_.Exception.Message)
        }
    }

    Write-Log ("SYNC_SUMMARY total={0} success={1} failed={2}" -f $targets.Count, $okTargets, $failedTargets.Count)
    if ($failedTargets.Count -gt 0) {
        Write-Log "Failed targets list:"
        foreach ($failed in $failedTargets) {
            Write-Log (" - {0}" -f $failed)
        }
        Write-Log "Update finished with partial sync."
        exit 11
    }

    Write-Log "Update and sync finished successfully."
    exit 0
} catch {
    Write-Log ("Fatal error: {0}" -f $_.Exception.Message)
    exit 1
} finally {
    Pop-Location
}
