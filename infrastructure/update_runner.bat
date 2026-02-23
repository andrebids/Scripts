@echo off
setlocal EnableExtensions

set "INFRA_DIR=%~dp0"
for %%I in ("%INFRA_DIR%..") do set "ROOT_DIR=%%~fI"

set "LOG_FILE=%ROOT_DIR%\update_log.txt"
set "TMP_LOG_FILE=%TEMP%\legenda_update_%RANDOM%_%RANDOM%.log"
set "STATUS_FILE=%ROOT_DIR%\update_status.txt"
set "LOCK_FILE=%ROOT_DIR%\update_running.lock"
set "PS_SCRIPT=%INFRA_DIR%sync_all_illustrators.ps1"

del /f /q "%STATUS_FILE%" "%LOCK_FILE%" 2>nul
del /f /q "%TMP_LOG_FILE%" 2>nul
>"%LOCK_FILE%" echo RUNNING

if not exist "%PS_SCRIPT%" (
    >"%LOG_FILE%" echo Missing PowerShell script: "%PS_SCRIPT%"
    >"%STATUS_FILE%" echo ERROR 90
    del /f /q "%LOCK_FILE%" 2>nul
    exit /b 90
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" -SourceDir "%ROOT_DIR%" -LogPath "%TMP_LOG_FILE%"
set "RC=%ERRORLEVEL%"

if exist "%TMP_LOG_FILE%" (
    copy /Y "%TMP_LOG_FILE%" "%LOG_FILE%" >nul 2>&1
    del /f /q "%TMP_LOG_FILE%" 2>nul
)

if "%RC%"=="0" (
    >"%STATUS_FILE%" echo OK
) else if "%RC%"=="11" (
    >"%STATUS_FILE%" echo OK_PARTIAL
) else (
    >"%STATUS_FILE%" echo ERROR %RC%
)

del /f /q "%LOCK_FILE%" 2>nul
exit /b %RC%
