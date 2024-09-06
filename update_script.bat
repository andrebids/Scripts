@echo off
cd /d "C:\Program Files\Adobe\Adobe Illustrator 2024\Presets\en_US\Scripts\Scripts"
git pull > git_output.tmp 2>&1
set /p GIT_OUTPUT=<git_output.tmp
del git_output.tmp
if "%GIT_OUTPUT%"=="Already up to date." (
    echo up_to_date > update_status.tmp
) else if %ERRORLEVEL% NEQ 0 (
    echo Falha na atualização. Pressione qualquer tecla para sair.
    pause >nul
) else (
    echo Atualização concluída com sucesso!
    echo success > update_status.tmp
)
del "%~f0"
exit
