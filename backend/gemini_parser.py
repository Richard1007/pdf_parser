import base64
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def parse_pdf_with_gemini(file_content: bytes) -> str:
    encoded = base64.b64encode(file_content).decode()
    prompt = "Extract structured information from the uploaded PDF."

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
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={os.getenv('GEMINI_API_KEY')}"

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=body, headers=headers)
        result = response.json()
        return result['candidates'][0]['content']['parts'][0]['text']
