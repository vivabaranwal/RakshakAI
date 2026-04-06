from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from .services.pdf_extractor import extract_text_with_bounding_boxes
from .services.clause_analyzer import analyze_contract_clauses
from sqlalchemy.orm import Session
from .database import engine, get_db, SessionLocal
from . import models
import shutil
import os

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Rakshak AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development; restrict to your ports in production
    allow_methods=["*"],
    allow_headers=["*"],
)

async def process_document_task(doc_id: int, file_path: str, mode: str):
    db: Session = SessionLocal()
    try:
        # Extract & Analyze
        blocks = extract_text_with_bounding_boxes(file_path)
        result = await analyze_contract_clauses(blocks, mode)

        # Update Document record
        doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
        if doc:
            doc.status = "COMPLETED"
            doc.risk_score = float(result.get("risk_score", 0.0))
            
            # Save Clause objects
            for clause_data in result.get("clauses", []):
                clause = models.Clause(
                    document_id=doc.id,
                    clause_type=clause_data.get("type", "UNKNOWN"),
                    content=clause_data.get("text", ""),
                    bounding_box=clause_data.get("bbox", None),
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
        # Cleanup file
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/api/v1/analyze")
async def analyze_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    mode: str = Form("Public"),
    db: Session = Depends(get_db)
):
    # 1. Save DB record
    doc = models.Document(
        title=file.filename,
        status="PROCESSING"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # 2. Save file
    os.makedirs("app/uploads", exist_ok=True)
    file_path = f"app/uploads/{doc.id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 3. Trigger background task
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
                "type": c.clause_type,
                "text": c.content,
                "bbox": c.bounding_box,
                "explanation": c.plain_explanation,
                "fairness_score": 0 if c.is_red_flag else 100,
                "page": 1 # Fallback, as usually present in bbox
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