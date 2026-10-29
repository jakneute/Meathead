@echo off
rem Double-click for a menu: either game on the dev server (localhost), or one of the built HTML files.
cd /d "%~dp0"
title Meathead launcher
echo.
echo   MEATHEAD LAUNCHER
echo.
echo   1  Meathead 2, localhost (dev server: see your code changes on refresh)
echo   2  Meathead 1, localhost (dev server)
echo   3  Meathead 2, built HTML  (release-m2\Meathead2.html)
echo   4  Meathead 2, built HTML with cheats  (release-m2\Meathead2-cheats.html)
echo   5  Meathead 1, built HTML  (release-m1\Meathead.html)
echo.
choice /c 12345 /n /m "Pick 1-5: "
if errorlevel 5 goto m1html
if errorlevel 4 goto m2cheats
if errorlevel 3 goto m2html
if errorlevel 2 goto m1dev
goto m2dev

:m2html
call :open "release-m2\Meathead2.html" "npm run release:m2"
goto :eof
:m2cheats
call :open "release-m2\Meathead2-cheats.html" "npm run release:m2"
goto :eof
:m1html
call :open "release-m1\Meathead.html" "npm run release:m1"
goto :eof

:open
if not exist %1 (
  echo.
  echo   %~1 isn't built yet. Build it first with: %~2
  echo.
  pause
  goto :eof
)
start "" %1
goto :eof

:m2dev
set URL=http://localhost:3000/meathead2.html
goto dev
:m1dev
set URL=http://localhost:3000/
:dev
title Meathead dev server
rem Wait in the background until the server answers, then open the game. Close this window to stop the server.
start "" /b powershell -NoProfile -WindowStyle Hidden -Command "for ($i = 0; $i -lt 120; $i++) { try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 '%URL%' | Out-Null; Start-Process '%URL%'; break } catch { Start-Sleep -Seconds 1 } }"
call npm.cmd run dev
pause
