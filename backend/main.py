from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from gemini_parser import parse_pdf_with_gemini

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(pdf: UploadFile = File(...)):
    content = await pdf.read()
    try:
        parsed_text = await parse_pdf_with_gemini(content)
        return JSONResponse(content={"data": parsed_text})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})