# 🛡️ Rakshak AI

**AI-powered legal contract analysis for India.**

Rakshak AI reads an Indian legal document, flags clauses that are unfair, unenforceable, or
void under **Indian law**, explains each one in plain English, and — crucially — suggests a
corrected clause you can actually use instead.

Every finding is grounded in Indian statute and precedent: the Indian Contract Act 1872,
Consumer Protection Act 2019, DPDP Act 2023, Arbitration & Conciliation Act 1996, MSMED Act
2006, GFR 2017, and Supreme Court authority such as *Percept D'Mark v. Zaheer Khan* and
*Fateh Chand v. Balkishan Das*.

> Rakshak AI provides **legal information, not legal advice**. Consult a practising advocate
> before acting on any analysis.

---

## How it works

1. **Choose your mode** — Personal, Enterprise, or Govt. Each applies a different lens.
2. **Upload a PDF** — rental agreement, offer letter, MSA, tender document.
3. **AI analyses it** — clause by clause, against Indian law, producing a fairness score.
4. **Review the findings** — risky clauses are highlighted **in light red directly on the PDF**,
   colour-coded by severity, with the offending statute cited.
5. **Get the fix** — each flagged clause comes with a suggested fair replacement, ready to copy.
6. **Ask questions** — the built-in legal assistant answers anything about your document,
   citing the specific clause and the governing Indian provision.

### The three modes

| Mode | For | Focuses on |
|------|-----|-----------|
| **Personal** | Citizens, tenants, employees | Excessive deposits, arbitrary eviction, unenforceable non-competes, forfeiture of dues, waived consumer remedies |
| **Enterprise** | Businesses | Uncapped indemnity, unlimited liability, IP overreach, MSMED 45-day payment breaches, invalid arbitrator appointment, DPDP gaps |
| **Govt** | Officials, auditors | GFR 2017 and CVC violations, restrictive eligibility, collusion indicators under the Competition Act 2002, Article 14 arbitrariness |

### Severity levels

- 🔴 **Fraud Risk** — void or unenforceable under Indian law (e.g. a blanket non-compete under s.27).
- 🟠 **Alert** — heavily one-sided and likely challengeable.
- 🔵 **Caution** — lawful, but worth negotiating.

---

## Tech Stack

**Frontend** — React 19, Vite, TailwindCSS, Framer Motion, Zustand, react-pdf-highlighter
**Backend** — Python, FastAPI, SQLAlchemy, PyMuPDF
**AI** — Groq API (`llama-3.3-70b-versatile`)
**Database** — SQLite locally, PostgreSQL in production

---

## Running locally

### Prerequisites
- Node.js 18+
- Python 3.10+
- A free Groq API key from [console.groq.com](https://console.groq.com)

### 1. Backend

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\Activate.ps1
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env        # then add your GROQ_API_KEY
uvicorn app.main:app --reload
```

API runs at `http://127.0.0.1:8000` — interactive docs at `/docs`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # defaults to http://localhost:8000
npm run dev
```

App runs at `http://localhost:5173`.

---

## Configuration

### Backend (`backend/.env`)

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `GROQ_API_KEY` | **Yes** | — | Groq API key for analysis and chat |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | Model to use |
| `ALLOWED_ORIGINS` | No | localhost dev ports | Comma-separated CORS origins |
| `DATABASE_URL` | No | local SQLite | Postgres URL in production |
| `UPLOAD_DIR` | No | `backend/uploads` | Where PDFs are stored |
| `MAX_UPLOAD_BYTES` | No | `15728640` (15 MB) | Upload size limit |

### Frontend (`frontend/.env`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | `http://localhost:8000` | Backend base URL |

---

## Deployment

A [`render.yaml`](render.yaml) blueprint is included — it provisions the API, a static
frontend, a Postgres database, and a persistent disk for uploads in one go.

1. Push to GitHub.
2. On [Render](https://render.com): **New → Blueprint**, select the repo.
3. Set `GROQ_API_KEY` in the dashboard (it is deliberately not in the blueprint).
4. After the first deploy, set the API's `ALLOWED_ORIGINS` to your frontend URL and the
   frontend's `VITE_API_URL` to your API URL, then redeploy.

**Important for any host:** uploads and SQLite must not live on ephemeral disk. Either mount
a persistent volume and point `UPLOAD_DIR` at it (as the blueprint does), or set `DATABASE_URL`
to a managed Postgres instance. Without this, documents vanish on restart.

The frontend ships SPA rewrite rules for both Render (`_redirects`) and Vercel (`vercel.json`),
so deep links like `/personal` survive a refresh.

---

## API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/health` | Health check and LLM configuration status |
| `POST` | `/api/v1/analyze` | Upload a PDF (`file`, `mode`) → `202` with `doc_id` |
| `GET` | `/api/v1/status/{doc_id}` | Poll analysis; returns clauses when `COMPLETED` |
| `GET` | `/api/v1/file/{doc_id}` | Stream the stored PDF |
| `POST` | `/api/v1/chat/{doc_id}` | Ask a question about the document |
| `DELETE` | `/api/v1/document/{doc_id}` | Delete a document and its file |

Analysis runs in the background: `/analyze` returns immediately with `202`, then the client
polls `/status` until `COMPLETED` or `FAILED`. Failures carry a human-readable `error`.

---

## Project structure

```
RakshakAI/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI routes, migrations
│   │   ├── config.py            # env-driven configuration
│   │   ├── models.py            # Document & Clause models
│   │   ├── database.py          # SQLite/Postgres engine
│   │   └── services/
│   │       ├── indian_law.py    # Indian statutes + prompt construction
│   │       ├── clause_analyzer.py
│   │       └── pdf_extractor.py # text + bounding boxes
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── lib/api.js           # API client, severity tokens
│       ├── pages/               # LandingPage, Workspace
│       ├── components/          # RiskFeed, HighlightViewer, LegalAssistant
│       └── store/               # Zustand state
└── render.yaml
```

## License

Proprietary — built for demonstration and specialised legal AI analysis in India.
