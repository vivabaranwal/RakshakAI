"""LLM-backed clause analysis grounded in Indian law."""
import json
import logging
from groq import AsyncGroq

from ..config import GROQ_API_KEY, GROQ_MODEL
from .indian_law import build_system_prompt

logger = logging.getLogger(__name__)

# Blocks shorter than this are headings/page numbers, not clauses.
MIN_BLOCK_CHARS = 40
# Cap what we send so a long contract still fits the context window.
MAX_BLOCKS = 120
MAX_BLOCK_CHARS = 1200

SEVERITY_BY_SCORE = ((25, "FRAUD"), (50, "ALERT"), (75, "CAUTION"))
VALID_SEVERITIES = {"FRAUD", "ALERT", "CAUTION"}

# Types the UI knows how to label. Anything else is folded into OTHER so the
# frontend never renders an unexpected token.
VALID_TYPES = {
    "LIABILITY", "PENALTY", "AUTO_RENEWAL", "NON_COMPETE", "INDEMNITY",
    "FINANCIAL", "TERMINATION", "JURISDICTION", "ARBITRATION", "DATA_PRIVACY",
    "IP_RIGHTS", "CONFIDENTIALITY", "PAYMENT_TERMS", "PROCUREMENT", "OTHER",
}


class AnalysisError(Exception):
    """Raised when analysis cannot be completed. Caller marks the doc FAILED."""


def _severity_for(score: int) -> str:
    for threshold, label in SEVERITY_BY_SCORE:
        if score <= threshold:
            return label
    return "CAUTION"


def _select_blocks(text_blocks: list) -> list:
    """Pick substantive blocks, keeping their original indices for bbox lookup."""
    candidates = [
        (i, b) for i, b in enumerate(text_blocks)
        if len(b.get("text", "").strip()) >= MIN_BLOCK_CHARS
    ]
    # Prefer longer blocks when we must truncate — they carry the real terms.
    if len(candidates) > MAX_BLOCKS:
        candidates = sorted(candidates, key=lambda p: -len(p[1]["text"]))[:MAX_BLOCKS]
        candidates.sort(key=lambda p: p[0])
    return candidates


async def analyze_contract_clauses(text_blocks: list, mode: str = "Personal") -> dict:
    """
    Analyse a document's text blocks and return risky clauses with Indian-law
    grounding and suggested corrected wording.

    Raises AnalysisError when the document is unreadable or the LLM is unreachable,
    so the caller can mark the document FAILED rather than storing a fake result.
    """
    if not GROQ_API_KEY:
        raise AnalysisError(
            "GROQ_API_KEY is not configured on the server. "
            "Set it in the backend environment to enable analysis."
        )

    candidates = _select_blocks(text_blocks)
    if not candidates:
        # A scanned/image PDF yields no extractable text.
        raise AnalysisError(
            "No readable text found in this PDF. It may be a scanned image — "
            "please upload a text-based PDF."
        )

    indexed_text = "\n\n".join(
        f"[{i}] {b['text'][:MAX_BLOCK_CHARS]}" for i, b in candidates
    )

    try:
        client = AsyncGroq(api_key=GROQ_API_KEY)
        response = await client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": build_system_prompt(mode)},
                {"role": "user", "content": indexed_text},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )
        parsed = json.loads(response.choices[0].message.content)
    except json.JSONDecodeError as exc:
        logger.exception("LLM returned non-JSON output")
        raise AnalysisError("The AI returned an unreadable response. Please try again.") from exc
    except Exception as exc:
        logger.exception("Groq API call failed")
        raise AnalysisError(f"Could not reach the analysis service: {exc}") from exc

    flagged = []
    for item in parsed.get("clauses", []):
        try:
            idx = int(item.get("block_index", -1))
        except (TypeError, ValueError):
            idx = -1
        if not (0 <= idx < len(text_blocks)):
            # Hallucinated index — there is no clause to show or highlight.
            logger.warning("Skipping clause with out-of-range block_index %s", idx)
            continue
        block = text_blocks[idx]

        try:
            score = int(item.get("fairness_score", 50))
        except (TypeError, ValueError):
            score = 50
        score = max(0, min(100, score))

        # Trust the model's severity only if it's valid and consistent with the
        # score; otherwise derive it, so the UI's colour coding never lies.
        severity = str(item.get("severity", "")).upper()
        if severity not in VALID_SEVERITIES or severity != _severity_for(score):
            severity = _severity_for(score)

        # Normalise the type; unknown labels (e.g. UNILATERAL_VARIATION) become OTHER.
        raw_type = str(item.get("type", "OTHER")).upper().replace(" ", "_")
        clause_type = raw_type if raw_type in VALID_TYPES else "OTHER"

        # A clause with no cited basis still has a real explanation; fall back to
        # a neutral label rather than rendering an empty line in the UI.
        legal_basis = str(item.get("legal_basis", "")).strip()
        if not legal_basis:
            legal_basis = "General principles of Indian contract law"

        flagged.append({
            "type": clause_type,
            "severity": severity,
            "legal_basis": legal_basis,
            "explanation": item.get("explanation", ""),
            "suggested_clause": item.get("suggested_clause", ""),
            "fairness_score": score,
            "text": block.get("text", ""),
            "page": block.get("page", 1),
            "bbox": block.get("bbox"),
        })

    # Sort worst-first so the risk feed leads with the most dangerous clause.
    flagged.sort(key=lambda c: c["fairness_score"])

    if flagged:
        avg_fairness = sum(c["fairness_score"] for c in flagged) / len(flagged)
        risk_score = max(0, min(100, round(100 - avg_fairness)))
    else:
        risk_score = 0

    fraud = sum(1 for c in flagged if c["severity"] == "FRAUD")
    alert = sum(1 for c in flagged if c["severity"] == "ALERT")

    if not flagged:
        summary = "No significant risks detected under Indian law."
    else:
        parts = []
        if fraud:
            parts.append(f"{fraud} likely void/unenforceable")
        if alert:
            parts.append(f"{alert} heavily one-sided")
        detail = f" ({', '.join(parts)})" if parts else ""
        summary = f"{len(flagged)} risky clause(s) identified{detail}."

    return {
        "risk_score": risk_score,
        "analysis_summary": summary,
        "clauses": flagged,
    }
