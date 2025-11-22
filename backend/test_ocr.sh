#!/bin/bash

# Test OCR Functionality Script
# This script helps diagnose OCR issues

echo "=== OCR Functionality Test ==="
echo ""

# Check if tesseract is installed
echo "1. Checking Tesseract OCR installation..."
if command -v tesseract &> /dev/null; then
    tesseract --version
    echo "✓ Tesseract is installed"
else
    echo "✗ Tesseract NOT installed"
    echo "  Install with: sudo apt-get install tesseract-ocr"
    exit 1
fi

echo ""

# Check Python packages
echo "2. Checking Python packages..."
python3 -c "import pytesseract; print('✓ pytesseract installed')" 2>/dev/null || echo "✗ pytesseract NOT installed"
python3 -c "from PIL import Image; print('✓ PIL (Pillow) installed')" 2>/dev/null || echo "✗ Pillow NOT installed"
python3 -c "import httpx; print('✓ httpx installed')" 2>/dev/null || echo "✗ httpx NOT installed"

echo ""

# Check environment variables
echo "3. Checking environment variables..."
if [ -f "/mnt/c/Users/asus/HackHatch-Corelia/backend/.env" ]; then
    echo "✓ .env file exists"
    if grep -q "OPENROUTER_API_KEY" /mnt/c/Users/asus/HackHatch-Corelia/backend/.env; then
        echo "✓ OPENROUTER_API_KEY is set"
    else
        echo "✗ OPENROUTER_API_KEY not found in .env"
    fi
else
    echo "✗ .env file not found"
fi

echo ""

# Test simple OCR
echo "4. Testing OCR with sample text..."
echo "Creating test image..."

# Create a simple test image with text
python3 << 'PYTHON_CODE'
from PIL import Image, ImageDraw, ImageFont
import os

# Create a simple white image with black text
img = Image.new('RGB', (400, 200), color='white')
d = ImageDraw.Draw(img)

# Add some text
text = """Grocery Bill
Milk 1L x 10 @ $3.99
Bread x 5 @ $2.49
Eggs 12pk x 8 @ $4.99
"""

d.text((10, 10), text, fill='black')
test_image_path = '/tmp/test_grocery_bill.png'
img.save(test_image_path)
print(f"✓ Test image created: {test_image_path}")
PYTHON_CODE

# Try OCR on test image
python3 << 'PYTHON_CODE'
import pytesseract
from PIL import Image

test_image_path = '/tmp/test_grocery_bill.png'
try:
    img = Image.open(test_image_path)
    text = pytesseract.image_to_string(img)
    print("✓ OCR extraction successful!")
    print("Extracted text:")
    print(text)
except Exception as e:
    print(f"✗ OCR failed: {e}")
PYTHON_CODE

echo ""
echo "5. Testing OpenRouter API..."
python3 << 'PYTHON_CODE'
import os
import asyncio
import httpx

async def test_openrouter():
    api_key = os.getenv('OPENROUTER_API_KEY', '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')
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": "meta-llama/llama-3.1-8b-instruct:free",
        "messages": [{"role": "user", "content": "Say 'API test successful' if you can read this."}],
        "max_tokens": 50
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                print("✓ OpenRouter API is working!")
                result = response.json()
                content = result.get('choices', [{}])[0].get('message', {}).get('content', '')
                print(f"Response: {content}")
            else:
                print(f"✗ OpenRouter API error: {response.status_code}")
                print(f"Response: {response.text}")
    except Exception as e:
        print(f"✗ OpenRouter API call failed: {e}")

asyncio.run(test_openrouter())
PYTHON_CODE

echo ""
echo "=== Test Complete ==="
echo ""
echo "If all tests passed (✓), OCR should work correctly."
echo "If any tests failed (✗), fix those issues first."
echo ""
echo "To test the full system:"
echo "1. Start backend: cd /mnt/c/Users/asus/HackHatch-Corelia/backend && uvicorn app.main:app --reload"
echo "2. Upload an image via the OCR Upload page"
echo "3. Check backend console for detailed logs"
