# ArogyaGPT

Multilingual Medical Report Simplification and Intelligent Health Assistant.

## Overview
ArogyaGPT is a state-of-the-art intelligent health assistant designed to simplify complex medical reports into easy-to-understand language. It leverages modern LLMs and a robust Retrieval-Augmented Generation (RAG) architecture to provide contextual explanations, multi-lingual support, and abnormal condition detection.

## Architecture

```text
+-------------------+       HTTP/REST       +------------------+
|                   | <-------------------> |                  |
|   React + Vite    |                       |     FastAPI      |
|   (Frontend)      |                       |    (Backend)     |
|                   |                       |                  |
+---------+---------+                       +--------+---------+
          |                                          |
          | WebSocket (Chat)                         | SQLAlchemy / asyncpg
          |                                          v
+---------v---------+                       +------------------+
|                   |                       |                  |
|    ElevenLabs/    |                       |   PostgreSQL DB  |
|    Web Speech API |                       |   + Redis Cache  |
|    (TTS / Voice)  |                       |                  |
+-------------------+                       +--------+---------+
                                                     |
                                                     | LangChain + FAISS
                                                     v
                                            +------------------+
                                            |                  |
                                            |  LLM (Groq) &    |
                                            |  Embeddings      |
                                            |                  |
                                            +------------------+
```

## Features
- **Medical Report Simplification:** Upload complex medical PDFs and receive simplified, layman-friendly summaries.
- **Multilingual Support:** Translation support for various Indian languages using Google Translate / IndicTrans2.
- **Abnormal Detection:** Hybrid rule-based and LLM-driven detection of critical health issues from reports.
- **Interactive Chat (RAG):** Ask questions about your uploaded medical report and get precise answers backed by FAISS vector search.
- **Voice Capabilities:** Text-to-Speech (TTS) integration for accessible health insights.

## Folder Structure

```text
.
├── backend/                  # FastAPI Application
│   ├── app/                  
│   │   ├── api/v1/routes/    # API endpoints (auth, reports, chat)
│   │   ├── core/             # App configs, security, JWT
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # Business logic (PDF extraction, translation)
│   │   ├── ai/               # LangChain, RAG, Prompts
│   │   └── db/               # Database sessions and setup
│   ├── alembic/              # Database migrations
│   └── tests/                # Pytest unit tests
│
└── frontend/                 # React + TypeScript + Vite Application
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Page-level components
    │   ├── hooks/            # Custom React hooks (useAuth, useReport)
    │   ├── services/         # API integration methods
    │   ├── store/            # Zustand state management
    │   └── i18n/             # Multilingual JSON files
    └── public/               # Static assets
```

## API Endpoints (v1)

| Method | Endpoint                        | Description                           |
|--------|---------------------------------|---------------------------------------|
| `POST` | `/api/v1/reports/upload`        | Uploads a PDF medical report          |
| `GET`  | `/api/v1/reports/{id}`          | Retrieves an uploaded report          |
| `POST` | `/api/v1/reports/{id}/simplify` | Generates a layman summary            |
| `POST` | `/api/v1/chat/ask`              | Chat with RAG regarding the report    |
| `POST` | `/api/v1/auth/login`            | Authenticates user & returns JWT      |

## Environment Variables Reference

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/arogyagpt
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key
GOOGLE_TRANSLATE_API_KEY=your-google-translate-api-key
AWS_S3_BUCKET=your-s3-bucket-name
FAISS_INDEX_PATH=./faiss_index
SPACY_MODEL=en_core_web_sm
HUGGINGFACE_MODEL=all-MiniLM-L6-v2
TTS_PROVIDER=gtts
```

## Setup Instructions

### Option 1: Using Docker (Recommended)
1. Clone the repository.
2. Setup your `backend/.env` file.
3. Run the following command from the root directory:
   ```bash
   docker-compose up --build
   ```
4. Access Frontend at `http://localhost:5173`
5. Access API Docs at `http://localhost:8000/docs`

### Option 2: Local Development Setup
**Backend:**
1. Navigate to the `backend/` directory.
2. Install dependencies: `pip install -r requirements.txt`
3. Download spaCy model: `python -m spacy download en_core_web_sm`
4. Start the server: `uvicorn app.main:app --reload`

**Frontend:**
1. Navigate to the `frontend/` directory.
2. Install packages: `npm install`
3. Start the dev server: `npm run dev`
