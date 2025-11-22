# Import Delhi NCR Stores Data into MongoDB
# This script imports the shop data from delhi_ncr_stores_data.csv

Write-Host "🚀 Delhi NCR Stores Data Import Script" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if in correct directory
if (-not (Test-Path "delhi_ncr_stores_data.csv")) {
    Write-Host "❌ Error: delhi_ncr_stores_data.csv not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Check if MongoDB is running (optional check)
Write-Host "📋 Checking MongoDB connection..." -ForegroundColor Yellow
$mongoCheck = Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet -WarningAction SilentlyContinue
if (-not $mongoCheck) {
    Write-Host "⚠️  Warning: MongoDB might not be running on localhost:27017" -ForegroundColor Yellow
    Write-Host "The import will continue, but may fail if MongoDB is not accessible." -ForegroundColor Yellow
    Write-Host ""
}

# Navigate to backend directory
Write-Host "📂 Navigating to backend directory..." -ForegroundColor Yellow
Set-Location backend

# Check if virtual environment exists
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
    & "venv\Scripts\Activate.ps1"
} else {
    Write-Host "⚠️  No virtual environment found. Using global Python." -ForegroundColor Yellow
}

# Install dependencies if needed
Write-Host "📦 Ensuring dependencies are installed..." -ForegroundColor Yellow
pip install motor python-dotenv pymongo --quiet

Write-Host ""
Write-Host "🔄 Starting data import..." -ForegroundColor Green
Write-Host ""

# Run the import script
python import_shops_data.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Data import completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start the backend server: cd backend; uvicorn app.main:app --reload" -ForegroundColor White
    Write-Host "2. Test the API: http://localhost:8000/api/shops" -ForegroundColor White
    Write-Host "3. View API docs: http://localhost:8000/docs" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Import failed! Check the error messages above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "- MongoDB not running: Start MongoDB service" -ForegroundColor White
    Write-Host "- Wrong .env settings: Check MONGODB_URL in backend/.env" -ForegroundColor White
    Write-Host "- Missing dependencies: Run 'pip install -r requirements.txt'" -ForegroundColor White
}

# Go back to root directory
Set-Location ..
