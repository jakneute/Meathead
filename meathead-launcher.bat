@echo off
rem Double-click, pick a game: it runs on the dev server (localhost), and the dev server opens the browser on it once
rem it's up. Close this window (or press Ctrl+C in it) to stop the server.
cd /d "%~dp0"
title Meathead launcher
echo.
echo   MEATHEAD LAUNCHER
echo.
echo   1  Meathead 1
echo   2  Meathead 2
echo.
choice /c 12 /n /m "Pick 1 or 2: "
if errorlevel 2 (set PAGE=/meathead2.html) else (set PAGE=/)
title Meathead dev server
call npm.cmd run dev -- --open %PAGE%
pause
