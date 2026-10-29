@echo off
rem Double-click to start the dev server and open Meathead 2 in the browser.
rem Close this window (or press Ctrl+C in it) to stop the server.
cd /d "%~dp0"
title Meathead dev server

rem Wait in the background until the server answers, then open the game.
start "" /b powershell -NoProfile -WindowStyle Hidden -Command "for ($i = 0; $i -lt 120; $i++) { try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 http://localhost:3000/meathead2.html | Out-Null; Start-Process 'http://localhost:3000/meathead2.html'; break } catch { Start-Sleep -Seconds 1 } }"

call npm.cmd run dev
pause
