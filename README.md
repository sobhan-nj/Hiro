# Resume Analyzer

AI-powered CV analysis tool specialized for German healthcare professionals (physicians, pharmacists, nurses, etc.). Upload a resume and receive a structured, 14-dimension assessment with tiered scoring, priority fixes, and rewrite suggestions.

## Architecture

```
resume-analyzer/
├── backend/               # Python FastAPI
│   ├── main.py            # API entry point (lifespan, CORS, Sentry)
│   ├── config.py          # Centralized env config
│   ├── llm_client.py      # Multi-provider LLM abstraction
│   ├── system_prompt.txt  # 542-line expert analysis prompt
│   ├── core/
│   │   ├── parser.py      # PDF/DOCX text extraction + keyword detection
│   │   ├── analyzer.py    # Prompt builder + LLM orchestrator
│   │   └── schema.py      # Dataclasses for analysis report
│   ├── db/
│   │   └── database.py    # SQLAlchemy async ORM (aiosqlite)
│   └── utils/
│       ├── file_storage.py # CV file persistence
│       └── log.py         # Loguru + stdout/stderr capture
├── frontend/              # React 18 + Vite 8
│   └── src/
│       ├── App.jsx        # Upload → Loading → Results flow
│       ├── api/client.js  # Axios wrapper
│       └── components/    # UploadForm, LoadingScreen, ResultsView, DimensionCard
├── talent-pool/           # Saved CV files by seniority
└── .env                   # Environment variables
```

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and fill in your API key:

```bash
copy ..\.env.example ..\.env
```

Start the server:

```bash
uvicorn backend.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api/*` to `localhost:8000`.

### Admin Dashboard

Navigate to `/admin` to access the admin dashboard. Enter your `ADMIN_API_KEY` to:

- View all analyzed candidates in a sortable table
- Click a candidate to see full analysis (tier, verdict, dimensions, rewrites)
- Download the original CV file
- Filter and manage the talent pool

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `ENVIRONMENT` | No | `development` | `development` or `production` |
| `LLM_PROVIDER` | No | `openai` | `openai`, `gemini`, `anthropic`, `avalai`, `mimo` |
| `LLM_MODEL` | No | `gpt-4o` | Model name sent to provider |
| `OPENAI_API_KEY` | If OpenAI | — | OpenAI API key |
| `GEMINI_API_KEY` | If Gemini | — | Google Gemini API key |
| `ANTHROPIC_API_KEY` | If Anthropic | — | Anthropic API key |
| `AVALAI_API_KEY` | If AvalAI | — | AvalAI API key |
| `MIMO_API_KEY` | If MiMo | — | MiMo API key |
| `ADMIN_API_KEY` | No | `dev-admin-key` | Key for admin endpoints |
| `ANALYSIS_API_KEY` | No | (empty) | If set, `/analyze` requires this key via `x-api-key` header |
| `CORS_ALLOWED_ORIGINS` | No | localhost | Comma-separated allowed origins |
| `DATABASE_URL` | No | `sqlite+aiosqlite:///./talent_pool.db` | Async database URL |
| `TALENT_POOL_ROOT` | No | `./talent-pool` | Directory for saved CV files |
| `SENTRY_DSN` | No | (empty) | Sentry error tracking DSN |

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | None | Database + config health check |
| `POST` | `/analyze` | Optional `x-api-key` | Upload a CV, get 14-dimension analysis |
| `GET` | `/admin/candidates` | `x-admin-key` | List all analyzed candidates |
| `GET` | `/admin/candidates/{id}` | `x-admin-key` | Get candidate detail + full analysis |
| `GET` | `/admin/candidates/{id}/download` | `x-admin-key` | Download original CV file |

### `POST /analyze`

**Form data:**
- `file` (required) — PDF or DOCX file, max 10MB
- `seniority` (optional) — `junior`, `mid`, `senior`, or `executive` (default: `mid`)

**Header (optional):**
- `x-api-key` — Required if `ANALYSIS_API_KEY` is set

**Rate limit:** 10 requests per minute per IP.

## Analysis Dimensions

| Code | Dimension | Priority |
|---|---|---|
| L1 | Layout, Readability & ATS Compatibility | P1 |
| L2 | Professional Network Presence | P2 |
| C1 | Bullet Quality & Ownership Signals | P1 |
| C2 | Grammar, Spelling & Consistency | P1 |
| C3 | Professional Summary | P2 (P1 for foreign-trained) |
| C4 | Section Order & Hierarchy | P1 |
| C5 | Gap & Risk Management | P1 |
| C6 | Impact & "So What?" | P1 |
| C7 | Keyword Density & Domain Alignment | P2 (P1 for German HC) |
| C8 | Relevance & Recency | P3 |
| C9 | Fluffy Content, Buzzwords & Jargon | P2 |
| C10 | Soft Skills Integration | P3 |
| C11 | Additional Context (languages, certs) | P3 |
| C12 | Signature & Formalities (German convention) | P2 |

Each dimension receives a rating (1-5), summary, list of issues, and actionable fixes. The final output includes a **tier** (Needs Work → Top 10%), **priority fixes**, and **suggested rewrites**.
