"""CallMateAI Stage 3 - Realistic Dataset Generator and Seeder.

Seeds MongoDB (or MongoDB Atlas Cloud) with:
- 5 Academic Counselors across 5 designated sections
- 250 Students (50 per counselor) with realistic embedded parent profiles (Father & Mother)
- Realistically distributed attendance figures (65% to 98%)
- Diverse student statuses ('In Class', 'Lab Session', 'Absent', 'Library', 'Medical Leave')
- Automated unique indexing and clean collection initialization
"""

import random
from typing import Any, Dict, List, Optional
from pymongo.database import Database

from database import get_database, init_indexes


# Pre-configured 5 Counselors per architectural specification
COUNSELORS_DATA: List[Dict[str, Any]] = [
    {
        "counselor_id": 1,
        "name": "Dr. Lakshmi Prasad",
        "email": "lakshmi.prasad@callmate.edu",
        "phone": "+91 98765 01001",
        "section": "CSE - Section A",
        "department": "Computer Science & Engineering",
        "availability": "in_class",
    },
    {
        "counselor_id": 2,
        "name": "Prof. Ramesh Kumar",
        "email": "ramesh.kumar@callmate.edu",
        "phone": "+91 98765 01002",
        "section": "CSE - Section B",
        "department": "Computer Science & Engineering",
        "availability": "available",
    },
    {
        "counselor_id": 3,
        "name": "Dr. S. Anitha",
        "email": "s.anitha@callmate.edu",
        "phone": "+91 98765 01003",
        "section": "ECE - Section A",
        "department": "Electronics & Communication Engineering",
        "availability": "busy",
    },
    {
        "counselor_id": 4,
        "name": "Prof. K. Venkatesh",
        "email": "k.venkatesh@callmate.edu",
        "phone": "+91 98765 01004",
        "section": "IT - Section A",
        "department": "Information Technology",
        "availability": "available",
    },
    {
        "counselor_id": 5,
        "name": "Dr. Priya Darshini",
        "email": "priya.darshini@callmate.edu",
        "phone": "+91 98765 01005",
        "section": "AI&DS - Section A",
        "department": "Artificial Intelligence & Data Science",
        "availability": "available",
    },
]

# Pools for generating realistic, diverse Indian student names
FIRST_NAMES_MALE = [
    "Aarav", "Rohan", "Aditya", "Sai", "Varun", "Vikram", "Manoj", "Rahul",
    "Karthik", "Siddharth", "Pranav", "Naveen", "Abhishek", "Harish", "Gautam",
    "Arjun", "Nikhil", "Vishal", "Akash", "Kiran", "Teja", "Tarun", "Akhil",
    "Charan", "Sanjay", "Vivek", "Dinesh", "Surya", "Rajesh", "Ajay"
]

FIRST_NAMES_FEMALE = [
    "Sneha", "Pooja", "Ananya", "Divya", "Haritha", "Kavya", "Deepika", "Shreya",
    "Meera", "Swathi", "Rithika", "Nandini", "Pallavi", "Ishita", "Anushka",
    "Bhavya", "Tanvi", "Keerthi", "Lavanya", "Samyuktha", "Pravallika", "Sindhu",
    "Varsha", "Sahithi", "Aishwarya", "Navya", "Pranavi", "Ruchita", "Sravani", "Gayatri"
]

LAST_NAMES = [
    "Sharma", "Reddy", "Varma", "Rao", "Patel", "Gupta", "Nair", "Choudhury",
    "Verma", "Iyer", "Kulkarni", "Deshmukh", "Menon", "Bose", "Joshi",
    "Singhania", "Pillai", "Agarwal", "Bhatt", "Nambiar", "Chatterjee",
    "Mishra", "Pandey", "Chauhan", "Bhat"
]

FATHER_FIRST_NAMES = [
    "Rajesh", "Suresh", "Ramesh", "Venkat", "Anand", "Srinivas", "Mahesh",
    "Satish", "Sunil", "Vijay", "Ashok", "Mohan", "Prakash", "Dinesh", "Kishore"
]

MOTHER_FIRST_NAMES = [
    "Sunitha", "Lakshmi", "Meenakshi", "Sujatha", "Padma", "Radha", "Rekha",
    "Shanti", "Usha", "Geetha", "Sita", "Kalpana", "Shailaja", "Anuradha", "Suma"
]

REMARKS_POOL = [
    "Exemplary academic discipline and active participation in technical symposiums.",
    "Strong algorithmic problem solving ability; regularly attends coding lab sessions.",
    "Attentive during lectures; shows consistent progress in analytical coursework.",
    "Solid technical aptitude; recommended for advanced data structures mentorship.",
    "Active in university robotics and competitive hackathon initiatives.",
    "Regular attendee; exhibits constructive teamwork and communication skills.",
    "Consistently submits lab records ahead of deadlines with clean documentation.",
    "Quiet but diligent student; maintains steady test scores across all subjects.",
    "Shows high enthusiasm for artificial intelligence and cloud computing projects.",
    "Dedicated self-study routine observed; participates actively in peer discussions."
]

STATUS_WEIGHTS = [
    ("In Class", 0.50),
    ("Lab Session", 0.25),
    ("Library", 0.12),
    ("Absent", 0.08),
    ("Medical Leave", 0.05),
]


