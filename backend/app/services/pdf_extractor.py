import os
import fitz  # PyMuPDF


class PdfReadError(Exception):
    """The PDF could not be opened or read. Message is safe to show the user."""


def extract_text_with_bounding_boxes(pdf_path: str):
    """
    Extract text blocks with their bounding boxes and page dimensions.

    Coordinates are in PDF points, paired with the page size they were measured
    against so the frontend can scale highlights to any zoom level.
    """
    if not os.path.exists(pdf_path):
        raise PdfReadError("The document file could not be found on the server.")

    try:
        doc = fitz.open(pdf_path)
    except Exception as exc:
        # Never surface the server-side path to the user.
        raise PdfReadError(
            "This PDF appears to be corrupted or password-protected and could not be opened."
        ) from exc

    try:
        if doc.needs_pass:
            raise PdfReadError(
                "This PDF is password-protected. Please upload an unlocked copy."
            )

        extracted_blocks = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            page_dict = page.get_text("dict")
            page_w = page_dict.get("width")
            page_h = page_dict.get("height")

            for b in page_dict.get("blocks", []):
                if b.get("type") != 0:  # 0 = text block
                    continue

                block_text = " ".join(
                    s.get("text", "")
                    for line in b.get("lines", [])
                    for s in line.get("spans", [])
                ).strip()

                if not block_text:
                    continue

                x0, y0, x1, y1 = b["bbox"]
                extracted_blocks.append({
                    "text": block_text,
                    "page": page_num + 1,
                    "bbox": {
                        "x1": x0, "y1": y0, "x2": x1, "y2": y1,
                        "width": page_w, "height": page_h,
                    },
                })
        return extracted_blocks
    finally:
        doc.close()
