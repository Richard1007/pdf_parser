#!/usr/bin/env python3
import requests
import os
import json

def test_backend_api():
    """Test the backend API endpoint with a PDF upload"""
    print("🧪 Testing Backend API Endpoint")
    print("=" * 50)
    
    # Test PDF file
    pdf_path = "../documents/22 08 00 - COMMISSIONING OF PLUMBING (Short).pdf"
    
    if not os.path.exists(pdf_path):
        print(f"❌ Test PDF not found: {pdf_path}")
        return
    
    # Prepare the upload
    url = "http://localhost:8000/upload"
    
    try:
        with open(pdf_path, 'rb') as f:
            files = {'pdf': (os.path.basename(pdf_path), f, 'application/pdf')}
            
            print(f"📤 Uploading {os.path.basename(pdf_path)} to backend...")
            response = requests.post(url, files=files, timeout=120)
            
            print(f"📊 Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Backend API call successful!")
                
                # Check if the response is valid JSON
                try:
                    parsed_data = json.loads(result['data'])
                    print("✅ Response is valid JSON!")
                    
                    # Save the response
                    output_file = f"backend_test_output_{os.path.basename(pdf_path)}.json"
                    with open(output_file, 'w', encoding='utf-8') as f:
                        json.dump(parsed_data, f, indent=2, ensure_ascii=False)
                    print(f"💾 JSON response saved to: {output_file}")
                    
                    # Show a preview
                    print("\n📄 JSON Preview:")
                    print("=" * 30)
                    print(json.dumps(parsed_data, indent=2, ensure_ascii=False)[:500] + "...")
                    print("=" * 30)
                    
                except json.JSONDecodeError:
                    print("⚠️ Response is not valid JSON, showing raw content:")
                    print(result['data'][:500] + "...")
                    
            else:
                print(f"❌ Backend API call failed with status {response.status_code}")
                print("Response:", response.text)
                
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server. Make sure it's running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error testing backend API: {e}")

if __name__ == "__main__":
    test_backend_api() 