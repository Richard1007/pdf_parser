import base64
import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv()

async def parse_pdf_with_gemini(file_content: bytes) -> str:
    encoded = base64.b64encode(file_content).decode()
    prompt = """Extract structured information from the uploaded PDF and return ONLY a valid JSON object. 
    
    The JSON should include:
    - title: The document title
    - sections: Array of main sections with their content
    - key_points: Important points from the document
    - metadata: Any relevant metadata like dates, authors, etc.
    
    Return ONLY the JSON object, no additional text or formatting. Ensure the JSON is valid and properly formatted."""

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
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={os.getenv('GEMINI_API_KEY')}"

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, json=body, headers=headers)
        result = response.json()
        
        if response.status_code != 200:
            raise Exception(f"Gemini API error: {result.get('error', {}).get('message', 'Unknown error')}")
        
        content = result['candidates'][0]['content']['parts'][0]['text']
        
        # Try to extract JSON from the response
        try:
            # Remove any markdown formatting if present
            content = content.strip()
            if content.startswith('```json'):
                content = content[7:]
            if content.endswith('```'):
                content = content[:-3]
            content = content.strip()
            
            # Parse and validate JSON
            json_data = json.loads(content)
            # Return pretty-printed JSON
            return json.dumps(json_data, indent=2, ensure_ascii=False)
        except json.JSONDecodeError:
            # If it's not valid JSON, return the raw content
            return content
