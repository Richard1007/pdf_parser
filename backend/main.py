from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from gemini_parser import parse_pdf_with_gemini
import uvicorn

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

@app.post("/upload")
async def upload_file(pdf: UploadFile = File(...)):
    if not pdf.filename.lower().endswith('.pdf'):
        return JSONResponse(
            status_code=400, 
            content={"error": "Only PDF files are allowed"}
        )
    
    try:
        content = await pdf.read()
        parsed_text = await parse_pdf_with_gemini(content)
        return JSONResponse(content={"data": parsed_text})
    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        return JSONResponse(
            status_code=500, 
            content={"error": f"Error processing PDF: {str(e)}"}
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)