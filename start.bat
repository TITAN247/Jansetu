@echo off
echo ============================================
echo      JanSetu AI - Startup Script
echo ============================================
echo.

:: Check if Python is available
py --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.10+
    pause
    exit /b 1
)

:: Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

:: Install backend dependencies if needed
echo [1/3] Checking backend dependencies...
if not exist backend\__pycache__ (
    cd backend
    pip install -r requirements.txt
    cd ..
)

:: Install frontend dependencies if needed
echo [2/3] Checking frontend dependencies...
if not exist frontend\node_modules (
    cd frontend
    npm install
    cd ..
)

:: Start the application
echo [3/3] Starting JanSetu AI...
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

:: Run the Python startup script
py start.py

pause
