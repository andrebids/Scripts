@echo off
cd /d "C:\Program Files\Adobe\Adobe Illustrator 2025\Presets\en_GB\Scripts\Legenda"
git config --global --add safe.directory "%CD%" > update_log.txt
git fetch origin main >> update_log.txt
git reset --hard origin/main >> update_log.txt
git clean -fd >> update_log.txt
