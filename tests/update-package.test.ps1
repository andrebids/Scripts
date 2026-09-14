param([string]$Scenario, [string]$CaseDir)

$ErrorActionPreference = 'Stop'
$updater = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\infrastructure\update_project_from_github.ps1'))

if ($Scenario) {
    # Run the real worker in a child process, replacing only network and copy I/O.
    function Invoke-RestMethod {
        param($Uri, $Method, $Headers, $TimeoutSec)
        Add-Content (Join-Path $CaseDir 'requests.txt') $Uri
        if ($Uri -match '/commits/main$') { return @{sha = ('a' * 40)} }
        if ($Uri -notmatch ('/' + ('a' * 40) + '/assets/version.json$')) { throw 'Unpinned version URL' }
        return @{version = '2.0'}
    }
    function Invoke-WebRequest {
        param($Uri, [switch]$UseBasicParsing, $TimeoutSec, $OutFile, $Headers)
        Add-Content (Join-Path $CaseDir 'requests.txt') $Uri
        if ($Uri -notmatch ('/zip/' + ('a' * 40) + '$')) { throw 'Unpinned ZIP URL' }
        Set-Content (Join-Path $CaseDir 'workdir.txt') (Split-Path $OutFile -Parent)
        if ($Scenario -eq 'download-failed') { throw 'Simulated download failure' }
        Microsoft.PowerShell.Management\Copy-Item -LiteralPath (Join-Path $CaseDir 'package.zip') -Destination $OutFile
    }
    function Copy-Item {
        param($LiteralPath, $Destination, [switch]$Force, $ErrorAction)
        if ($Scenario -eq 'copy-failed' -and $Destination.EndsWith('\script.jsx')) { throw 'Simulated copy failure' }
        Add-Content (Join-Path $CaseDir 'copies.txt') $Destination
        Microsoft.PowerShell.Management\Copy-Item -LiteralPath $LiteralPath -Destination $Destination -Force -ErrorAction Stop
    }
    & $updater -SourceDir (Join-Path $CaseDir 'install') -RunId $Scenario -StatusPath (Join-Path $CaseDir 'status.json') -LogPath (Join-Path $CaseDir 'update.log') -SkipElevation
    exit $LASTEXITCODE
}

