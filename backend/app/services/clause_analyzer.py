import httpx

OLLAMA_URL = "http://localhost:11434/api/generate"

async def analyze_contract_clauses(text_blocks: list, mode: str = "Public"):
    """
    Connects to local Mistral via Ollama. 
    Uses a strict prompt to reduce generation time and prevent timeouts.
    """
    # Combine first 5 blocks to speed up local processing
    full_text = " ".join([b["text"] for b in text_blocks[:5]])

    system_prompt = (
        f"You are Rakshak AI (Mode: {mode}). Analyze this Indian legal text for risks. "
        "BE CONCISE. Use max 50 words. "
        "FORMAT: [Score: X/100] | [Summary: One sentence highlighting the biggest risk]."
    )

    # timeout=None is crucial for local LLMs that might take >30s to respond
    async with httpx.AsyncClient(timeout=None) as client:
        try:
            response = await client.post(
                OLLAMA_URL, 
                json={
                    "model": "mistral",
                    "prompt": full_text,
                    "system": system_prompt,
                    "stream": False
                }
            )
            ai_result = response.json().get("response", "Analysis unavailable.")
        except Exception as e:
            ai_result = f"AI Error: {str(e)}. Ensure Ollama is running."

    return {
        "risk_score": 80 if "high" in ai_result.lower() else 30,
        "analysis_summary": ai_result,
        "clauses": text_blocks  # Includes coordinates for frontend highlights
    }