import os
import shutil
import uuid
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from app.services.pdf_extractor import extract_text_with_bounding_boxes
from app.services.clause_analyzer import analyze_contract_clauses

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
    # 1. Save File
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")
    
    # 1. Save File
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")
    
    content = await file.read()
    with open(file_path, "wb") as buffer:
        buffer.write(content)
        
    # 2. Extract Text & Bounding Boxes using PyMuPDF
    text_blocks = extract_text_with_bounding_boxes(file_path)
    
    # 3. Analyze for Risky Clauses via Keywords
    analysis_result = analyze_contract_clauses(text_blocks)
    
    # 4. Return Structured Result
    return JSONResponse(content={
        "status": "success",
        "file_id": file_id,
        "filename": file.filename,
        "risk_score": analysis_result["risk_score"],
        "clauses": analysis_result["clauses"]
    })

# Keep mock for explanations just in case
from pydantic import BaseModel
class ExplanationRequest(BaseModel):
    clause_text: str
    persona: str

@router.post("/explain")
def mock_saullm_explain(request: ExplanationRequest):
    return {
        "explanation": f"As a {request.persona}, this means they can kick you out very fast.",
        "risk_level": "HIGH"
    }
