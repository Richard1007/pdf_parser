#!/usr/bin/env python3
import asyncio
import base64
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def test_gemini_api_with_pdf(pdf_path: str):
    """Test Gemini API with a PDF file"""
    print(f"🔍 Testing Gemini API with: {pdf_path}")
    
    # Check if file exists
    if not os.path.exists(pdf_path):
        print(f"❌ File not found: {pdf_path}")
        return
    
    # Read PDF file
    try:
        with open(pdf_path, 'rb') as f:
            file_content = f.read()
        print(f"✅ PDF loaded: {len(file_content)} bytes")
    except Exception as e:
        print(f"❌ Error reading PDF: {e}")
        return
    
    # Encode to base64
    encoded = base64.b64encode(file_content).decode()
    print(f"✅ PDF encoded to base64: {len(encoded)} characters")
    
    # Prepare request
    prompt = "Extract structured information from the uploaded PDF. Return a JSON object with key details like title, sections, key points, etc."
    
    body = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {
                        "inlineData": {
                            "mimeType": "application/pdf",
                            "data": encoded
                        }
                    }
                ]
            }
        ]
    }
    
    headers = {"Content-Type": "application/json"}
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        print("❌ GEMINI_API_KEY not found in .env file")
        return
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={api_key}"
    
    print(f"🌐 Making request to Gemini API...")
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, json=body, headers=headers)
            
            print(f"📊 Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ API call successful!")
                
                # Extract the text content
                if 'candidates' in result and len(result['candidates']) > 0:
                    content = result['candidates'][0]['content']['parts'][0]['text']
                    print("\n📄 Parsed Content:")
                    print("=" * 50)
                    print(content)
                    print("=" * 50)
                    
                    # Save to file for inspection
                    output_file = f"test_output_{os.path.basename(pdf_path)}.txt"
                    with open(output_file, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"💾 Output saved to: {output_file}")
                else:
                    print("❌ No content in response")
                    print("Response:", result)
            else:
                print(f"❌ API call failed with status {response.status_code}")
                print("Response:", response.text)
                
    except Exception as e:
        print(f"❌ Error making API call: {e}")

async def main():
    """Main test function"""
    print("🧪 Testing Gemini API Integration")
    print("=" * 50)
    
    # Test with a small PDF first
    test_pdf = "../documents/22 08 00 - COMMISSIONING OF PLUMBING (Short).pdf"
    
    if os.path.exists(test_pdf):
        await test_gemini_api_with_pdf(test_pdf)
    else:
        print(f"❌ Test PDF not found: {test_pdf}")
        print("Available PDFs in documents folder:")
        documents_dir = "../documents"
        if os.path.exists(documents_dir):
            for file in os.listdir(documents_dir):
                if file.endswith('.pdf'):
                    print(f"  - {file}")

if __name__ == "__main__":
    asyncio.run(main()) 