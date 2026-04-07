from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from .services.pdf_extractor import extract_text_with_bounding_boxes
from .services.clause_analyzer import analyze_contract_clauses
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect as sa_inspect
from .database import engine, get_db, SessionLocal
from . import models
from groq import AsyncGroq
from dotenv import load_dotenv
import shutil
import os

load_dotenv()

models.Base.metadata.create_all(bind=engine)

# --- Schema Migrations for existing DBs ---
def run_migrations():
    inspector = sa_inspect(engine)
    if "documents" in inspector.get_table_names():
        doc_cols = {c["name"] for c in inspector.get_columns("documents")}
        with engine.connect() as conn:
            if "file_path" not in doc_cols:
                conn.execute(text("ALTER TABLE documents ADD COLUMN file_path TEXT"))
                conn.commit()
    if "clauses" in inspector.get_table_names():
        cl_cols = {c["name"] for c in inspector.get_columns("clauses")}
        with engine.connect() as conn:
            if "page" not in cl_cols:
                conn.execute(text("ALTER TABLE clauses ADD COLUMN page INTEGER DEFAULT 1"))
                conn.commit()
            if "fairness_score" not in cl_cols:
                conn.execute(text("ALTER TABLE clauses ADD COLUMN fairness_score INTEGER DEFAULT 50"))
                conn.commit()

try:
    run_migrations()
except Exception:
    pass

app = FastAPI(title="Rakshak AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


async def process_document_task(doc_id: int, file_path: str, mode: str):
    db: Session = SessionLocal()
    try:
        blocks = extract_text_with_bounding_boxes(file_path)
        result = await analyze_contract_clauses(blocks, mode)

        doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
        if doc:
            doc.status = "COMPLETED"
            doc.risk_score = float(result.get("risk_score", 0.0))

            for clause_data in result.get("clauses", []):
                clause = models.Clause(
                    document_id=doc.id,
                    clause_type=clause_data.get("type", "UNKNOWN"),
                    content=clause_data.get("text", ""),
                    bounding_box=clause_data.get("bbox", None),
                    page=clause_data.get("page", 1),
                    fairness_score=int(clause_data.get("fairness_score", 50)),
                    plain_explanation=clause_data.get("explanation", ""),
                    is_red_flag=(clause_data.get("fairness_score", 100) < 50)
                )
                db.add(clause)
            db.commit()
    except Exception as e:
        db.rollback()
        doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
        if doc:
            doc.status = "FAILED"
            db.commit()
    finally:
        db.close()
        # NOTE: File is NOT deleted — needed for chat and file serving


@app.post("/api/v1/analyze")
async def analyze_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    mode: str = Form("Public"),
    db: Session = Depends(get_db)
):
    doc = models.Document(title=file.filename, status="PROCESSING")
    db.add(doc)
    db.commit()
    db.refresh(doc)

    os.makedirs("app/uploads", exist_ok=True)
    file_path = os.path.abspath(f"app/uploads/{doc.id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    doc.file_path = file_path
    db.commit()

    background_tasks.add_task(process_document_task, doc.id, file_path, mode)

    return {
        "status": "success",
        "doc_id": doc.id,
        "message": "Document analysis started in the background."
    }


@app.get("/api/v1/status/{doc_id}")
def check_status(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        return {"status": "error", "message": "Document not found"}

    if doc.status == "COMPLETED":
        clauses = db.query(models.Clause).filter(models.Clause.document_id == doc_id).all()
        formatted_clauses = [
            {
                "id": c.id,
                "type": c.clause_type,
                "text": c.content,
                "bbox": c.bounding_box,
                "explanation": c.plain_explanation,
                "fairness_score": c.fairness_score if c.fairness_score is not None else (0 if c.is_red_flag else 100),
                "page": c.page or 1,
            } for c in clauses
        ]
        return {
            "status": doc.status,
            "data": {
                "risk_score": doc.risk_score,
                "clauses": formatted_clauses,
                "analysis_summary": f"{len(formatted_clauses)} risk(s) detected via API."
            }
        }
    return {"status": doc.status}


@app.get("/api/v1/file/{doc_id}")
def get_document_file(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc or not doc.file_path or not os.path.exists(doc.file_path):
        return {"error": "File not found"}
    return FileResponse(doc.file_path, media_type="application/pdf", filename=doc.title)


class ChatRequest(BaseModel):
    query: str


@app.post("/api/v1/chat/{doc_id}")
async def chat_with_document(doc_id: int, request: ChatRequest, db: Session = Depends(get_db)):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        return {"error": "Document not found"}

    if not doc.file_path or not os.path.exists(doc.file_path):
        return {"error": "Document file not available for chat"}

    blocks = extract_text_with_bounding_boxes(doc.file_path)
    full_text = "\n".join([b["text"] for b in blocks])[:8000]

    try:
        client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are Rakshak AI Legal Assistant, an expert in Indian contract law. "
                        "Based on the following contract text, answer the user's question clearly and concisely. "
                        "If the answer cannot be found in the contract, say so. "
                        "Always reference specific clauses or sections when possible.\n\n"
                        f"Contract Text:\n{full_text}"
                    )
                },
                {"role": "user", "content": request.query}
            ],
            temperature=0.3,
        )
        answer = response.choices[0].message.content
        return {"answer": answer}
    except Exception as e:
        return {"error": f"Chat failed: {str(e)}"}