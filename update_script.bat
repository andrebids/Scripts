@echo off
cd /d "C:\Program Files\Adobe\Adobe Illustrator 2024\Presets\en_US\Scripts\Scripts"
git pull
if %ERRORLEVEL% NEQ 0 (
    echo Falha na atualiza��o. Pressione qualquer tecla para sair.
    pause >nul
) else (
    echo Atualiza��o conclu�da com sucesso!
    echo success > update_success.tmp
)
exit
