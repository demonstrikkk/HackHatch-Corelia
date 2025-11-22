# Quick Start Guide - Testing OCR Integration

## 1. Start Backend Server (WSL Terminal)

```bash
cd /mnt/c/Users/asus/HackHatch-Corelia/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 2. Start Frontend Server (PowerShell/Another Terminal)

```bash
cd C:\Users\asus\HackHatch-Corelia\frontend
npm run dev
```

## 3. Test the OCR Flow

### Option A: Via UI
1. Open browser: http://localhost:5173
2. Login/Signup as seller
3. Navigate to "OCR Upload" page
4. Upload a grocery bill image
5. Click "Scan & Extract"
6. Review extracted items (editable)
7. Click "Save to Inventory"

### Option B: Test Sample Bill

Create a simple test image or use this sample text saved as image:

```
GROCERY STORE
Date: 2024-11-23

Milk 1L         x 10    @ $3.99
Bread White     x 15    @ $2.49
Eggs 12pk       x 8     @ $4.99
Tomatoes 1kg    x 20    @ $5.99
Chicken Breast  x 12    @ $12.99

Total Items: 5
```

## 4. Verify the Flow

### Expected Behavior:

1. **Upload Image** ✓
   - File selected and shown with size

2. **Scan & Extract** ✓
   - Shows "Processing..." notification
   - OCR extracts text from image
   - LLM parses text into items
   - Shows "Success" notification

3. **Review Items** ✓
   - Items displayed in editable table
   - Each item has: name, category, quantity, price
   - Can edit any field

4. **Save to Inventory** ✓
   - Items saved to database
   - Shows success notification
   - Form resets

### Check Console Logs:

**Backend (WSL terminal):**
```
INFO: OCR processing started
INFO: Text extracted: [text preview]
INFO: LLM parsing started
INFO: Extracted 5 items
INFO: 200 POST /api/inventory/ocr-scan
```

**Frontend (Browser Console):**
```
Processing image with backend OCR
OCR Success! Found 5 items
Items: [{name: "Milk 1L", ...}, ...]
```

## 5. Troubleshooting

### Backend not starting?
```bash
# Check if port 8000 is available
lsof -i :8000

# Install missing dependencies
pip install -r requirements.txt
```

### Frontend not starting?
```powershell
# Install dependencies
npm install

# Clear cache
rm -r node_modules
npm install
```

### OCR returns demo data?
- This is normal fallback behavior
- Check if tesseract is installed: `tesseract --version`
- Install if needed: `sudo apt-get install tesseract-ocr`

### LLM not parsing correctly?
- Check .env file has OPENROUTER_API_KEY
- Check backend logs for API errors
- System will fallback to regex parsing automatically

## 6. API Key Configuration

Make sure backend `.env` file exists with:
```env
OPENROUTER_API_KEY=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
```

Already configured! ✓

## 7. Test API Directly

```bash
# Get auth token first (replace with your credentials)
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@test.com","password":"password123"}' \
  | jq -r '.access_token')

# Test OCR endpoint
curl -X POST http://localhost:8000/api/inventory/ocr-scan \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@grocery_bill.jpg" \
  | jq
```

## 8. Success Indicators

✅ Backend running on port 8000
✅ Frontend running on port 5173
✅ Can upload image files
✅ OCR extracts text from image
✅ LLM parses items correctly
✅ Items are editable
✅ Items save to inventory
✅ Fallback to demo data works

## Next Steps

Once verified:
- Test with real grocery bills
- Fine-tune LLM prompt for better accuracy
- Add more categories
- Implement batch processing
