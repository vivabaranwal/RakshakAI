import logging
import os
import uuid

from fastapi import (
    FastAPI, UploadFile, File, Form, BackgroundTasks, Depends, HTTPException
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy import text, inspect as sa_inspect
from sqlalchemy.orm import Session
from groq import AsyncGroq

from . import models
from .config import (
    ALLOWED_ORIGINS, GROQ_API_KEY, GROQ_MODEL, MAX_UPLOAD_BYTES,
    UPLOAD_DIR, VALID_MODES,
)
from .database import engine, get_db, SessionLocal
from .services.clause_analyzer import analyze_contract_clauses, AnalysisError
from .services.indian_law import build_chat_prompt
from .services.pdf_extractor import extract_text_with_bounding_boxes, PdfReadError

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("rakshak")

models.Base.metadata.create_all(bind=engine)


def run_migrations():
    """Add columns introduced after the first release to existing databases."""
    added = {
        "documents": {
            "file_path": "TEXT",
            "mode": "TEXT DEFAULT 'Personal'",
            "error_message": "TEXT",
            "analysis_summary": "TEXT",
            # SQLite cannot add a column with a non-constant default, so this
            # backfills as NULL on existing rows; new rows get server_default.
            "created_at": "TIMESTAMP",
        },
        "clauses": {
            "page": "INTEGER DEFAULT 1",
            "fairness_score": "INTEGER DEFAULT 50",
            "severity": "TEXT DEFAULT 'CAUTION'",
            "legal_basis": "TEXT",
            "suggested_clause": "TEXT",
        },
    }
    inspector = sa_inspect(engine)
    existing_tables = set(inspector.get_table_names())

    for table, columns in added.items():
        if table not in existing_tables:
            continue
        present = {c["name"] for c in inspector.get_columns(table)}
        for name, ddl in columns.items():
            if name in present:
                continue
            try:
                with engine.connect() as conn:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {ddl}"))
                    conn.commit()
                logger.info("Migration: added %s.%s", table, name)
            except Exception:
                # One failed column shouldn't abort the rest.
                logger.exception("Migration failed for %s.%s", table, name)


run_migrations()

app = FastAPI(title="Rakshak AI API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


def _resolve_upload(stored_name: str) -> str:
    """
    Resolve a stored filename to an absolute path inside UPLOAD_DIR.

    Legacy rows hold absolute paths from the dev machine; newer rows hold a
    bare filename. Normalising here keeps old documents working after deploy,
    and confines every lookup to UPLOAD_DIR so a crafted value can't escape it.
    """
    if not stored_name:
        return ""
    candidate = os.path.abspath(os.path.join(UPLOAD_DIR, os.path.basename(stored_name)))
    if os.path.commonpath([candidate, UPLOAD_DIR]) != UPLOAD_DIR:
        return ""
    return candidate


async def process_document_task(doc_id: int, file_path: str, mode: str):
    """Background analysis. Records FAILED with a reason instead of failing silently."""
    db: Session = SessionLocal()
    try:
        blocks = extract_text_with_bounding_boxes(file_path)
        result = await analyze_contract_clauses(blocks, mode)

        doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
        if not doc:
            logger.warning("Document %s vanished before analysis completed", doc_id)
            return

        doc.status = "COMPLETED"
        doc.risk_score = float(result.get("risk_score", 0.0))
        doc.analysis_summary = result.get("analysis_summary", "")
        doc.error_message = None

        for c in result.get("clauses", []):
            db.add(models.Clause(
                document_id=doc.id,
                clause_type=c.get("type", "OTHER"),
                severity=c.get("severity", "CAUTION"),
                content=c.get("text", ""),
                legal_basis=c.get("legal_basis", ""),
                suggested_clause=c.get("suggested_clause", ""),
                bounding_box=c.get("bbox"),
                page=c.get("page", 1),
                fairness_score=int(c.get("fairness_score", 50)),
                plain_explanation=c.get("explanation", ""),
                is_red_flag=c.get("severity") in ("FRAUD", "ALERT"),
            ))
        db.commit()
        logger.info("Document %s analysed: %s clause(s)", doc_id, len(result.get("clauses", [])))

    except (AnalysisError, PdfReadError, FileNotFoundError, ValueError) as exc:
        db.rollback()
        _mark_failed(db, doc_id, str(exc))
    except Exception:
        db.rollback()
        # Full traceback goes to the logs; the user gets a safe message.
        logger.exception("Unexpected failure analysing document %s", doc_id)
        _mark_failed(
            db, doc_id,
            "An unexpected error occurred while analysing this document. Please try again.",
        )
    finally:
        db.close()


def _mark_failed(db: Session, doc_id: int, message: str):
    try:
        doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
        if doc:
            doc.status = "FAILED"
            doc.error_message = message[:500]
            db.commit()
        logger.error("Document %s failed: %s", doc_id, message)
    except Exception:
        logger.exception("Could not record failure for document %s", doc_id)


@app.get("/api/v1/health")
def health():
    return {"status": "ok", "llm_configured": bool(GROQ_API_KEY)}


@app.post("/api/v1/analyze", status_code=202)
async def analyze_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    mode: str = Form("Personal"),
    db: Session = Depends(get_db),
):
    if mode not in VALID_MODES:
        raise HTTPException(400, f"Invalid mode. Expected one of {', '.join(VALID_MODES)}.")

    filename = file.filename or "document.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported.")

    contents = await file.read()
    if not contents:
        raise HTTPException(400, "The uploaded file is empty.")
    if len(contents) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            413, f"File too large. Maximum size is {MAX_UPLOAD_BYTES // (1024 * 1024)} MB."
        )
    if not contents.startswith(b"%PDF"):
        raise HTTPException(400, "This file is not a valid PDF.")

    doc = models.Document(title=filename, mode=mode, status="PROCESSING")
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Store only the basename; the directory comes from config at read time so
    # the same row works on any machine or dyno.
    stored_name = f"{doc.id}_{uuid.uuid4().hex[:8]}.pdf"
    abs_path = os.path.join(UPLOAD_DIR, stored_name)
    with open(abs_path, "wb") as fh:
        fh.write(contents)

    doc.file_path = stored_name
    db.commit()

    background_tasks.add_task(process_document_task, doc.id, abs_path, mode)

    return {
        "status": "success",
        "doc_id": doc.id,
        "mode": mode,
        "message": "Document analysis started.",
    }


