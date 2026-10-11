"""CallMateAI Stage 3 - Automated MongoDB Atlas Database Test Suite.

Verifies:
1. Database seeding of 5 academic counselors and 250 students (50 per counselor).
2. Counselor profile retrieval and pre-configured section mappings.
3. In-memory counselor join during individual student retrieval.
4. Instantaneous Caller ID identification via parent phone number.
5. Call session lifecycle, status transitions, and message transcript logging.
6. Dual-escalation alert engine (Type 1 Emergency vs. Type 2 Live Physical Inquiry).
7. Counselor-specific alert filtering and resolution.
"""

import sys
from typing import Any, Dict

from database import get_database, ping_database
from seed import seed_database
import crud

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")


def log_test_header(name: str) -> None:
    """Print visually distinct test section banner."""
    print(f"\n{'=' * 65}")
    print(f"  TEST STEP: {name}")
    print(f"{'=' * 65}")


def test_1_seed_and_record_counts():
    """Verify seeding creates exactly 5 counselors and 250 students (50/counselor)."""
    log_test_header("1. Seeding & Record Counts Verification")

    db = get_database()
    ping_database(db)

    # 1. Execute database seed
    seed_summary = seed_database(db)
    assert seed_summary["status"] == "success", f"Seeding failed: {seed_summary}"
    assert seed_summary["counselors_count"] == 5, f"Expected 5 counselors, got {seed_summary['counselors_count']}"
    assert seed_summary["students_count"] == 250, f"Expected 250 students, got {seed_summary['students_count']}"

    # 2. Assert direct document counts in collections
    counselor_count = db.counselors.count_documents({})
    student_count = db.students.count_documents({})
    assert counselor_count == 5, f"Collection 'counselors' contains {counselor_count} docs, expected 5"
    assert student_count == 250, f"Collection 'students' contains {student_count} docs, expected 250"
    print(f"✓ PASS: Exactly 5 Counselors and 250 Students confirmed in MongoDB collections.")

    # 3. Assert exactly 50 students per counselor
    for c_id in range(1, 6):
        assigned_students = crud.list_students_by_counselor(c_id, db=db)
        assert len(assigned_students) == 50, (
            f"Counselor {c_id} expected 50 students, got {len(assigned_students)}"
        )
        # Check student_id ranges
        min_id = min(s["student_id"] for s in assigned_students)
        max_id = max(s["student_id"] for s in assigned_students)
        expected_min = 1000 + (c_id - 1) * 50 + 1
        expected_max = 1000 + c_id * 50
        assert min_id == expected_min, f"Counselor {c_id}: Min student ID {min_id} != {expected_min}"
        assert max_id == expected_max, f"Counselor {c_id}: Max student ID {max_id} != {expected_max}"
        print(f"✓ PASS: Counselor ID {c_id} has exactly 50 students (IDs {min_id} to {max_id}).")


def test_2_counselor_profiles():
    """Verify the 5 pre-configured counselors and section assignments."""
    log_test_header("2. Counselor Profiles & Section Verification")

    expected_sections = {
        1: ("Dr. Lakshmi Prasad", "CSE - Section A", "Computer Science & Engineering", "in_class"),
        2: ("Prof. Ramesh Kumar", "CSE - Section B", "Computer Science & Engineering", "available"),
        3: ("Dr. S. Anitha", "ECE - Section A", "Electronics & Communication Engineering", "busy"),
        4: ("Prof. K. Venkatesh", "IT - Section A", "Information Technology", "available"),
        5: ("Dr. Priya Darshini", "AI&DS - Section A", "Artificial Intelligence & Data Science", "available"),
    }

    all_counselors = crud.list_all_counselors()
    assert len(all_counselors) == 5, f"Expected 5 counselors, found {len(all_counselors)}"

    for c_id, (expected_name, expected_sec, expected_dept, expected_avail) in expected_sections.items():
        counselor = crud.get_counselor(c_id)
        assert counselor is not None, f"Counselor {c_id} not found"
        assert counselor["name"] == expected_name, f"Expected {expected_name}, got {counselor['name']}"
        assert counselor["section"] == expected_sec, f"Expected {expected_sec}, got {counselor['section']}"
        assert counselor["department"] == expected_dept, f"Expected {expected_dept}, got {counselor['department']}"
        assert counselor["availability"] == expected_avail, f"Expected {expected_avail}, got {counselor['availability']}"
        assert "_id" not in counselor, "Internal MongoDB '_id' was not stripped from counselor dict"
        print(f"✓ PASS: Counselor #{c_id} ({counselor['name']}) -> {counselor['section']} ({counselor['availability']})")

    # Non-existent counselor
    assert crud.get_counselor(999) is None, "Non-existent counselor should return None"
    print("✓ PASS: Non-existent counselor lookup gracefully returned None.")


