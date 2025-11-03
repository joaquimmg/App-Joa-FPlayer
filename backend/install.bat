@echo off
echo Instalando dependencias do backend...
echo.

cd /d "%~dp0"
.venv\Scripts\pip.exe install -r requirements.txt

echo.
echo Instalacao concluida!
echo.
pause
