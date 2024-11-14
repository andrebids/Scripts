@echo off
setlocal enabledelayedexpansion

REM Check for admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This script requires administrator privileges.
    echo Please right-click on the script and select "Run as administrator".
    pause
    exit /b 1
)

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo A serio que nao instalas-te o git?
    
    REM Download Git installer
    powershell -Command "(New-Object Net.WebClient).DownloadFile('https://github.com/git-for-windows/git/releases/download/v2.41.0.windows.3/Git-2.41.0.3-64-bit.exe', 'git_installer.exe')"
    
    if not exist git_installer.exe (
        echo Failed to download Git installer. Please install Git manually from https://git-scm.com/download/win
        pause
        exit /b 1
    )
    
    REM Run Git installer
    echo Running Git installer...
    start /wait git_installer.exe /VERYSILENT /NORESTART
    
    REM Clean up installer
    del git_installer.exe
    
    echo Installation Complete!
    echo Close the terminal and re-run the script to finish set up.
    pause
    exit /b 0
)

REM If we reach here, Git is installed
echo O Git está instalado. Prosseguindo com a clonagem do repositório...

REM Definir o diretório alvo e criar a pasta Legenda
set "TARGET_DIR=C:\Program Files\Adobe\Adobe Illustrator 2025\Presets\en_GB\Scripts"
set "LEGENDA_DIR=%TARGET_DIR%\Legenda"

REM Verificar se a pasta Legenda já existe e não está vazia
if exist "%LEGENDA_DIR%" (
    echo A pasta Legenda já existe. Removendo conteúdo...
    rmdir /s /q "%LEGENDA_DIR%"
)
mkdir "%LEGENDA_DIR%"

REM Alterar as permissões da pasta Scripts e Legenda usando PowerShell
echo Alterando as permissões das pastas...
powershell -Command "& {$acl = Get-Acl '%TARGET_DIR%'; $sid = New-Object System.Security.Principal.SecurityIdentifier 'S-1-5-32-545'; $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($sid,'FullControl','ContainerInherit,ObjectInherit','None','Allow'); $acl.SetAccessRule($rule); Set-Acl '%TARGET_DIR%' $acl; Set-Acl '%LEGENDA_DIR%' $acl}"

REM Clonar o repositório
echo Clonando o repositório...
git clone https://github.com/andrebids/Scripts "%LEGENDA_DIR%"
if %ERRORLEVEL% neq 0 (
    echo Falha ao clonar o repositório. Por favor, verifique sua conexão com a internet e tente novamente.
) else (
    echo Repositório clonado com sucesso!
    
    REM Adicionar a configuração safe.directory
    echo Adicionando a configuração safe.directory...
    git config --global --add safe.directory "C:/Program Files/Adobe/Adobe Illustrator 2025/Presets/en_GB/Scripts/Legenda"
    
    REM Alterar as permissões da pasta .git usando PowerShell
    echo Alterando as permissões da pasta .git...
    powershell -Command "& {$acl = Get-Acl '%LEGENDA_DIR%\.git'; $sid = New-Object System.Security.Principal.SecurityIdentifier 'S-1-5-32-545'; $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($sid,'FullControl','ContainerInherit,ObjectInherit','None','Allow'); $acl.SetAccessRule($rule); Set-Acl '%LEGENDA_DIR%\.git' $acl}"
    
    REM Abrir a pasta Legenda no Windows Explorer
    echo Abrindo a pasta Legenda no Windows Explorer...
    explorer "%LEGENDA_DIR%"
)

pause