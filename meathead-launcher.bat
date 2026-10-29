@echo off
rem Double-click, pick a game: it runs on the dev server (localhost), and the browser opens on it once it's up.
rem Close this window (or press Ctrl+C in it) to stop the server.
cd /d "%~dp0"
title Meathead launcher
echo.
echo   MEATHEAD LAUNCHER
echo.
echo   1  Meathead 1
echo   2  Meathead 2
echo.
choice /c 12 /n /m "Pick 1 or 2: "
if errorlevel 2 (set URL=http://localhost:3000/meathead2.html) else (set URL=http://localhost:3000/)
title Meathead dev server
rem Wait in the background until the server answers, then open the game.
start "" /b powershell -NoProfile -WindowStyle Hidden -Command "for ($i = 0; $i -lt 120; $i++) { try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 '%URL%' | Out-Null; Start-Process '%URL%'; break } catch { Start-Sleep -Seconds 1 } }"
call npm.cmd run dev
pause
