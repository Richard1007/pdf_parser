# 📄 PDF Parser

A full-stack app to extract structured JSON from construction spec PDFs using Gemini models.

---

## ⚙️ Prerequisites

- Python 3.9+
- Node.js 18+
- Gemini API Key

---

## 🔧 Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
echo "GEMINI_API_KEY=your_api_key_here" > .env
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🚀 Run

- Backend: http://localhost:8000
- Frontend: http://localhost:3000

Upload a PDF, select a model, and view structured JSON.

---

## 🐛 Troubleshooting

- Check `.env` for API key
- Backend must run before frontend
- PDFs must be under 50MB
