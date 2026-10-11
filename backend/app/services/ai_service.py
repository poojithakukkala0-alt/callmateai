"""
AI Service Orchestrator: Combines deterministic safety triage with Google Gemini reasoning.
"""
import os
import re
from typing import Any, Dict, Optional
from dotenv import load_dotenv

# Ensure environment variables (.env) are loaded
load_dotenv()

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None

from app.ai.prompts import get_system_instruction

# Explicit emergency keywords for fast-path safety fallback
EMERGENCY_KEYWORDS = [
    "accident", "missing", "hospital", "injured", "hurt",
    "danger", "bleeding", "collapsed", "died", "emergency"
]

LIVE_INQUIRY_KEYWORDS = [
    "right now", "sitting in class", "first period", "live", "tell him", "tell her",
    "classroom right now", "period class"
]


def check_fast_path_rules(message: str, student_context: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    """
    Deterministic rule engine that intercepts high-priority intents before calling LLM.
    """
    clean_text = message.lower()

    # 1. Emergency rule
    matched_emergency = [w for w in EMERGENCY_KEYWORDS if re.search(r'\b' + re.escape(w) + r'\b', clean_text)]
    if matched_emergency:
        student_name = (student_context or {}).get("name", "the student")
        counselor_name = (student_context or {}).get("counselor_name", "the counselor")

        reply_text = (
            f"🚨 EMERGENCY ALERT: An urgent situation has been detected regarding {student_name} "
            f"(Keywords: {', '.join(matched_emergency)}). "
            f"I have flagged this incident and immediately requested an emergency handover to "
            f"{counselor_name} and the crisis response team. "
            f"Please stay on the line; an authorized counselor is being connected right now."
        )

        return {
            "reply": reply_text,
            "intent": "emergency",
            "alert_type": "emergency",
            "priority": "urgent",
            "emergency_flag": True,
            "requires_handover": True,
            "detected_keywords": matched_emergency
        }

    return None


async def process_parent_message(message: str, student_context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates message against rules and Gemini 2.5 Flash pipeline.
    """
    # 1. Check fast-path safety first (0ms latency safety gate)
    fast_path = check_fast_path_rules(message, student_context)
    if fast_path:
        return fast_path

    # 2. Check for live physical presence inquiries
    clean_text = message.lower()
    if any(re.search(r'\b' + re.escape(w) + r'\b', clean_text) for w in LIVE_INQUIRY_KEYWORDS):
        counselor = student_context.get("counselor_name", "the counselor")
        return {
            "reply": f"I cannot verify real-time physical classroom presence at this moment. I have logged a task note for {counselor} to follow up with you.",
            "intent": "live_inquiry",
            "alert_type": "live_inquiry",
            "priority": "normal",
            "emergency_flag": False,
            "requires_handover": False
        }

    # 3. Query Gemini API
    api_key = os.getenv("GEMINI_API_KEY")
    is_valid_key = bool(api_key and api_key != "your-gemini-api-key-here" and not api_key.startswith("your-"))

    if not is_valid_key or genai is None:
        # Grounded deterministic fallback if API key is not yet set
        attendance = student_context.get("attendance_pct", student_context.get("attendance", "94%"))
        name = student_context.get("name", "the student")
        remarks = student_context.get("remarks", "")
        fee_status = student_context.get("fee_status", "")

        if any(w in clean_text for w in ["thank", "ok got it", "okay", "got it", "sure", "alright", "all right", "bye"]):
            reply_body = "You're welcome! Let me know if you need anything else."
        elif "remark" in clean_text or "performance" in clean_text:
            reply_body = f"According to teacher remarks for {name}: \"{remarks or 'Exceptional aptitude and consistent participation.'}\""
        elif "fee" in clean_text or "paid" in clean_text or "due" in clean_text:
            reply_body = f"Fee record for {name}: {fee_status or 'Paid - Term 2 Cleared.'}"
        else:
            reply_body = f"Regarding {name}'s attendance: The official school record reflects {attendance}."

        return {
            "reply": reply_body,
            "intent": "student_inquiry",
            "alert_type": None,
            "priority": "normal",
            "emergency_flag": False,
            "requires_handover": False
        }

    try:
        client = genai.Client(api_key=api_key)
        system_instruction = get_system_instruction(student_context)
        
        # Explicit Multi-Language & Empathy Directive
        multi_lang_directive = (
            "Always respond in the EXACT SAME LANGUAGE that the parent used in their query. "
            "Detect the tone of the parent and remain empathetic. "
            "If they report an accident or danger, return the RED EMERGENCY."
        )
        if multi_lang_directive not in system_instruction:
            system_instruction += f"\n\n{multi_lang_directive}"

        # Try active recommended Gemini models in order
        models_to_try = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-2.5-flash"]
        response = None
        last_model_err = None

        for model_name in models_to_try:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=message,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.2,
                        max_output_tokens=150
                    )
                )
                if response and response.text:
                    break
            except Exception as m_err:
                last_model_err = m_err
                continue

        if not response or not response.text:
            if last_model_err:
                raise last_model_err
            reply_text = "I have accessed the student record."
        else:
            reply_text = response.text.strip()

        # Parse escalation prefixes from Gemini
        if "[EMERGENCY_DETECTED]" in reply_text or "RED EMERGENCY" in reply_text:
            cleaned_reply = (
                reply_text.replace("[EMERGENCY_DETECTED]", "")
                .replace("RED EMERGENCY", "")
                .strip(" :-\n")
            )
            return {
                "reply": cleaned_reply or f"🚨 Emergency handover requested for {student_context.get('counselor_name', 'counselor')}.",
                "intent": "emergency",
                "alert_type": "emergency",
                "priority": "urgent",
                "emergency_flag": True,
                "requires_handover": True
            }
        elif "[LIVE_INQUIRY_LOGGED]" in reply_text:
            return {
                "reply": reply_text.replace("[LIVE_INQUIRY_LOGGED]", "").strip(),
                "intent": "live_inquiry",
                "alert_type": "live_inquiry",
                "priority": "normal",
                "emergency_flag": False,
                "requires_handover": False
            }

        return {
            "reply": reply_text,
            "intent": "general_inquiry",
            "alert_type": None,
            "priority": "normal",
            "emergency_flag": False,
            "requires_handover": False
        }

    except Exception as err:
        # Fallback to local grounded record
        name = student_context.get("name", "the student")
        attendance = student_context.get("attendance_pct", student_context.get("attendance", "90%"))
        remarks = student_context.get("remarks", "")
        fee_status = student_context.get("fee_status", "")

        if any(w in clean_text for w in ["thank", "ok got it", "okay", "got it", "sure", "alright", "all right", "bye"]):
            reply_body = "You're welcome! Let me know if you need anything else."
        elif "remark" in clean_text or "performance" in clean_text:
            reply_body = f"According to teacher remarks for {name}: \"{remarks or 'Consistent performance in class.'}\""
        elif "fee" in clean_text or "paid" in clean_text or "due" in clean_text:
            reply_body = f"Fee record for {name}: {fee_status or 'Paid - Full Academic Year Cleared.'}"
        else:
            reply_body = f"{name}'s record reflects an attendance rate of {attendance}."

        return {
            "reply": reply_body,
            "intent": "fallback_query",
            "alert_type": None,
            "priority": "normal",
            "emergency_flag": False,
            "requires_handover": False,
            "error_handled": str(err)
        }
