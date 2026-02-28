def analyze_contract_clauses(text_blocks: list):
    """
    Simulates AI using keyword detection to highlight unfair text blocks.
    """
    keywords = {
        "liability": ("Liability", "This clause limits the other party's liability, increasing your financial risk."),
        "indemnify": ("Indemnification", "You may be held financially responsible for damages or losses incurred by the other party."),
        "termination": ("Termination", "This outlines how the agreement can be ended. Watch out for asymmetrical cancellation rights."),
        "security deposit": ("Security Deposit", "Pay close attention to the conditions under which your deposit could be permanently withheld.")
    }
    
    detected_clauses = []
    
    for block in text_blocks:
        text_lower = block["text"].lower()
        
        for kw, (ctype, explanation) in keywords.items():
            if kw in text_lower:
                detected_clauses.append({
                    "type": ctype,
                    "text": block["text"],
                    "page": block["page"],
                    "bbox": block["bbox"],
                    "explanation": explanation
                })
                # Break to avoid double-tagging the same block in this simple MVP
                break
                
    risk_score = min(100, len(detected_clauses) * 10)
    
    return {
        "risk_score": risk_score,
        "clauses": detected_clauses
    }
