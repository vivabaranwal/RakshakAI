import os
import fitz # PyMuPDF

def extract_text_with_bounding_boxes(pdf_path: str):
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found at {pdf_path}")
        
    doc = fitz.open(pdf_path)
    extracted_blocks = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        page_dict = page.get_text("dict")
        page_w, page_h = page_dict.get("width"), page_dict.get("height")
        
        for b in page_dict.get("blocks", []):
            if b.get("type") == 0: # Text block
                block_text = " ".join([s.get("text", "") for l in b.get("lines", []) for s in l.get("spans", [])]).strip()
                
                if not block_text: continue
                    
                bbox = b["bbox"] # [x0, y0, x1, y1]
                extracted_blocks.append({
                    "text": block_text,
                    "page": page_num + 1,
                    "bbox": {
                        "x1": bbox[0], "y1": bbox[1],
                        "x2": bbox[2], "y2": bbox[3],
                        "width": page_w, "height": page_h
                    }
                })
                
    doc.close()
    return extracted_blocks