import base64
import httpx
import os
import json
from dotenv import load_dotenv
from enum import Enum

load_dotenv()

class GeminiModel(Enum):
    """Available Gemini models for PDF parsing"""
    GEMINI_2_5_PRO = "gemini-2.5-pro"  # Strongest
    GEMINI_2_5_FLASH = "gemini-2.5-flash"  # Reasoning and speed balance
    GEMINI_2_0_FLASH_LITE = "gemini-2.0-flash-lite"  # Cost effective

# Model descriptions for user reference
MODEL_DESCRIPTIONS = {
    GeminiModel.GEMINI_2_5_PRO: "Strongest - Best performance for complex parsing tasks",
    GeminiModel.GEMINI_2_5_FLASH: "Reasoning and speed balance - Good performance with faster response",
    GeminiModel.GEMINI_2_0_FLASH_LITE: "Cost effective - Budget-friendly option for simpler documents"
}

async def parse_pdf_with_gemini(file_content: bytes, model: GeminiModel = GeminiModel.GEMINI_2_5_FLASH) -> str:
    """
    Parse PDF using the specified Gemini model
    
    Args:
        file_content: PDF file content as bytes
        model: Selected Gemini model (defaults to Gemini 2.5 Flash - reasoning and speed balance)
    
    Returns:
        Parsed JSON string
    """
    try:
        print(f"Starting PDF processing with {model.value}, file size: {len(file_content)} bytes")
        print(f"Model description: {MODEL_DESCRIPTIONS[model]}")
        
        # Hardcoded 5-minute timeout
        timeout_seconds = 600
        print(f"File size: {len(file_content) / (1024 * 1024):.2f} MB, using timeout: {timeout_seconds} seconds")
        
        encoded = base64.b64encode(file_content).decode()
        print(f"PDF encoded to base64, length: {len(encoded)} characters")

        prompt = '''You are a parsing engine that converts construction specification PDFs into structured JSON.

⚠️ Do not infer, hallucinate, or generate content not explicitly present in the provided PDF.

Your only source of truth is the actual text content extracted from the uploaded PDF. If a section, part, or clause does not exist in the file, do not invent it.

---

Your job is to extract only the technical specification content starting from "PART 1 - GENERAL", and return this strictly formatted JSON:

{
  "section": "string",     // Section number from the heading, e.g. "233000"
  "name": "string",        // Section title from the heading, e.g. "HVAC AIR DISTRIBUTION"
  "part1": {
    "partItems": [
      {
        "index": "1.01",
        "text": "SUMMARY",
        "children": [
          {
            "index": "A.",
            "text": "Section includes...",
            "children": null
          }
        ]
      }
    ]
  },
  "part2": {
    "partItems": [...]
  },
  "part3": {
    "partItems": [...]
  }
}

📌 Format Rules:
- Use only text that is part of the technical specification. Ignore headers, footers, text on cover pages and other miscellaneous metadata. 
- Preserve all numbering (e.g. 1.01, A., 1., a.)
- If a clause contains subclauses, use the `"children"` field (same format), otherwise use `"children": null`
- If a part (e.g. part2) does not exist in the PDF, return `"part2": { "partItems": [] }`

Only return the structured JSON. No commentary, no assumptions.
'''

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
            raise Exception("GEMINI_API_KEY not found in environment variables")
        
        # Use the selected model in the API URL
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model.value}:generateContent?key={api_key}"
        print(f"Making request to Gemini API using {model.value} with {timeout_seconds}s timeout...")

        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            response = await client.post(url, json=body, headers=headers)
            print(f"Gemini API response status: {response.status_code}")
            
            result = response.json()
            print(f"Gemini API response received, length: {len(str(result))} characters")

            if response.status_code != 200:
                error_message = result.get('error', {}).get('message', 'Unknown error')
                print(f"Gemini API error: {error_message}")
                raise Exception(f"Gemini API error: {error_message}")

            content = result['candidates'][0]['content']['parts'][0]['text']
            print(f"Extracted content from Gemini response, length: {len(content)} characters")

            try:
                content = content.strip()
                if content.startswith('```json'):
                    content = content[7:]
                if content.endswith('```'):
                    content = content[:-3]
                content = content.strip()

                json_data = json.loads(content)
                formatted_json = json.dumps(json_data, indent=2, ensure_ascii=False)
                print(f"JSON successfully formatted, length: {len(formatted_json)} characters")
                return formatted_json
            except json.JSONDecodeError as json_error:
                print(f"JSON parsing error: {json_error}")
                print(f"Raw content: {content[:200]}...")
                return content
                
    except httpx.ReadTimeout:
        print(f"Timeout error: Gemini API took too long to respond (>{timeout_seconds}s)")
        raise Exception(f"PDF processing timed out after {timeout_seconds} seconds. Try with a smaller PDF file.")
    except Exception as e:
        print(f"Error in parse_pdf_with_gemini: {str(e)}")
        raise e

def get_available_models():
    """
    Get list of available Gemini models with descriptions
    
    Returns:
        List of tuples containing (model_enum, model_name, description)
    """
    return [
        (GeminiModel.GEMINI_2_5_PRO, "Gemini 2.5 Pro", MODEL_DESCRIPTIONS[GeminiModel.GEMINI_2_5_PRO]),
        (GeminiModel.GEMINI_2_5_FLASH, "Gemini 2.5 Flash", MODEL_DESCRIPTIONS[GeminiModel.GEMINI_2_5_FLASH]),
        (GeminiModel.GEMINI_2_0_FLASH_LITE, "Gemini 2.0 Flash Lite", MODEL_DESCRIPTIONS[GeminiModel.GEMINI_2_0_FLASH_LITE])
    ]
