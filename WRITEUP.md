# PDF Parser - Technical Overview

## 1. Architecture

- **Frontend (Next.js + TypeScript)**: Handles file upload, model selection, and JSON display
- **Backend (FastAPI)**: Receives PDF and model, forwards to AI model
- **AI (Gemini API)**: Extracts structured JSON content from PDF using prompt

## 2. Workflow

1. User uploads PDF via frontend
2. Backend validates and encodes the file
3. Gemini API parses it and returns structured JSON
4. Frontend renders and allows downloading of output

## 3. Assumptions

- Input is a construction specification PDF
- Max size: 50MB
- Gemini can parse directly from PDF (no OCR needed)
- Document follows MasterFormat structure (sections, parts, numbered hierarchy)

## 4. Limitations

- Currently limited to single-file processing to maintain simplicity and clean UI/UX.
- Relies on consistent document structure (e.g., 1.01 → A. → 1. → a.) for accurate parsing.
- Gemini models may misinterpret or overlook content near images, charts, or scanned elements.
- Uses a fixed JSON schema; generalizability can be enhanced with more diverse samples.

## 5. Future Work

- Support for adaptive schemas to handle varying document formats.
- Enable batch PDF uploads and concurrent processing.
- Implement result caching and schema validation mechanisms.
- Currently default to Gemini 2.5 Flash for best balance after testing: 2.5 Pro is too slow on long documents, and 1.5 lacks accuracy.

## 6. Evaluation

- Speed, accuracy, cost, error handling
