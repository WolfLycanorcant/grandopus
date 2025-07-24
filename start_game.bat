@echo off
title Grand Opus Tactical War Game - Gradio Launcher

echo.
echo ========================================
echo   Grand Opus Tactical War Game
echo   Gradio Community Launcher
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed or not in PATH
    echo Please install Node.js which includes npm
    pause
    exit /b 1
)

echo ✅ Python and Node.js found
echo.
echo 🚀 Starting the game launcher...
echo.
echo This will:
echo   1. Install Python dependencies if needed
echo   2. Install Node.js dependencies if needed  
echo   3. Start your React app
echo   4. Launch Gradio with public sharing enabled
echo.
echo 🌐 You'll get a public URL you can share with anyone!
echo.

REM Run the startup script
python start_gradio.py

echo.
echo 🛑 Game launcher stopped
pause