def test_3_student_lookup_and_in_memory_join():
    """Verify student retrieval, schema validation, and in-memory counselor join."""
    log_test_header("3. Student Retrieval & In-Memory Counselor Join")

    # Test student 1001 (Assigned to Counselor 1)
    s1001 = crud.get_student(1001)
    assert s1001 is not None, "Student 1001 lookup failed"
    assert s1001["student_id"] == 1001
    assert s1001["student_code"] == "241FA04001"
    assert s1001["counselor_id"] == 1
    assert "_id" not in s1001, "Internal '_id' not stripped"
    assert "counselor" in s1001 and s1001["counselor"] is not None, "In-memory counselor join failed"
    assert s1001["counselor"]["name"] == "Dr. Lakshmi Prasad"
    assert s1001["counselor"]["section"] == "CSE - Section A"
    assert len(s1001["parents"]) == 2, f"Expected 2 embedded parents, got {len(s1001['parents'])}"
    print(f"✓ PASS: Student 1001 ({s1001['name']}) joined with Counselor: {s1001['counselor']['name']}")

    # Test student 1250 (Assigned to Counselor 5)
    s1250 = crud.get_student(1250)
    assert s1250 is not None, "Student 1250 lookup failed"
    assert s1250["student_id"] == 1250
    assert s1250["student_code"] == "241FA04250"
    assert s1250["counselor_id"] == 5
    assert s1250["counselor"]["name"] == "Dr. Priya Darshini"
    assert s1250["counselor"]["section"] == "AI&DS - Section A"
    print(f"✓ PASS: Student 1250 ({s1250['name']}) joined with Counselor: {s1250['counselor']['name']}")

    # Test non-existent student
    assert crud.get_student(9999) is None, "Non-existent student should return None"
    print("✓ PASS: Non-existent student lookup returned None.")


def test_4_caller_id_lookup():
    """Verify automated Caller ID match via incoming parent phone number."""
    log_test_header("4. Caller ID Incoming Phone Matching")

    # Lookup student 1001 via Father's phone
    s1001 = crud.get_student(1001)
    father = s1001["parents"][0]
    father_phone = father["phone"]
    assert father["relationship"] == "Father"
    assert father["verified"] is True

    match_father = crud.get_student_by_parent_phone(father_phone)
    assert match_father is not None, f"Failed to match caller ID for phone: {father_phone}"
    assert match_father["student_id"] == 1001
    assert match_father["name"] == s1001["name"]
    assert match_father["counselor"]["name"] == "Dr. Lakshmi Prasad"
    print(f"✓ PASS: Caller ID match for Father ({father['name']}, {father_phone}) -> Student 1001 ({match_father['name']})")

    # Lookup student 1250 via Mother's phone
    s1250 = crud.get_student(1250)
    mother = s1250["parents"][1]
    mother_phone = mother["phone"]
    assert mother["relationship"] == "Mother"
    assert mother["verified"] is True

    match_mother = crud.get_student_by_parent_phone(mother_phone)
    assert match_mother is not None, f"Failed to match caller ID for phone: {mother_phone}"
    assert match_mother["student_id"] == 1250
    assert match_mother["name"] == s1250["name"]
    assert match_mother["counselor"]["name"] == "Dr. Priya Darshini"
    print(f"✓ PASS: Caller ID match for Mother ({mother['name']}, {mother_phone}) -> Student 1250 ({match_mother['name']})")

    # Non-existent phone
    assert crud.get_student_by_parent_phone("+91 9999999999") is None
    print("✓ PASS: Unregistered phone number correctly returns None.")


def test_5_call_tracking_and_transcripts():
    """Verify call session creation, message logging, and state transitions."""
    log_test_header("5. Call Tracking & Transcript Lifecycle")

    call_id = 9001
    student_id = 1001
    counselor_id = 1
    parent_phone = "+91 9811000001"

    # 1. Create incoming call
    call = crud.create_call(call_id, student_id, counselor_id, parent_phone)
    assert call["call_id"] == call_id
    assert call["status"] == "incoming"
    assert call["messages"] == []
    assert "_id" not in call
    print(f"✓ PASS: Call #{call_id} initialized with status 'incoming'.")

    # 2. Transition state to 'agent'
    updated = crud.update_call_status(call_id, "agent")
    assert updated["status"] == "agent"
    print(f"✓ PASS: Call #{call_id} transitioned to 'agent'.")

    # 3. Append messages to transcript
    msg1 = crud.add_call_message(call_id, "parent", "Hello, is Aarav attending the lab session today?")
    msg2 = crud.add_call_message(call_id, "agent", "Hello! Let me check the database. Yes, Aarav is present in the lab session.")
    assert msg1["sender"] == "parent"
    assert msg2["sender"] == "agent"

    call_doc = crud.get_call(call_id)
    assert len(call_doc["messages"]) == 2
    assert call_doc["messages"][0]["text"] == "Hello, is Aarav attending the lab session today?"
    assert call_doc["messages"][1]["text"] == "Hello! Let me check the database. Yes, Aarav is present in the lab session."
    print(f"✓ PASS: 2 transcript messages appended and persisted for Call #{call_id}.")

    # 4. Transition state to 'completed'
    final_call = crud.update_call_status(call_id, "completed")
    assert final_call["status"] == "completed"
    print(f"✓ PASS: Call #{call_id} state successfully updated to 'completed'.")


