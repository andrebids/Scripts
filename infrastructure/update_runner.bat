@echo off
setlocal EnableExtensions

set "INFRA_DIR=%~dp0"
for %%I in ("%INFRA_DIR%..") do set "DEFAULT_ROOT_DIR=%%~fI"

set "ROOT_DIR=%~1"
if "%ROOT_DIR%"=="" set "ROOT_DIR=%DEFAULT_ROOT_DIR%"

set "RUN_ID=%~2"
if "%RUN_ID%"=="" set "RUN_ID=%RANDOM%_%RANDOM%"

set "UPDATER_DIR=%LOCALAPPDATA%\Legenda\Updater"
if "%LOCALAPPDATA%"=="" set "UPDATER_DIR=%TEMP%\Legenda\Updater"
if not exist "%UPDATER_DIR%" mkdir "%UPDATER_DIR%" >nul 2>&1

set "STATUS_FILE=%~3"
if "%STATUS_FILE%"=="" set "STATUS_FILE=%UPDATER_DIR%\status_%RUN_ID%.json"

set "LOG_FILE=%~4"
if "%LOG_FILE%"=="" set "LOG_FILE=%UPDATER_DIR%\update_%RUN_ID%.log"

set "PS_SCRIPT=%INFRA_DIR%update_project_from_github.ps1"

>"%STATUS_FILE%" echo {"runId":"%RUN_ID%","state":"RUNNING","message":"Updater iniciado."}

if not exist "%PS_SCRIPT%" (
    >"%LOG_FILE%" echo Missing PowerShell script: "%PS_SCRIPT%"
    >"%STATUS_FILE%" echo {"runId":"%RUN_ID%","state":"MISSING_UPDATER","message":"Arquivo PowerShell do updater nao encontrado.","exitCode":90}
    exit /b 90
)

where powershell >nul 2>&1
if errorlevel 1 (
    >"%LOG_FILE%" echo PowerShell is not available in PATH.
    >"%STATUS_FILE%" echo {"runId":"%RUN_ID%","state":"MISSING_POWERSHELL","message":"PowerShell nao esta disponivel.","exitCode":91}
    exit /b 91
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" -SourceDir "%ROOT_DIR%" -RunId "%RUN_ID%" -StatusPath "%STATUS_FILE%" -LogPath "%LOG_FILE%"
set "RC=%ERRORLEVEL%"

if not exist "%STATUS_FILE%" (
    >"%STATUS_FILE%" echo {"runId":"%RUN_ID%","state":"FAILED","message":"Updater terminou sem gravar status.","exitCode":%RC%}
)

exit /b %RC%
