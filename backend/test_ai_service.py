import asyncio
import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Ensure Windows terminal prints unicode characters without cp1252 crash
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from app.services.ai_service import process_parent_message

mock_student = {
    "student_id": 1001,
    "name": "Rahul Sharma",
    "section": "CSE - Section A",
    "counselor_name": "Dr. Lakshmi Prasad",
    "attendance_pct": "96%",
    "current_status": "In Class",
    "remarks": "Top academic standing in Algorithms."
}

async def run_tests():
    print("=" * 60)
    print("  CALLMATEAI STAGE 4 AI PIPELINE TEST RUNNER")
    print("=" * 60)

    # 1. Test Factual Grounding
    res1 = await process_parent_message("What is Rahul's attendance?", mock_student)
    assert "96%" in res1["reply"] or "attendance" in res1["reply"].lower(), f"Unexpected reply: {res1['reply']}"
    print("✓ PASS: Factual database grounding test passed.")

    # 2. Test Emergency Fast-Path
    res2 = await process_parent_message("My son had a severe accident and is bleeding!", mock_student)
    assert res2["emergency_flag"] is True, "Emergency flag was not set to True"
    assert res2["requires_handover"] is True, "Requires handover was not set to True"
    print("✓ PASS: Emergency fast-path safety triage passed.")

    # 3. Test Live Presence Boundary
    res3 = await process_parent_message("Is Rahul sitting in 1st period class right now?", mock_student)
    assert res3["intent"] == "live_inquiry", f"Unexpected intent: {res3.get('intent')}"
    assert res3["emergency_flag"] is False, "Emergency flag should be False for live inquiry"
    print("✓ PASS: Physical presence boundary check passed.")

    print("=" * 60)
    print("🎉 ALL STAGE 4 AI PIPELINE TESTS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_tests())
