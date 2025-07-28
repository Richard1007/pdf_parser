#!/usr/bin/env python3
import requests
import time
import sys

def test_backend():
    """Test if backend is running"""
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running at http://localhost:8000")
            return True
    except requests.exceptions.RequestException:
        print("❌ Backend is not running at http://localhost:8000")
        return False

def test_frontend():
    """Test if frontend is running"""
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is running at http://localhost:3000")
            return True
    except requests.exceptions.RequestException:
        print("❌ Frontend is not running at http://localhost:3000")
        return False

def main():
    print("🔍 Testing PDF Parser Setup...")
    print("=" * 40)
    
    backend_ok = test_backend()
    frontend_ok = test_frontend()
    
    print("=" * 40)
    if backend_ok and frontend_ok:
        print("🎉 Both servers are running successfully!")
        print("\n📋 Next steps:")
        print("1. Open http://localhost:3000 in your browser")
        print("2. Upload a PDF file from the documents/ folder")
        print("3. Make sure you have a GEMINI_API_KEY in your .env file")
        print("\n📁 Available test PDFs:")
        print("- documents/22 08 00 - COMMISSIONING OF PLUMBING (Short).pdf")
        print("- documents/23 82 43 Electric Heaters.pdf")
        print("- documents/233000 HVAC Air Distribution (Long).pdf")
        print("- documents/271500 (Medium).pdf")
    else:
        print("❌ Some services are not running properly")
        if not backend_ok:
            print("   - Start backend: cd backend && python main.py")
        if not frontend_ok:
            print("   - Start frontend: cd frontend && npm run dev")

if __name__ == "__main__":
    main() 