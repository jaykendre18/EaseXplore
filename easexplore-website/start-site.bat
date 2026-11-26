@echo off
rem Double-click this file to start the EaseXplore website on your computer.
cd /d "%~dp0"
echo.
echo Starting EaseXplore. Keep this window open while you use the site.
echo To stop the site, close this window or press Ctrl+C.
echo.
if not exist node_modules (
  echo First run: installing the project files. This takes a minute or two...
  call npm install
)
call npm run dev
pause
