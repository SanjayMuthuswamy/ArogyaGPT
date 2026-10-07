# ArogyaGPT

> **Multilingual AI-powered Medical Report Simplification & Intelligent Health Assistant**

ArogyaGPT helps Indian patients understand their medical reports in their native language. Upload a PDF or image of any medical report and get an AI-generated plain-language explanation, abnormality detection, risk analysis, interactive Q&A, and a downloadable structured PDF — all in **10 languages**.

---

## ✨ Features

| Feature | Details |
|---|---|
| 📄 **Report Upload** | PDF & image (JPG/PNG/TIFF) support; multi-file upload |
| 🌐 **10 Languages** | English, Tamil, Hindi, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi |
| 🤖 **AI Simplification** | Groq LLM (Llama 3) — plain-language explanations grounded in your report |
| 🔬 **Lab Analysis** | Parameter extraction, reference-range comparison, abnormality flagging |
| 🧠 **RAG-powered Chat** | FAISS vector store + retrieval augmented generation for contextual Q&A |
| 📊 **Dashboard** | Paginated report list, risk-level summary, quick stats |
| 📜 **Report History** | Filterable, searchable, sortable history with pagination |
| 🖨️ **PDF Export** | Structured ArogyaGPT-branded PDF with full AI analysis & lab results |
| 🔊 **Text-to-Speech** | Web Speech API with Indian-language voice support; 1.1× speed |
| 🔒 **Auth** | JWT-based authentication; HIPAA-compliant session messages |

---

## 🏗️ Architecture

```
┌─────────────────────┐   HTTP / REST    ┌──────────────────────┐
│   React + TypeScript │ ◄──────────────► │   FastAPI (Python)   │
│   Vite 5 (Frontend)  │                 │   Async + SQLAlchemy │
└─────────────────────┘                  └──────────┬───────────┘
                                                     │
                          ┌──────────────────────────┼─────────────────────────┐
                          │                          │                         │
                   ┌──────▼──────┐          ┌────────▼────────┐       ┌───────▼──────┐
                   │  PostgreSQL  │          │  FAISS Vector   │       │   Groq LLM   │
                   │  (SQLite in  │          │  Store (RAG)    │       │  (Llama 3)   │
                   │   dev mode)  │          └─────────────────┘       └──────────────┘
                   └─────────────┘
                          │
                   ┌──────▼──────┐
                   │  Redis Cache │  (optional — degrades gracefully)
                   └─────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- A [Groq API key](https://console.groq.com/)

### Backend

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt

# Copy and fill in your .env
cp .env.example .env

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Production with Docker Compose

The Compose deployment serves the production Vite build with Nginx, proxies API
requests to FastAPI, starts PostgreSQL and Redis, and applies Alembic migrations
before starting the API and workers.

1. Install Docker Engine with the Compose plugin.
2. Copy `.env.example` to `.env` and replace every placeholder. Keep the
   PostgreSQL password alphanumeric so it can be used safely in the database
   URL, and make sure the password in `DATABASE_URL` matches
   `POSTGRES_PASSWORD`.
3. Copy `backend/.env.example` to `backend/.env`. Set the real AI provider key
   and any other provider credentials there; do not use the development
   defaults in production.
4. Set `ALLOWED_HOSTS` and `CORS_ORIGINS` in the root `.env` to the actual
   production hostnames, formatted as JSON arrays.
5. Put the published port 80 behind a TLS-terminating load balancer or reverse
   proxy. Do not expose the app publicly over plain HTTP.
6. Start and check the services:

   ```bash
   docker compose config
   docker compose up --build -d
   docker compose ps
   ```

   The frontend health endpoint is `/healthz`; the API liveness endpoint is
   `/health/live`. PostgreSQL and Redis are intentionally not published to the
   host. Flower is bound to loopback only.

The Compose stack is a self-hosted deployment baseline, not a substitute for
production operations work: configure HTTPS, backups, monitoring, secret
rotation, and durable/private storage appropriate to your hosting provider
before handling real patient data.

---

## ⚙️ Environment Variables

Create `backend/.env` based on the table below:

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ | Your Groq API key |
| `GROQ_MODEL_NAME` | ✅ | e.g. `llama3-70b-8192` or `llama-3.1-70b-versatile` |
| `GROQ_MAX_TOKENS` | ✅ | Max tokens per LLM call (e.g. `4096`) |
| `GROQ_TEMPERATURE` | ✅ | LLM temperature (e.g. `0.3`) |
| `DATABASE_URL` | ✅ | PostgreSQL DSN e.g. `postgresql+asyncpg://user:pass@localhost/arogyagpt` |
| `SECRET_KEY` | ✅ | Random secret for JWT signing |
| `UPLOAD_DIR` | ✅ | Directory to store uploaded files (e.g. `./uploads`) |
| `FAISS_INDEX_PATH` | ✅ | Path to persist FAISS vector index (e.g. `./faiss_index`) |
| `TTS_OUTPUT_DIR` | Optional | Directory for TTS audio cache |
| `REDIS_URL` | Optional | Redis DSN — if absent, caching is disabled gracefully |
| `ALLOWED_ORIGINS` | Optional | CORS origins e.g. `http://localhost:5173` |

---

## 📡 API Reference

Base URL: `http://localhost:8000/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login, returns JWT token |
| `POST` | `/reports/upload` | Upload one or more report files |
| `GET` | `/reports/` | List all reports (pagination: `page`, `per_page`) |
| `GET` | `/reports/{id}` | Get full report detail |
| `DELETE` | `/reports/{id}` | Delete a report |
| `POST` | `/chat/ask` | Ask a question (`question`, `report_id`, `language_code`) |

---

## 🌐 Supported Languages

| Code | Language | Script |
|---|---|---|
| `en` | English | Latin |
| `ta` | Tamil | தமிழ் |
| `hi` | Hindi | हिन्दी |
| `te` | Telugu | తెలుగు |
| `kn` | Kannada | ಕನ್ನಡ |
| `ml` | Malayalam | മലയാളം |
| `bn` | Bengali | বাংলা |
| `mr` | Marathi | मराठी |
| `gu` | Gujarati | ગુજરાતી |
| `pa` | Punjabi | ਪੰਜਾਬੀ |

---

## 🗂️ Project Structure

```
ArogyaGPT/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI routers (auth, reports, chat)
│   │   ├── core/         # Config, logging, exceptions
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   └── services/     # llm_service, rag_service, pdf_parser, ocr
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/   # AuthenticatedShell, ChatPanel, PdfExportContent
│   │   ├── hooks/        # useSpeech (TTS), useAuth
│   │   ├── pages/        # Dashboard, History, Upload, ReportView, Chat
│   │   └── services/     # api.ts (Axios client)
│   ├── index.html
│   └── vite.config.ts
└── README.md
```

---

## 🛡️ Disclaimer

ArogyaGPT AI responses are educational and informational only. They do **not** constitute formal clinical or diagnostic advice. Always consult a qualified healthcare professional for medical decisions.

---

## 📄 License

MIT © 2024 ArogyaGPT Contributors
