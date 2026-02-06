"""
Voice Agent API — Converts spoken Hindi/English commands into executable website actions.

Flow:
  1. Frontend captures voice via Web Speech API → sends text
  2. This endpoint sends text to Groq LLM with a strict system prompt
  3. LLM returns a JSON execution plan
  4. Frontend auto-executes the plan (navigate, click, speak, fill forms)
"""

import json
import logging
import os
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["voice-agent"])

# ---------------------------------------------------------------------------
# Groq LLM Client (lazy-loaded so missing package doesn't crash the server)
# ---------------------------------------------------------------------------
_groq = None

def _get_groq():
    global _groq
    if _groq is None:
        try:
            from groq import Groq
            key = os.getenv("GROQ_API_KEY")
            if not key:
                logger.error("GROQ_API_KEY missing from .env")
                return None
            _groq = Groq(api_key=key)
        except ImportError:
            logger.error("groq package not installed — pip install groq")
            return None
    return _groq

# ---------------------------------------------------------------------------
# System prompt — tells LLM exactly which pages / actions exist
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are a voice-operated website assistant for an Indian agricultural web app.
The user speaks in Hindi, English, or Hinglish. Your ONLY job is to return a JSON execution plan.

## STRICT RULES
1. Reply with **valid JSON only** — no markdown, no explanation, no extra text.
2. Use ONLY the allowed actions listed below.
3. Never generate HTML, never call APIs yourself, never access any database.

## WEBSITE PAGES (use exact paths)
| Page | Path |
|------|------|
| Dashboard / Home | /dashboard |
| Crop Prediction | /crops |
| Weather Forecast | /weather |
| Market Prices | /analytics |
| Disease Detector | /disease-detector |
| Government Schemes | /reports |
| Inventory | /inventory |
| Settings | /settings |
| Login | /login |

## ALLOWED ACTIONS (array of objects)
- {"type":"NAVIGATE","path":"/dashboard"}        — go to a page
- {"type":"SPEAK","text":"Hindi or English text"} — speak something to user
- {"type":"CLICK","selector":"#element-id"}       — click an element
- {"type":"FILL","selector":"#input-id","value":"text"} — fill a form field
- {"type":"SCROLL","direction":"up|down"}         — scroll the page

## RESPONSE FORMAT (always)
{
  "intent": "SHORT_INTENT_NAME",
  "actions": [ ... ],
  "response_text": "Short Hindi sentence to speak to user"
}

## EXAMPLES

User: "डैशबोर्ड दिखाओ"
{"intent":"DASHBOARD","actions":[{"type":"NAVIGATE","path":"/dashboard"}],"response_text":"डैशबोर्ड खोल रहे हैं"}

User: "मौसम बताओ"
{"intent":"WEATHER","actions":[{"type":"NAVIGATE","path":"/weather"}],"response_text":"मौसम पेज खोल रहे हैं"}

User: "गन्ने का भाव बताओ"
{"intent":"MARKET_PRICE","actions":[{"type":"NAVIGATE","path":"/analytics"}],"response_text":"बाज़ार भाव पेज खुल रहा है"}

User: "फसल में बीमारी है"
{"intent":"DISEASE","actions":[{"type":"NAVIGATE","path":"/disease-detector"}],"response_text":"रोग पहचान पेज खोल रहे हैं"}

User: "सरकारी योजनाएं दिखाओ"
{"intent":"SCHEMES","actions":[{"type":"NAVIGATE","path":"/reports"}],"response_text":"सरकारी योजनाएं दिखा रहे हैं"}

User: "फसल भविष्यवाणी करो"
{"intent":"CROP_PREDICTION","actions":[{"type":"NAVIGATE","path":"/crops"}],"response_text":"फसल भविष्यवाणी पेज खुल रहा है"}

User: "settings खोलो"
{"intent":"SETTINGS","actions":[{"type":"NAVIGATE","path":"/settings"}],"response_text":"सेटिंग्स खोल रहे हैं"}

User: "ऊपर स्क्रॉल करो"
{"intent":"SCROLL","actions":[{"type":"SCROLL","direction":"up"}],"response_text":"ऊपर स्क्रॉल कर रहे हैं"}

User: random/unclear text
{"intent":"UNKNOWN","actions":[{"type":"SPEAK","text":"समझ नहीं आया, कृपया दोबारा बोलें"}],"response_text":"समझ नहीं आया, कृपया दोबारा बोलें"}
"""

# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------
class VoiceRequest(BaseModel):
    text: str

class VoiceResponse(BaseModel):
    intent: str
    actions: List[Dict[str, Any]]
    response_text: str

# ---------------------------------------------------------------------------
# Safety helpers
# ---------------------------------------------------------------------------
ALLOWED_PATHS = {
    "/dashboard", "/crops", "/weather", "/analytics",
    "/disease-detector", "/inventory", "/reports", "/settings", "/login"
}
ALLOWED_TYPES = {"NAVIGATE", "SPEAK", "CLICK", "FILL", "SCROLL"}

def _sanitize_plan(raw: str) -> Dict[str, Any]:
    """Parse LLM output, strip markdown fences, validate actions."""
    text = raw.strip()
    # Strip ```json ... ``` wrappers
    if text.startswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    try:
        plan = json.loads(text)
    except json.JSONDecodeError:
        logger.warning("LLM returned invalid JSON: %s", text[:200])
        return _fallback()

    # Validate intent
    if "intent" not in plan:
        plan["intent"] = "UNKNOWN"

    # Validate actions
    safe_actions = []
    for a in plan.get("actions", []):
        atype = a.get("type", "")
        if atype not in ALLOWED_TYPES:
            continue
        if atype == "NAVIGATE" and a.get("path") not in ALLOWED_PATHS:
            continue
        safe_actions.append(a)

    plan["actions"] = safe_actions or [{"type": "SPEAK", "text": "कमांड समझ नहीं आई"}]
    plan.setdefault("response_text", "")
    return plan

def _fallback() -> Dict[str, Any]:
    return {
        "intent": "ERROR",
        "actions": [{"type": "SPEAK", "text": "कुछ गड़बड़ हुई, दोबारा कोशिश करें"}],
        "response_text": "कुछ गड़बड़ हुई"
    }

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@router.post("/voice-command", response_model=VoiceResponse)
async def voice_command(req: VoiceRequest):
    """Convert voice transcription → LLM plan → validated JSON actions."""
    text = (req.text or "").strip()
    if len(text) < 2:
        raise HTTPException(400, "Text too short")

    client = _get_groq()
    if not client:
        raise HTTPException(503, "Voice agent unavailable — GROQ_API_KEY not set or groq not installed")

    logger.info("Voice command: %s", text)

    try:
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": text},
            ],
            temperature=0.2,
            max_tokens=400,
        )
        llm_text = resp.choices[0].message.content
    except Exception as exc:
        logger.error("Groq API error: %s", exc)
        raise HTTPException(503, "LLM service error")

    plan = _sanitize_plan(llm_text)
    logger.info("Plan: %s", plan)
    return VoiceResponse(**plan)

@router.get("/voice-status")
async def voice_status():
    """Health-check for voice agent."""
    ok = _get_groq() is not None
    return {"ready": ok, "groq_key_set": bool(os.getenv("GROQ_API_KEY"))}
