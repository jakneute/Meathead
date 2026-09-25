@echo off
title Meathead
rem Double-click to play. Close this window to stop the game server.
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Get it from https://nodejs.org and try again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo First run on this computer: installing dependencies...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

call npm run dev -- --open
pause
