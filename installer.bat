@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
set "RUN_ID=%RANDOM%_%RANDOM%_%RANDOM%"

set "INSTALLER_DIR=%LOCALAPPDATA%\Legenda\Installer"
if "%LOCALAPPDATA%"=="" set "INSTALLER_DIR=%TEMP%\Legenda\Installer"
if not exist "%INSTALLER_DIR%" mkdir "%INSTALLER_DIR%" >nul 2>&1

set "STATUS_FILE=%INSTALLER_DIR%\status_%RUN_ID%.json"
set "LOG_FILE=%INSTALLER_DIR%\install_%RUN_ID%.log"
set "TEMP_RUN_DIR=%TEMP%\LegendaInstaller_%RUN_ID%"
set "PS_LOCAL=%SCRIPT_DIR%infrastructure\install_all_illustrators.ps1"
set "PS_RUNNER=%TEMP_RUN_DIR%\install_all_illustrators.ps1"
set "PS_URL=https://raw.githubusercontent.com/andrebids/Scripts/main/infrastructure/install_all_illustrators.ps1"

if exist "%TEMP_RUN_DIR%" rmdir /s /q "%TEMP_RUN_DIR%" >nul 2>&1
mkdir "%TEMP_RUN_DIR%" >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Nao foi possivel criar pasta temporaria.
    exit /b 11
)

where powershell >nul 2>&1
if errorlevel 1 (
    echo [ERRO] PowerShell nao esta disponivel neste computador.
    >"%STATUS_FILE%" echo {"runId":"%RUN_ID%","state":"MISSING_POWERSHELL","message":"PowerShell nao esta disponivel.","exitCode":91}
    exit /b 91
)

if exist "%PS_LOCAL%" (
    copy /Y "%PS_LOCAL%" "%PS_RUNNER%" >nul 2>&1
) else (
    echo Ficheiro local do installer nao encontrado. A descarregar do GitHub...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%PS_URL%' -OutFile '%PS_RUNNER%' -UseBasicParsing" >nul 2>&1
)

if not exist "%PS_RUNNER%" (
    echo [ERRO] Nao foi possivel preparar o installer PowerShell.
    >"%STATUS_FILE%" echo {"runId":"%RUN_ID%","state":"MISSING_INSTALLER","message":"Installer PowerShell nao encontrado.","exitCode":90}
    exit /b 90
)

echo.
echo A instalar Legenda em todas as versoes do Illustrator detectadas...
echo O Windows pode pedir permissao de administrador.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_RUNNER%" -RunId "%RUN_ID%" -StatusPath "%STATUS_FILE%" -LogPath "%LOG_FILE%"
set "RC=%ERRORLEVEL%"

echo.
if "%RC%"=="0" (
    echo Instalacao concluida com sucesso.
) else if "%RC%"=="10" (
    echo Instalacao concluida parcialmente. Verifique o log.
) else (
    echo A instalacao terminou com erro ^(codigo %RC%^).
)

echo Status: "%STATUS_FILE%"
echo Log: "%LOG_FILE%"
echo.

if exist "%STATUS_FILE%" (
    type "%STATUS_FILE%"
    echo.
)

if exist "%TEMP_RUN_DIR%" rmdir /s /q "%TEMP_RUN_DIR%" >nul 2>&1

pause
exit /b %RC%
