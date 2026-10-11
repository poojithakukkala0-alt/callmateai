import io
import sys
from fastapi.testclient import TestClient  # pyrefly: ignore [missing-import]
from app.main import app
from app.services import mock_db

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

client = TestClient(app)


def log_step(name: str):
    print(f"\n==================================================")
    print(f"  TEST: {name}")
    print(f"==================================================")


def test_root_and_health():
    log_step("Root and Health Endpoints")

    # 1. Root endpoint
    res = client.get("/")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    body = res.json()
    assert body["status"] == "online"
    assert "/docs" in body["docs_url"]
    print("PASS: Root GET / returned status 'online'")

    # 2. Health check
    res = client.get("/api/health")
    assert res.status_code == 200
    health = res.json()
    assert health["status"] == "healthy"
    assert health["metrics"]["registered_students"] >= 3
    assert health["metrics"]["registered_counselors"] >= 1
    print(f"PASS: Health GET /api/health returned healthy with metrics: {health['metrics']}")


def test_students_endpoints():
    log_step("Students Endpoints")

    # 1. List students
    res = client.get("/api/students")
    assert res.status_code == 200
    students = res.json()
    assert len(students) >= 3
    student_ids = [s["id"] for s in students]
    assert 101 in student_ids and 102 in student_ids and 103 in student_ids
    print(f"PASS: GET /api/students returned {len(students)} students: {student_ids}")

    # 2. Get student 101
    res = client.get("/api/students/101")
    assert res.status_code == 200
    s101 = res.json()
    assert s101["name"] == "Aarav Sharma"
    assert "attendance" in s101 and "remarks" in s101 and "fee_status" in s101
    print(f"PASS: GET /api/students/101 returned: {s101['name']} ({s101['class']})")

    # 3. Non-existent student
    res = client.get("/api/students/999")
    assert res.status_code == 404
    print("PASS: GET /api/students/999 properly returned 404 Not Found")


def test_normal_call_flow():
    log_step("Normal Call Lifecycle & Grounded AI Responses")

    # Reset DB state for clean test isolation
    mock_db.reset_mock_db()

    # 1. Start incoming call
    res = client.post("/api/calls", json={"student_id": 101, "counselor_id": 1})
    assert res.status_code == 201
    call = res.json()
    call_id = call["call_id"]
    assert call["status"] == "incoming"
    assert call["student_name"] == "Aarav Sharma"
    assert call["emergency_flag"] is False
    print(f"PASS: Call #{call_id} created with initial status 'incoming'")

    # 2. Message rejection while in 'incoming'
    res = client.post(f"/api/calls/{call_id}/message", json={"message": "Hello"})
    assert res.status_code == 400
    print("PASS: Sending message while 'incoming' properly rejected with 400 Bad Request")

    # 3. Counselor forwards call to CallMateAI
    res = client.post(f"/api/calls/{call_id}/forward", json={"target": "ai_agent"})
    assert res.status_code == 200
    call = res.json()
    assert call["status"] == "agent"
    print(f"PASS: Forwarded Call #{call_id} to AI agent; status transitioned to 'agent'")

    # 4. Cannot re-forward already forwarded call
    res = client.post(f"/api/calls/{call_id}/forward", json={"target": "ai_agent"})
    assert res.status_code == 400
    print("PASS: Duplicate forward request properly rejected with 400")

    # 5. Parent asks for attendance
    res = client.post(
        f"/api/calls/{call_id}/message",
        json={"message": "Could you check Aarav's attendance today?"}
    )
    assert res.status_code == 200
    call = res.json()
    assert call["status"] == "agent"
    assert call["emergency_flag"] is False
    latest_msg = call["messages"][-1]
    assert latest_msg["sender"] == "ai_agent"
    assert "96%" in latest_msg["text"]
    print(f"PASS: AI Agent grounded attendance response: {latest_msg['text']}")

    # 6. Parent asks for teacher remarks & performance
    res = client.post(
        f"/api/calls/{call_id}/message",
        json={"message": "How is his performance and teacher remarks?"}
    )
    assert res.status_code == 200
    call = res.json()
    latest_msg = call["messages"][-1]
    assert "Mathematics" in latest_msg["text"]
    print(f"PASS: AI Agent grounded remarks response: {latest_msg['text']}")

    # 7. Parent asks for fee status
    res = client.post(
        f"/api/calls/{call_id}/message",
        json={"message": "Is there any pending fee for this term?"}
    )
    assert res.status_code == 200
    call = res.json()
    latest_msg = call["messages"][-1]
    assert "Paid" in latest_msg["text"]
    print(f"PASS: AI Agent grounded fee response: {latest_msg['text']}")

    # 8. Complete call
    res = client.post(f"/api/calls/{call_id}/complete")
    assert res.status_code == 200
    call = res.json()
    assert call["status"] == "completed"
    print(f"PASS: Call #{call_id} transitioned to 'completed'")

    # 9. No messages allowed after completed
    res = client.post(f"/api/calls/{call_id}/message", json={"message": "Are you there?"})
    assert res.status_code == 400
    print("PASS: Messaging on completed call rejected with 400")


