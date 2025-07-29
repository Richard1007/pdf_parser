from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from gemini_parser import parse_pdf_with_gemini, GeminiModel, get_available_models
import uvicorn
import traceback

app = FastAPI(title="PDF Parser API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "PDF Parser API is running"}

@app.get("/models")
async def get_models():
    """Get available Gemini models for the frontend"""
    models = get_available_models()
    return {
        "models": [
            {
                "value": model.value,
                "name": name,
                "description": description
            }
            for model, name, description in models
        ]
    }

@app.post("/upload")
async def upload_file(
    pdf: UploadFile = File(...),
    model: str = Form("gemini-2.5-pro")  # Default to Gemini 2.5 Pro
):
    if not pdf.filename.lower().endswith('.pdf'):
        return JSONResponse(
            status_code=400, 
            content={"error": "Only PDF files are allowed"}
        )
    
    try:
        # Validate and convert model string to enum
        try:
            selected_model = GeminiModel(model)
        except ValueError:
            return JSONResponse(
                status_code=400,
                content={"error": f"Invalid model: {model}. Available models: {[m.value for m in GeminiModel]}"}
            )
        
        print(f"Processing PDF: {pdf.filename}, size: {pdf.size} bytes with model: {selected_model.value}")
        content = await pdf.read()
        print(f"PDF content read successfully, length: {len(content)} bytes")
        
        parsed_text = await parse_pdf_with_gemini(content, selected_model)
        print(f"PDF parsed successfully, response length: {len(parsed_text)} characters")
        
        return JSONResponse(content={"data": parsed_text})
    except Exception as e:
        error_msg = f"Error processing PDF: {str(e)}"
        print(error_msg)
        print("Full traceback:")
        print(traceback.format_exc())
        return JSONResponse(
            status_code=500, 
            content={"error": error_msg}
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)