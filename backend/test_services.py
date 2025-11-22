"""
Quick test script to verify OCR and LLM services are working
Run this from the backend directory: python test_services.py
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.ocr_service import OCRService
from app.utils.llm_service import LLMService
from PIL import Image, ImageDraw, ImageFont
import io

async def test_ocr():
    print("=" * 60)
    print("Testing OCR Service")
    print("=" * 60)
    
    # Create a test image
    print("\n1. Creating test image with grocery items...")
    img = Image.new('RGB', (600, 400), color='white')
    d = ImageDraw.Draw(img)
    
    text = """GROCERY STORE
Receipt #12345

Milk 1L         10    $3.99
Bread White     15    $2.49
Eggs 12pk        8    $4.99
Tomatoes 1kg    20    $5.99

Total: $197.60
Thank you!"""
    
    d.text((20, 20), text, fill='black')
    
    # Convert to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes = img_bytes.getvalue()
    
    print(f"   Created test image: {len(img_bytes)} bytes")
    
    # Test OCR
    print("\n2. Running OCR extraction...")
    result = await OCRService.process_image(img_bytes)
    
    if result.get('success'):
        print(f"   ✓ OCR Success!")
        print(f"   Extracted text ({len(result['text'])} chars):")
        print("   " + "-" * 50)
        print("   " + result['text'][:300].replace('\n', '\n   '))
        print("   " + "-" * 50)
        print(f"   Confidence: {result.get('confidence', 0):.1f}%")
        print(f"   Lines extracted: {len(result.get('lines', []))}")
        return result
    else:
        print(f"   ✗ OCR Failed: {result.get('error')}")
        return None

async def test_llm(ocr_text):
    print("\n" + "=" * 60)
    print("Testing LLM Service")
    print("=" * 60)
    
    api_key = os.getenv('OPENROUTER_API_KEY', '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')
    
    print(f"\n1. API Key: {api_key[:20]}...")
    
    llm_service = LLMService(api_key=api_key)
    
    print(f"\n2. Parsing OCR text with LLM...")
    items = await llm_service.parse_ocr_text_to_items(ocr_text)
    
    if items:
        print(f"   ✓ LLM Success! Extracted {len(items)} items:")
        for i, item in enumerate(items, 1):
            print(f"   {i}. {item.get('name')} - Qty: {item.get('quantity')} - Price: ${item.get('price')} - Cat: {item.get('category')}")
    else:
        print("   ✗ LLM Failed: No items extracted")
    
    return items

async def test_regex_parsing(ocr_result):
    print("\n" + "=" * 60)
    print("Testing Regex Parsing (Fallback)")
    print("=" * 60)
    
    print("\n1. Parsing with regex patterns...")
    items = OCRService.parse_grocery_items(ocr_result)
    
    if items:
        print(f"   ✓ Regex Success! Extracted {len(items)} items:")
        for i, item in enumerate(items, 1):
            print(f"   {i}. {item.get('name')} - Qty: {item.get('quantity')} - Price: ${item.get('price')} - Cat: {item.get('category')}")
    else:
        print("   ✗ Regex Failed: No items extracted")
    
    return items

async def main():
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║" + " " * 10 + "OCR + LLM Services Test Suite" + " " * 18 + "║")
    print("╚" + "=" * 58 + "╝")
    
    # Test OCR
    ocr_result = await test_ocr()
    
    if not ocr_result or not ocr_result.get('success'):
        print("\n❌ OCR test failed. Please check:")
        print("   1. Is tesseract installed? Run: tesseract --version")
        print("   2. Is pytesseract installed? Run: pip install pytesseract")
        print("   3. Is PIL/Pillow installed? Run: pip install Pillow")
        return
    
    ocr_text = ocr_result.get('text', '')
    
    # Test LLM
    llm_items = await test_llm(ocr_text)
    
    # Test Regex Parsing
    regex_items = await test_regex_parsing(ocr_result)
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    print(f"OCR:   {'✓ Working' if ocr_result and ocr_result.get('success') else '✗ Failed'}")
    print(f"LLM:   {'✓ Working' if llm_items else '✗ Failed'}")
    print(f"Regex: {'✓ Working' if regex_items else '✗ Failed'}")
    
    if llm_items or regex_items:
        print("\n✓ System is functional! At least one parsing method works.")
    else:
        print("\n❌ Both LLM and Regex parsing failed.")
        print("   The system will fall back to demo data.")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    asyncio.run(main())
