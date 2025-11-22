# CORELIA - Quick Start Script
Write-Host "🚀 Starting CORELIA Platform..." -ForegroundColor Cyan

# Check if MongoDB is running
Write-Host "`n📊 Checking MongoDB..." -ForegroundColor Yellow
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if (!$mongoProcess) {
    Write-Host "⚠️  MongoDB is not running. Please start MongoDB first." -ForegroundColor Red
    Write-Host "Run: mongod --dbpath <your-db-path>" -ForegroundColor Yellow
    exit
}
Write-Host "✅ MongoDB is running" -ForegroundColor Green

# Start Backend
Write-Host "`n🔧 Starting Backend (FastAPI)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; if (!(Test-Path venv)) { python -m venv venv }; .\venv\Scripts\Activate.ps1; pip install -r requirements.txt -q; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "`n🎨 Starting Frontend (Vite + React)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm install; npm run dev"

Write-Host "`n✨ CORELIA is starting up!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C in each terminal to stop the servers`n" -ForegroundColor Gray