@app.get("/api/v1/status/{doc_id}")
def check_status(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(404, "Document not found.")

    if doc.status == "FAILED":
        return {
            "status": "FAILED",
            "error": doc.error_message or "Analysis failed.",
        }

    if doc.status != "COMPLETED":
        return {"status": doc.status}

    clauses = (
        db.query(models.Clause)
        .filter(models.Clause.document_id == doc_id)
        .order_by(models.Clause.fairness_score.asc())
        .all()
    )
    return {
        "status": "COMPLETED",
        "data": {
            "risk_score": doc.risk_score,
            "mode": doc.mode,
            "title": doc.title,
            "analysis_summary": doc.analysis_summary or f"{len(clauses)} risk(s) detected.",
            "clauses": [
                {
                    "id": c.id,
                    "type": c.clause_type,
                    "severity": c.severity or "CAUTION",
                    "text": c.content,
                    "bbox": c.bounding_box,
                    "legal_basis": c.legal_basis or "",
                    "suggested_clause": c.suggested_clause or "",
                    "explanation": c.plain_explanation or "",
                    "fairness_score": (
                        c.fairness_score if c.fairness_score is not None else 50
                    ),
                    "page": c.page or 1,
                }
                for c in clauses
            ],
        },
    }


@app.get("/api/v1/file/{doc_id}")
def get_document_file(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(404, "Document not found.")

    path = _resolve_upload(doc.file_path)
    if not path or not os.path.exists(path):
        raise HTTPException(404, "The document file is no longer available on the server.")

    return FileResponse(path, media_type="application/pdf", filename=doc.title or "document.pdf")


@app.delete("/api/v1/document/{doc_id}", status_code=204)
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(404, "Document not found.")

    path = _resolve_upload(doc.file_path)
    if path and os.path.exists(path):
        try:
            os.remove(path)
        except OSError:
            logger.exception("Could not delete file for document %s", doc_id)

    db.delete(doc)
    db.commit()
    return None


class ChatRequest(BaseModel):
    query: str = Field(min_length=1, max_length=2000)


@app.post("/api/v1/chat/{doc_id}")
async def chat_with_document(
    doc_id: int, request: ChatRequest, db: Session = Depends(get_db)
):
    if not GROQ_API_KEY:
        raise HTTPException(503, "The legal assistant is not configured on this server.")

    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        raise HTTPException(404, "Document not found.")

    path = _resolve_upload(doc.file_path)
    if not path or not os.path.exists(path):
        raise HTTPException(404, "The document file is no longer available for chat.")

    try:
        blocks = extract_text_with_bounding_boxes(path)
    except PdfReadError as exc:
        raise HTTPException(422, str(exc))
    except Exception:
        logger.exception("Text extraction failed during chat for document %s", doc_id)
        raise HTTPException(422, "Could not read the text of this document.")

    full_text = "\n".join(b["text"] for b in blocks)[:24000]

    # Ground the assistant in the analysis already produced, so answers about
    # risk stay consistent with what the user sees in the risk feed.
    clauses = db.query(models.Clause).filter(models.Clause.document_id == doc_id).all()
    if clauses:
        findings = "\n".join(
            f"- [{c.severity}] {c.clause_type}: {c.plain_explanation} "
            f"(Basis: {c.legal_basis})"
            for c in clauses
        )
        full_text += f"\n\nPREVIOUSLY IDENTIFIED RISKS IN THIS DOCUMENT:\n{findings}"

    try:
        client = AsyncGroq(api_key=GROQ_API_KEY)
        response = await client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": build_chat_prompt(doc.mode or "Personal", full_text)},
                {"role": "user", "content": request.query},
            ],
            temperature=0.2,
        )
        return {"answer": response.choices[0].message.content}
    except Exception:
        logger.exception("Chat completion failed for document %s", doc_id)
        raise HTTPException(502, "The legal assistant is temporarily unavailable. Please try again.")
