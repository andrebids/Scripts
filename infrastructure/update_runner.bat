@echo off
setlocal EnableExtensions

set "INFRA_DIR=%~dp0"
for %%I in ("%INFRA_DIR%..") do set "ROOT_DIR=%%~fI"

set "LOG_FILE=%ROOT_DIR%\update_log.txt"
set "STATUS_FILE=%ROOT_DIR%\update_status.txt"
set "LOCK_FILE=%ROOT_DIR%\update_running.lock"
set "PS_SCRIPT=%INFRA_DIR%sync_all_illustrators.ps1"

del /f /q "%STATUS_FILE%" "%LOCK_FILE%" 2>nul
>"%LOCK_FILE%" echo RUNNING

if not exist "%PS_SCRIPT%" (
    >"%LOG_FILE%" echo Missing PowerShell script: "%PS_SCRIPT%"
    >"%STATUS_FILE%" echo ERROR 90
    del /f /q "%LOCK_FILE%" 2>nul
    exit /b 90
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" -SourceDir "%ROOT_DIR%" -LogPath "%LOG_FILE%"
set "RC=%ERRORLEVEL%"

if "%RC%"=="0" (
    >"%STATUS_FILE%" echo OK
) else (
    >"%STATUS_FILE%" echo ERROR %RC%
)

del /f /q "%LOCK_FILE%" 2>nul
exit /b %RC%
