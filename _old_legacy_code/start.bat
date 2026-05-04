@echo off
chcp 65001 >nul
title Swim Academy System
cd /d "%~dp0"
echo ========================================
echo    Swim Academy Management System
echo ========================================
echo.
echo    Server URL: http://localhost:3000
echo    Tip: Press Ctrl+C to stop the server
echo.
node server.js
echo.
echo ========================================
echo    Server stopped. Press any key to exit
echo ========================================
pause >nul