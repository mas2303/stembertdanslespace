@echo off
cd /d "%~dp0"
echo Demarrage du serveur sur http://localhost:5000 ...
echo.
start "" cmd /c "npx --yes serve -l 5000 --no-clipboard & pause"
timeout /t 6 /nobreak >nul
start http://localhost:5000
echo.
echo Le navigateur devrait s'ouvrir. Si ce n'est pas le cas, ouvrez : http://localhost:5000
echo.
pause
