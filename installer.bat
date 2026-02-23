@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
for %%A in ("%SCRIPT_DIR%\.") do set "CURRENT_INSTALL=%%~fA"
set "LOG_FILE=%TEMP%\Legenda_installer.log"
set "REPO_URL=https://github.com/andrebids/Scripts"
set "BRANCH=main"
set "USER_ID=%USERDOMAIN%\%USERNAME%"
set "TEMP_ROOT=%TEMP%\LegendaInstall_%RANDOM%%RANDOM%%RANDOM%"
set "TEMP_REPO=%TEMP_ROOT%\Legenda"

call :log "============================================================"
call :log "Legenda installer started."

call :ensure_admin
if errorlevel 1 goto :fail

where git >nul 2>nul
if errorlevel 1 (
    call :log "Git was not found in PATH. Trying winget install..."
    where winget >nul 2>nul
    if not errorlevel 1 (
        winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements >>"%LOG_FILE%" 2>&1
        if exist "%ProgramFiles%\Git\cmd\git.exe" set "PATH=%ProgramFiles%\Git\cmd;%PATH%"
    )

    where git >nul 2>nul
    if errorlevel 1 (
        call :log "ERROR: Git installation failed or Git is still unavailable."
        echo [ERRO] Git nao encontrado no PATH.
        echo Instala o Git e volta a executar este installer.
        set "RC=2"
        goto :finish
    )
)

if exist "%TEMP_ROOT%" rmdir /s /q "%TEMP_ROOT%" >nul 2>nul
mkdir "%TEMP_ROOT%" >nul 2>nul
if errorlevel 1 (
    call :log "ERROR: Could not create temp folder: %TEMP_ROOT%"
    set "RC=11"
    goto :finish
)

call :log "Cloning repository: %REPO_URL%"
git clone --depth 1 --branch %BRANCH% "%REPO_URL%" "%TEMP_REPO%" >>"%LOG_FILE%" 2>&1
if errorlevel 1 (
    call :log "ERROR: git clone failed."
    set "RC=12"
    goto :finish
)

set /a TOTAL=0
set /a SUCCESS=0
set /a FAILED=0

call :scan_root "%ProgramFiles%"
if defined ProgramFiles(x86) call :scan_root "%ProgramFiles(x86)%"

if "%TOTAL%"=="0" (
    call :log "ERROR: No Illustrator installations were detected."
    echo [ERRO] Nenhuma instalacao do Adobe Illustrator foi encontrada.
    set "RC=20"
    goto :finish
)

call :log "INSTALL_SUMMARY total=%TOTAL% success=%SUCCESS% failed=%FAILED%"
if not "%FAILED%"=="0" (
    set "RC=10"
    goto :finish
)

set "RC=0"
goto :finish

:scan_root
set "BASE=%~1"
if not defined BASE goto :eof
if not exist "%BASE%\Adobe" goto :eof

for /d %%I in ("%BASE%\Adobe\Adobe Illustrator *") do (
    if exist "%%~fI\Presets" (
        for /d %%L in ("%%~fI\Presets\*") do (
            set "SCRIPTS_DIR=%%~fL\Scripts"
            set "TARGET_DIR=!SCRIPTS_DIR!\Legenda"
            call :install_target "!SCRIPTS_DIR!" "!TARGET_DIR!"
        )
    )
)
goto :eof

:install_target
set "SCRIPTS_DIR=%~1"
set "TARGET_DIR=%~2"
for %%A in ("%TARGET_DIR%\.") do set "TARGET_NORM=%%~fA"

set /a TOTAL+=1
call :log "Target: %TARGET_DIR%"

if not exist "%SCRIPTS_DIR%" (
    mkdir "%SCRIPTS_DIR%" >>"%LOG_FILE%" 2>&1
    if errorlevel 1 (
        call :log "ERROR: Cannot create Scripts folder: %SCRIPTS_DIR%"
        set /a FAILED+=1
        goto :eof
    )
)

icacls "%SCRIPTS_DIR%" /grant "%USER_ID%:(OI)(CI)M" /T /C >>"%LOG_FILE%" 2>&1

if not exist "%TARGET_DIR%" (
    mkdir "%TARGET_DIR%" >>"%LOG_FILE%" 2>&1
    if errorlevel 1 (
        call :log "ERROR: Cannot create target folder: %TARGET_DIR%"
        set /a FAILED+=1
        goto :eof
    )
)

if /I "%TARGET_NORM%"=="%CURRENT_INSTALL%" (
    call :log "INFO: Updating running installation in place (self path)."
    robocopy "%TEMP_REPO%" "%TARGET_DIR%" /MIR /R:2 /W:1 /NFL /NDL /NJH /NJS /NP /XF installer.bat installer_log.txt >>"%LOG_FILE%" 2>&1
) else (
    robocopy "%TEMP_REPO%" "%TARGET_DIR%" /MIR /R:2 /W:1 /NFL /NDL /NJH /NJS /NP >>"%LOG_FILE%" 2>&1
)
set "COPY_RC=%ERRORLEVEL%"
if %COPY_RC% GEQ 8 (
    call :log "ERROR: robocopy failed (%COPY_RC%) on %TARGET_DIR%"
    set /a FAILED+=1
    goto :eof
)

git config --global --add safe.directory "%TARGET_DIR%" >>"%LOG_FILE%" 2>&1
if errorlevel 1 (
    call :log "WARN: Failed to add safe.directory for %TARGET_DIR%"
)

set /a SUCCESS+=1
call :log "OK: %TARGET_DIR%"
goto :eof

:ensure_admin
net session >nul 2>&1
if %ERRORLEVEL% EQU 0 goto :eof

call :log "Requesting administrator elevation..."
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%ComSpec%' -ArgumentList '/c \"\"%~f0\" --elevated\"' -Verb RunAs -Wait"
if errorlevel 1 (
    call :log "ERROR: Elevation canceled or failed."
    echo [ERRO] Permissao de administrador recusada ou falhou.
    exit /b 5
)
exit /b 99

:log
set "NOW=%DATE% %TIME%"
>>"%LOG_FILE%" echo [%NOW%] %~1
goto :eof

:fail
set "RC=%ERRORLEVEL%"

:finish
if exist "%TEMP_ROOT%" rmdir /s /q "%TEMP_ROOT%" >nul 2>nul

if "%RC%"=="99" (
    exit /b 0
)

if "%RC%"=="0" (
    echo.
    echo Instalacao concluida com sucesso.
    echo Log: "%LOG_FILE%"
) else (
    echo.
    echo A instalacao terminou com erro (codigo %RC%).
    echo Verifique o log: "%LOG_FILE%"
)

pause
exit /b %RC%
