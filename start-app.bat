@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Resolve repo root based on this script's location
set ROOT=%~dp0
set BACKEND=%ROOT%backend
set FRONTEND=%ROOT%frontend

echo ROOT: %ROOT%
echo FRONTEND: %FRONTEND%
echo BACKEND: %BACKEND%

REM 1) Build frontend (blocks until finished)
echo.
echo === Building frontend ===
pushd "%FRONTEND%"
call npm run build
if errorlevel 1 (
  echo Frontend build failed. Exiting.
  popd
  exit /b 1
)
popd

echo.
echo === Starting backend and ngrok in separate windows ===

REM 2) Start backend API server in a new window
start "Backend" cmd /k "cd /d %BACKEND% && npm start"

REM 3) Start ngrok on port 5000 in a new window
start "ngrok" cmd /k "cd /d %ROOT% && ngrok http 5000"

echo.
echo All processes launched. You can close this window.
exit /b 0
