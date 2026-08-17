@echo off
title CivicConnect AI Launcher
echo ===================================================
echo     Starting CivicConnect AI - Citizen Module
echo ===================================================
echo.

echo [1/2] Launching FastAPI Backend on http://localhost:8000 ...
start "CivicConnect Backend (Port 8000)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Launching React Frontend on http://localhost:5173 ...
start "CivicConnect Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo   Both services are starting in separate windows!
echo   - Citizen App: http://localhost:5173
echo   - Backend API Docs: http://localhost:8000/docs
echo ===================================================
echo.
timeout /t 5