function Assert($Condition, $Message) {
    if (-not $Condition) { throw $Message }
}

Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$testBase = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$testRoot = Join-Path $testBase ('LegendaUpdaterTests-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $testRoot | Out-Null
try {
    $cases = [ordered]@{
        updated = 'UPDATED'; current = 'ALREADY_CURRENT'; 'download-failed' = 'DOWNLOAD_FAILED'
        corrupt = 'INVALID_PACKAGE'; missing = 'INVALID_PACKAGE'; mismatch = 'INVALID_PACKAGE'
        traversal = 'INVALID_PACKAGE'; 'bad-version' = 'INVALID_PACKAGE'; 'copy-failed' = 'COPY_FAILED'
    }
    foreach ($name in $cases.Keys) {
        $casePath = Join-Path $testRoot $name
        $install = Join-Path $casePath 'install'
        New-Item -ItemType Directory -Path (Join-Path $install 'assets') -Force | Out-Null
        $oldVersion = if ($name -eq 'current') { '2.0' } else { '1.0' }
        Set-Content (Join-Path $install 'assets\version.json') ('{"version":"' + $oldVersion + '"}')
        Set-Content (Join-Path $install 'script.jsx') 'old script'
        Set-Content (Join-Path $install 'local-only.txt') 'keep me'

        $zipPath = Join-Path $casePath 'package.zip'
        $zip = [IO.Compression.ZipFile]::Open($zipPath, [IO.Compression.ZipArchiveMode]::Create)
        try {
            $entries = [ordered]@{
                'script.jsx' = 'new script'
                'assets/version.json' = '{"version":"2.0"}'
                'infrastructure/update.jsx' = 'updater'
                'infrastructure/update_runner.bat' = 'runner'
                'infrastructure/update_project_from_github.ps1' = 'worker'
                'resources/a file.txt' = 'resource'
                '.gitignore' = 'hidden file'
                '.github/workflows/ci.yml' = 'excluded'
                'update_log.txt' = 'excluded'
                'debug.log' = 'excluded'
            }
            if ($name -eq 'missing') { $entries.Remove('script.jsx') }
            if ($name -eq 'mismatch') { $entries['assets/version.json'] = '{"version":"3.0"}' }
            if ($name -eq 'bad-version') { $entries['assets/version.json'] = 'invalid json' }
            foreach ($entryName in $entries.Keys) {
                $entry = $zip.CreateEntry('Scripts-commit/' + $entryName)
                $writer = New-Object IO.StreamWriter($entry.Open())
                try { $writer.Write($entries[$entryName]) } finally { $writer.Dispose() }
            }
            if ($name -eq 'traversal') { $null = $zip.CreateEntry('../outside.txt') }
        } finally { $zip.Dispose() }
        if ($name -eq 'corrupt') { Set-Content $zipPath 'not a zip' }

        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $PSCommandPath -Scenario $name -CaseDir $casePath
        $exitCode = $LASTEXITCODE
        $status = Get-Content (Join-Path $casePath 'status.json') -Raw | ConvertFrom-Json
        Assert ($status.state -eq $cases[$name]) "$name returned $($status.state), expected $($cases[$name]). See $casePath"
        Assert ($exitCode -eq $status.exitCode) "$name exit code differs from status"
        $version = (Get-Content (Join-Path $install 'assets\version.json') -Raw | ConvertFrom-Json).version
        Assert ($version -eq $(if ($name -eq 'updated') { '2.0' } else { $oldVersion })) "$name wrote version before successful copy"
        if ($name -eq 'updated') {
            $copies = @(Get-Content (Join-Path $casePath 'copies.txt'))
            Assert ($copies[-1] -eq (Join-Path $install 'assets\version.json')) 'Version must be copied last'
            Assert ((Get-Content (Join-Path $install 'script.jsx')) -eq 'new script') 'Script not replaced'
            Assert (Test-Path (Join-Path $install '.gitignore')) 'Hidden file not copied'
            Assert (Test-Path (Join-Path $install 'resources\a file.txt')) 'Path with spaces not copied'
            foreach ($excluded in @('.github', 'update_log.txt', 'debug.log')) {
                Assert (-not (Test-Path (Join-Path $install $excluded))) "Excluded file installed: $excluded"
            }
        } elseif ($name -ne 'copy-failed') {
            Assert ((Get-Content (Join-Path $install 'script.jsx')) -eq 'old script') "$name changed installation"
        }
        Assert ((Get-Content (Join-Path $install 'local-only.txt')) -eq 'keep me') 'Unrelated local file changed'
        Assert (-not (Test-Path (Join-Path $casePath 'outside.txt'))) 'ZIP escaped its extraction folder'
        $requests = @(Get-Content (Join-Path $casePath 'requests.txt'))
        Assert ($requests.Count -eq $(if ($name -eq 'current') { 2 } else { 3 })) "$name made unexpected requests"
        if (Test-Path (Join-Path $casePath 'workdir.txt')) {
            $work = (Get-Content (Join-Path $casePath 'workdir.txt')).Trim()
            Assert (-not (Test-Path -LiteralPath $work)) "$name left temporary download files"
        }
        Write-Output "$name passed"
    }
    Write-Output 'All updater package checks passed on Windows PowerShell.'
} finally {
    $cleanup = [IO.Path]::GetFullPath($testRoot)
    if (-not $cleanup.StartsWith($testBase, [StringComparison]::OrdinalIgnoreCase) -or
        [IO.Path]::GetFileName($cleanup) -notlike 'LegendaUpdaterTests-*') { throw 'Unsafe test cleanup path' }
    Remove-Item -LiteralPath $cleanup -Recurse -Force
}
