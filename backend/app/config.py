"""Central configuration. Everything env-driven so deploys don't need code edits."""
import os
from dotenv import load_dotenv

load_dotenv()

# --- Paths -------------------------------------------------------------
# All uploads live under one directory, resolved once. On PaaS set
# UPLOAD_DIR to a mounted volume; otherwise it defaults next to the app.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.abspath(os.getenv("UPLOAD_DIR", os.path.join(BASE_DIR, "uploads")))
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- Database ----------------------------------------------------------
# Postgres on deploy (DATABASE_URL), SQLite locally. Heroku-style postgres://
# URLs need rewriting for SQLAlchemy 2.x.
_db_url = os.getenv("DATABASE_URL", "")
if _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql://", 1)
DATABASE_URL = _db_url or f"sqlite:///{os.path.join(BASE_DIR, 'rakshak.db')}"

# --- LLM ---------------------------------------------------------------
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# --- CORS --------------------------------------------------------------
# Comma-separated list of allowed origins. "*" only if explicitly set.
_origins = os.getenv("ALLOWED_ORIGINS", "").strip()
if _origins:
    ALLOWED_ORIGINS = [o.strip() for o in _origins.split(",") if o.strip()]
else:
    ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
    ]

# --- Upload limits -----------------------------------------------------
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", 15 * 1024 * 1024))  # 15 MB

# --- Analysis modes ----------------------------------------------------
VALID_MODES = ("Personal", "Enterprise", "Govt")