def generate_student_names(total_count: int = 250) -> List[str]:
    """Generate a guaranteed list of unique, realistic Indian full names."""
    unique_names: List[str] = []
    seen = set()

    # Alternate between male and female first names
    m_idx = 0
    f_idx = 0
    l_idx = 0
    is_male = True

    while len(unique_names) < total_count:
        if is_male:
            first = FIRST_NAMES_MALE[m_idx % len(FIRST_NAMES_MALE)]
            m_idx += 1
        else:
            first = FIRST_NAMES_FEMALE[f_idx % len(FIRST_NAMES_FEMALE)]
            f_idx += 1
        is_male = not is_male

        last = LAST_NAMES[l_idx % len(LAST_NAMES)]
        l_idx += 1

        candidate = f"{first} {last}"
        if candidate not in seen:
            seen.add(candidate)
            unique_names.append(candidate)
        else:
            # Add secondary qualifier if collision occurs (e.g. middle initial)
            candidate = f"{first} K. {last}"
            if candidate not in seen:
                seen.add(candidate)
                unique_names.append(candidate)

    return unique_names


def generate_students(counselors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Programmatically generate 250 realistic student records (50 per counselor).

    Args:
        counselors: The 5 pre-configured counselor records.

    Returns:
        List[Dict[str, Any]]: 250 student documents with embedded parents.
    """
    rng = random.Random(20261011)  # Seed for deterministic and reproducible generation
    all_names = generate_student_names(250)

    students: List[Dict[str, Any]] = []
    overall_index = 0

    for counselor in counselors:
        counselor_id = counselor["counselor_id"]
        section = counselor["section"]

        for i in range(50):
            overall_index += 1
            student_id = 1000 + overall_index  # 1001 to 1250
            student_code = f"241FA04{overall_index:03d}"  # '241FA04001' to '241FA04250'
            full_name = all_names[overall_index - 1]
            last_name = full_name.split()[-1]

            # Realistic attendance percentage from 65% to 98%
            att_int = rng.randint(65, 98)
            attendance_pct = f"{att_int}%"

            # Realistic status selection based on attendance
            if att_int < 75:
                status_choices = ["Absent", "Medical Leave", "In Class"]
                current_status = rng.choice(status_choices)
            else:
                statuses, weights = zip(*STATUS_WEIGHTS)
                current_status = rng.choices(statuses, weights=weights, k=1)[0]

            # Remarks
            if current_status == "Medical Leave":
                remarks = "Medical certificate acknowledged by counselor; catching up on coursework."
            elif current_status == "Absent":
                remarks = "Absent for today's morning roll call; parent notified via automated SMS."
            else:
                remarks = rng.choice(REMARKS_POOL)

            # Embedded parents schema (Father and Mother)
            father_first = rng.choice(FATHER_FIRST_NAMES)
            mother_first = rng.choice(MOTHER_FIRST_NAMES)

            # Unique 10-digit phone numbers: +91 98XXXXXXXX
            # Base offset ensures complete uniqueness across all 500 parent records
            father_phone_num = 9811000000 + (overall_index * 2 - 1)
            mother_phone_num = 9811000000 + (overall_index * 2)

            father_phone = f"+91 {father_phone_num}"
            mother_phone = f"+91 {mother_phone_num}"

            parents = [
                {
                    "parent_id": student_id * 10 + 1,
                    "name": f"{father_first} {last_name}",
                    "relationship": "Father",
                    "phone": father_phone,
                    "verified": True,
                },
                {
                    "parent_id": student_id * 10 + 2,
                    "name": f"{mother_first} {last_name}",
                    "relationship": "Mother",
                    "phone": mother_phone,
                    "verified": True,
                },
            ]

            student_doc: Dict[str, Any] = {
                "student_id": student_id,
                "student_code": student_code,
                "name": full_name,
                "section": section,
                "counselor_id": counselor_id,
                "attendance_pct": attendance_pct,
                "current_status": current_status,
                "remarks": remarks,
                "parents": parents,
            }

            students.append(student_doc)

    return students


def seed_database(db: Optional[Database] = None) -> Dict[str, Any]:
    """Wipe existing collections and seed with counselors and 250 students.

    Args:
        db: Optional Database instance.

    Returns:
        Dict[str, Any]: Seeding execution summary.
    """
    if db is None:
        db = get_database()

    print(f"--- CallMateAI Stage 3 Database Seeding: '{db.name}' ---")

    # 1. Wipe existing collections for clean state
    print("Clearing collections: counselors, students, calls, counselor_alerts...")
    db.counselors.delete_many({})
    db.students.delete_many({})
    db.calls.delete_many({})
    db.counselor_alerts.delete_many({})

    # 2. Re-create / ensure all unique and compound indexes
    print("Provisioning MongoDB indexes...")
    init_indexes(db)

    # 3. Insert the 5 designated Counselors
    print(f"Inserting {len(COUNSELORS_DATA)} academic counselors...")
    counselors_insert = db.counselors.insert_many(COUNSELORS_DATA)
    counselors_count = len(counselors_insert.inserted_ids)

    # 4. Generate and bulk-insert 250 students
    print("Generating 250 unique students (50 per counselor) with embedded parents...")
    students_data = generate_students(COUNSELORS_DATA)
    students_insert = db.students.insert_many(students_data)
    students_count = len(students_insert.inserted_ids)

    print(f"Successfully seeded {counselors_count} counselors and {students_count} students into MongoDB.")

    return {
        "status": "success",
        "counselors_count": counselors_count,
        "students_count": students_count,
        "database": db.name,
    }


if __name__ == "__main__":
    result = seed_database()
    print("Seed result:", result)