def test_6_dual_escalation_engine():
    """Verify Dual Escalation Engine (Emergency vs. Live Inquiry alerts)."""
    log_test_header("6. Dual Escalation Engine (Emergency vs. Live Inquiry)")

    call_id = 9002
    counselor_id = 1

    # 🚨 Escalation Type 1: Emergency (injury, missing child, accident)
    # Should produce alert_type="emergency", priority="urgent", status="new"
    emergency_msg = "EMERGENCY: Parent reports student collapsed near cafeteria stairs; requires immediate medical support."
    alert_emerg = crud.create_counselor_alert(
        call_id=call_id,
        alert_type="emergency",
        priority="urgent",
        message=emergency_msg,
        counselor_id=counselor_id,
    )
    assert alert_emerg["alert_type"] == "emergency"
    assert alert_emerg["priority"] == "urgent"
    assert alert_emerg["status"] == "new"
    assert alert_emerg["counselor_id"] == counselor_id
    assert "id" in alert_emerg and len(alert_emerg["id"]) > 0
    print(f"✓ PASS: [🚨 Type 1 Emergency Alert] Created: ID {alert_emerg['id']} (Priority: URGENT)")

    # 📋 Escalation Type 2: Live Physical Classroom Inquiry
    # Should produce alert_type="live_inquiry", priority="normal", status="new"
    live_msg = "LIVE INQUIRY: Parent asks: 'Is my child in 1st period class right now? Tell him to call me.' Exceeds AI boundaries; counselor check requested."
    alert_live = crud.create_counselor_alert(
        call_id=call_id,
        alert_type="live_inquiry",
        priority="normal",
        message=live_msg,
        counselor_id=counselor_id,
    )
    assert alert_live["alert_type"] == "live_inquiry"
    assert alert_live["priority"] == "normal"
    assert alert_live["status"] == "new"
    assert alert_live["counselor_id"] == counselor_id
    assert "id" in alert_live and len(alert_live["id"]) > 0
    print(f"✓ PASS: [📋 Type 2 Live Inquiry Alert] Created: ID {alert_live['id']} (Priority: NORMAL)")

    # 3. Test filtering by counselor ID
    c1_alerts = crud.list_counselor_alerts(counselor_id=1)
    c2_alerts = crud.list_counselor_alerts(counselor_id=2)

    assert len(c1_alerts) >= 2, f"Counselor 1 should have at least 2 alerts, got {len(c1_alerts)}"
    assert all(a["counselor_id"] == 1 for a in c1_alerts), "Alerts list contained wrong counselor ID"
    assert len(c2_alerts) == 0, f"Counselor 2 should have 0 alerts, got {len(c2_alerts)}"
    print(f"✓ PASS: Alert routing verified (Counselor 1 has {len(c1_alerts)} alerts, Counselor 2 has {len(c2_alerts)} alerts).")

    # 4. Test alert state progression ('acknowledged' -> 'resolved')
    ack_alert = crud.update_counselor_alert_status(alert_emerg["id"], "acknowledged")
    assert ack_alert["status"] == "acknowledged"

    resolved_alert = crud.update_counselor_alert_status(alert_emerg["id"], "resolved")
    assert resolved_alert["status"] == "resolved"

    # Active alerts should now only show 1 unresolved alert for Counselor 1
    remaining_active = crud.list_counselor_alerts(counselor_id=1, include_resolved=False)
    assert len(remaining_active) == 1
    assert remaining_active[0]["id"] == alert_live["id"]
    print("✓ PASS: Alert resolution verified. Resolved alerts excluded from active dashboard view.")


def run_all_tests():
    """Run all verification tests sequentially."""
    print("\n" + "#" * 65)
    print("  CallMateAI Stage 3 - MongoDB Atlas Database Test Runner")
    print("#" * 65)

    test_1_seed_and_record_counts()
    test_2_counselor_profiles()
    test_3_student_lookup_and_in_memory_join()
    test_4_caller_id_lookup()
    test_5_call_tracking_and_transcripts()
    test_6_dual_escalation_engine()

    print("\n" + "=" * 65)
    print("🎉 ALL 250 STUDENTS & 5 COUNSELORS VERIFIED ON MONGODB ATLAS!")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    run_all_tests()
