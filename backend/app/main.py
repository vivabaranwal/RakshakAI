from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from .services.pdf_extractor import extract_text_with_bounding_boxes
from .services.clause_analyzer import analyze_contract_clauses
import shutil
import os

app = FastAPI(title="Rakshak AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development; restrict to your ports in production
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/analyze")
async def analyze_pdf(file: UploadFile = File(...), mode: str = Form("Public")):
    # 1. Save file
    os.makedirs("app/uploads", exist_ok=True)
    file_path = f"app/uploads/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Extract & Analyze
    blocks = extract_text_with_bounding_boxes(file_path)
    result = await analyze_contract_clauses(blocks, mode)

    # 3. Cleanup
    os.remove(file_path)
    
    return {
        "status": "success",
        "data": result
    }