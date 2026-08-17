# CivicConnect AI PowerShell Starter Script
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    Starting CivicConnect AI - Citizen Module" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Launching FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; python -m uvicorn app.main:app --reload --port 8000"

Write-Host "[2/2] Launching React Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm.cmd run dev"

Write-Host ""
Write-Host "Done! You can access:" -ForegroundColor Green
Write-Host "  - Citizen Web App: http://localhost:5173" -ForegroundColor Green
Write-Host "  - FastAPI Swagger: http://localhost:8000/docs" -ForegroundColor Green
