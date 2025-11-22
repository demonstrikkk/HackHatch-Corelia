# OCR Integration Guide

## Overview
The OCR system uses a two-step approach:
1. **OCR Text Extraction**: Uses Tesseract OCR (pytesseract) to extract raw text from bill/invoice images
2. **LLM Parsing**: Uses OpenRouter API with Llama 3.1 to intelligently parse the extracted text into structured grocery items

## Setup Instructions

### Backend Setup

1. **Install Tesseract OCR** (Required for pytesseract to work):

   **Windows:**
   - Download from: https://github.com/UB-Mannheim/tesseract/wiki
   - Install and add to PATH
   - Or use: `choco install tesseract` (if you have Chocolatey)

   **Linux:**
   ```bash
   sudo apt-get install tesseract-ocr
   ```

   **Mac:**
   ```bash
   brew install tesseract
   ```

2. **Install Python Dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Configure Environment:**
   - The `.env` file is already created with the OpenRouter API key
   - Key: `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`

4. **Start Backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. **Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

## How It Works

### Upload Flow
1. User uploads a bill/invoice image (JPG, PNG, PDF)
2. Frontend sends image to backend `/api/inventory/ocr-scan` endpoint
3. Backend process:
   - **Step 1**: Tesseract OCR extracts raw text from image
   - **Step 2**: LLM (Llama 3.1 via OpenRouter) parses text into structured items
   - **Fallback 1**: If LLM fails, regex-based parser attempts extraction
   - **Fallback 2**: If all fails, returns demo data
4. Frontend displays extracted items in editable table
5. User can review/edit items before saving to inventory

### OCR Service (`backend/app/utils/ocr_service.py`)
- Uses `pytesseract` for OCR
- Extracts text with confidence scores
- Provides regex-based parsing as fallback
- Categorizes items automatically (Dairy, Bakery, Produce, etc.)

### LLM Service (`backend/app/utils/llm_service.py`)
- Uses OpenRouter API
- Model: `meta-llama/llama-3.1-8b-instruct:free`
- Parses OCR text into JSON format
- Handles various bill formats intelligently
- Categorizes items and extracts: name, quantity, price, category

### API Response Format
```json
{
  "success": true,
  "items": [
    {
      "name": "Milk 1L",
      "quantity": 10,
      "price": 3.99,
      "category": "Dairy"
    }
  ],
  "total_items": 1,
  "ocr_confidence": 85.5,
  "raw_text": "Extracted text preview...",
  "parsed_by": "llm",
  "message": "Successfully extracted 1 items from bill"
}
```

## Supported Bill Formats

The LLM parser can handle various formats:
- Standard grocery bills with item lists
- Invoices with product codes
- Receipts with different layouts
- Multi-column formats
- Various separators (spaces, dashes, etc.)

## Categories

Items are automatically categorized into:
- Dairy (milk, cheese, yogurt, eggs, etc.)
- Bakery (bread, cakes, pastries, etc.)
- Produce (vegetables, fruits)
- Meat (chicken, beef, pork, fish, etc.)
- Beverages (juice, soda, water, etc.)
- Snacks (chips, candy, chocolate, etc.)
- Packaged (canned goods, jars, etc.)
- Other (uncategorized items)

## Testing

To test the OCR system:

1. Go to Seller Dashboard → OCR Upload
2. Upload a bill image
3. Click "Scan & Extract"
4. Review extracted items
5. Edit if needed
6. Click "Save to Inventory"

## Troubleshooting

### "Tesseract not found" error
- Make sure Tesseract is installed and in PATH
- Restart terminal after installation

### LLM parsing fails
- System will automatically fall back to regex parser
- Check OpenRouter API key is valid
- Check internet connection

### No items extracted
- Ensure image is clear and readable
- Try different image format (PNG vs JPG)
- Check image orientation
- System will provide demo data as fallback

## API Key Management

The OpenRouter API key is stored in `backend/.env`:
```
OPENROUTER_API_KEY=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
```

To use a different API key:
1. Get a key from https://openrouter.ai
2. Update the `.env` file
3. Restart the backend server
