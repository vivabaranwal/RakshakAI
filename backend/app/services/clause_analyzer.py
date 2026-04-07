import os
import json
import re
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

async def analyze_contract_clauses(text_blocks: list, mode: str = "Public"):
    """
    Sends indexed text blocks to the Groq API (Llama 3.3).
    Forces the model to return a strict JSON object with a 'clauses' array 
    so that the frontend can filter and display ONLY the risky sections.
    """

    # Build a numbered block list for the AI to reference by index
    indexed_text = "\n".join(
        [f"[{i}] {b['text']}" for i, b in enumerate(text_blocks[:20])]
    )

    system_prompt = (
        f"You are Rakshak AI, a legal-risk scanner (Mode: {mode}). "
        "You will receive NUMBERED text blocks from an Indian legal document. "
        "Your ONLY job: identify the top 3-5 most unfair or risky blocks. "
        "OUTPUT FORMAT: You must return a JSON object with a single key 'clauses', containing an array of objects. "
        "Do NOT include any markdown formatting, only a valid JSON object. "
        '{\n'
        '  "clauses": [\n'
        '    {\n'
        '      "block_index": <integer — the [N] number of the risky block>,\n'
        '      "type": "<one of: LIABILITY | PENALTY | AUTO_RENEWAL | NON_COMPETE | INDEMNITY | FINANCIAL | TERMINATION | OTHER>",\n'
        '      "explanation": "<1-2 sentence plain-English explanation of why this clause is unfair>",\n'
        '      "fairness_score": <integer 0-100, where 0=very unfair, 100=totally fair>\n'
        '    }\n'
        '  ]\n'
        '}\n'
        "RULES: Only return the JSON. "
        "Do NOT repeat the clause text. "
        "Only flag genuine risks, not standard legal boilerplate."
    )

    flagged_clauses = []
    overall_risk = 50

    try:
        client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": indexed_text}
            ],
            response_format={"type": "json_object"},
            temperature=0.0,
        )
        ai_result = response.choices[0].message.content
        
        # Parse the JSON response
        parsed = json.loads(ai_result)
        clauses_array = parsed.get("clauses", [])
        
        for item in clauses_array:
            idx = item.get("block_index", -1)
            block = text_blocks[idx] if 0 <= idx < len(text_blocks) else {}
            flagged_clauses.append({
                "type": item.get("type", "RISK"),
                "explanation": item.get("explanation", ""),
                "fairness_score": int(item.get("fairness_score", 50)),
                "text": block.get("text", ""),
                "page": block.get("page", 1),
                "bbox": block.get("bbox"),
            })
            
    except (json.JSONDecodeError, ValueError):
         flagged_clauses = [{
            "type": "PARSE_ERROR",
            "explanation": "The AI returned an unstructured response. Try uploading again.",
            "fairness_score": 50,
            "text": "",
            "page": 1,
            "bbox": None,
        }]
    except Exception as e:
        flagged_clauses = [{
            "type": "CONNECTION_ERROR",
            "explanation": f"Could not reach Groq API: {str(e)}.",
            "fairness_score": 50,
            "text": "",
            "page": 1,
            "bbox": None,
        }]

    # Derive overall risk score from per-clause scores
    if flagged_clauses and flagged_clauses[0]["type"] not in ["PARSE_ERROR", "CONNECTION_ERROR"]:
        avg_fairness = sum(c["fairness_score"] for c in flagged_clauses) / len(flagged_clauses)
        overall_risk = max(0, min(100, 100 - int(avg_fairness)))
    else:
        overall_risk = 50

    return {
        "risk_score": overall_risk,
        "analysis_summary": f"{len(flagged_clauses)} risk(s) detected by Rakshak AI.",
        "clauses": flagged_clauses,
    }