import os
import fitz # PyMuPDF

def extract_text_with_bounding_boxes(pdf_path: str):
    """
    Extracts text blocks and their bounding boxes from a PDF.
    Returns: list of dicts with text, page (1-indexed), and bbox.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found at {pdf_path}")
        
    doc = fitz.open(pdf_path)
    extracted_blocks = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        
        # 'dict' provides precise coordinate boundaries per text block
        page_dict = page.get_text("dict")
        page_w = page_dict.get("width", 600)
        page_h = page_dict.get("height", 800)
        
        blocks = page_dict.get("blocks", [])
        
        for b in blocks:
            # Type 0 is text (Type 1 is image)
            if b.get("type", 1) == 0:
                block_text = ""
                for line in b.get("lines", []):
                    for span in line.get("spans", []):
                        block_text += span.get("text", "") + " "
                
                block_text = block_text.strip()
                if not block_text:
                    continue
                    
                bbox = b["bbox"] # [x0, y0, x1, y1] -> Map to x1,y1,x2,y2 for highlight js
                
                extracted_blocks.append({
                    "text": block_text,
                    "page": page_num + 1,
                    "bbox": {
                        "x1": bbox[0],
                        "y1": bbox[1],
                        "x2": bbox[2],
                        "y2": bbox[3],
                        "width": page_w,
                        "height": page_h
                    }
                })
                
    doc.close()
    return extracted_blocks