def test_emergency_flow():
    log_step("Emergency Escalation & Counselor Handover Flow")

    # Reset DB
    mock_db.reset_mock_db()

    # 1. Create and forward call for student 102
    res = client.post("/api/calls", json={"student_id": 102, "counselor_id": 1})
    assert res.status_code == 201
    call_id = res.json()["call_id"]

    res = client.post(f"/api/calls/{call_id}/forward", json={"target": "ai_agent"})
    assert res.status_code == 200

    # 2. Send emergency message with keywords
    emergency_text = "Emergency! Ananya was in an accident and is injured and bleeding outside school!"
    res = client.post(
        f"/api/calls/{call_id}/message",
        json={"message": emergency_text}
    )
    assert res.status_code == 200
    call = res.json()
    assert call["status"] == "handover requested"
    assert call["emergency_flag"] is True

    ai_reply = call["messages"][-1]["text"]
    assert "EMERGENCY ALERT" in ai_reply
    assert "accident" in ai_reply or "injured" in ai_reply
    print(f"PASS: Emergency detected! Status transitioned to 'handover requested'")
    print(f"      AI Response: {ai_reply}")

    # 3. Counselor polls emergencies
    res = client.get("/api/emergencies?status=open")
    assert res.status_code == 200
    emergencies = res.json()
    assert len(emergencies) >= 1
    incident = emergencies[0]
    emergency_id = incident["id"]
    assert incident["call_id"] == call_id
    assert incident["student_id"] == 102
    assert incident["student_name"] == "Ananya Iyer"
    assert incident["status"] == "open"
    print(f"PASS: Counselor polled open emergency incident #{emergency_id} for {incident['student_name']}")

    # 4. Counselor acknowledges emergency incident
    res = client.post(f"/api/emergencies/{emergency_id}/acknowledge")
    assert res.status_code == 200
    ack_incident = res.json()
    assert ack_incident["status"] == "acknowledged"
    print(f"PASS: Emergency #{emergency_id} status updated to 'acknowledged'")

    # 5. Counselor accepts emergency takeover
    res = client.post(
        f"/api/calls/{call_id}/handover",
        json={"reason": "Dr. Lakshmi Prasad connected with first aid assistance team."}
    )
    assert res.status_code == 200
    call = res.json()
    assert call["status"] == "counselor connected"
    print(f"PASS: Call #{call_id} handover accepted; status transitioned to 'counselor connected'")

    # 6. Counselor resolves emergency
    res = client.post(f"/api/emergencies/{emergency_id}/resolve")
    assert res.status_code == 200
    assert res.json()["status"] == "resolved"
    print(f"PASS: Emergency #{emergency_id} resolved")

    # 7. End call session
    res = client.post(f"/api/calls/{call_id}/complete")
    assert res.status_code == 200
    assert res.json()["status"] == "completed"
    print(f"PASS: Call #{call_id} successfully concluded and archived")


def test_keyword_coverage():
    log_step("Emergency Keywords Matrix Verification")

    keywords = [
        "accident",
        "missing",
        "hospital",
        "injured",
        "hurt",
        "danger",
        "bleeding",
        "collapsed"
    ]

    for kw in keywords:
        mock_db.reset_mock_db()
        # Create call
        c = client.post("/api/calls", json={"student_id": 103, "counselor_id": 1}).json()
        cid = c["call_id"]
        client.post(f"/api/calls/{cid}/forward", json={"target": "ai_agent"})

        # Send test message containing the keyword
        msg = f"Alert: The student is in {kw} right now!"
        res = client.post(f"/api/calls/{cid}/message", json={"message": msg})
        assert res.status_code == 200
        call = res.json()
        assert call["status"] == "handover requested", f"Failed for keyword '{kw}'"
        assert call["emergency_flag"] is True
        print(f"PASS: Keyword '{kw}' successfully triggered emergency escalation")


def main():
    print("==================================================")
    print("  CALLMATEAI BACKEND ARCHITECTURE VERIFICATION   ")
    print("==================================================")
    try:
        test_root_and_health()
        test_students_endpoints()
        test_normal_call_flow()
        test_emergency_flow()
        test_keyword_coverage()
        print("\n==================================================")
        print("  ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ✅ ")
        print("==================================================\n")
    except AssertionError as err:
        print(f"\n❌ TEST FAILED: {err}")
        sys.exit(1)
    except Exception as exc:
        print(f"\n❌ UNEXPECTED ERROR: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()
