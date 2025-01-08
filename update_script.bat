@echo off
cd /d "C:\Program Files\Adobe\Adobe Illustrator 2025\Presets\en_GB\Scripts\Legenda"
git pull > update_log.txt 2>&1
set /p GIT_OUTPUT=<update_log.txt
if "%GIT_OUTPUT%"=="Already up to date." (
    echo Script já está atualizado.
) else if %ERRORLEVEL% NEQ 0 (
    echo Falha na atualização.
) else (
    echo Atualização concluída com sucesso!
)
pause
