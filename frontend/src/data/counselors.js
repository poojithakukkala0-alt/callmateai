/**
 * CallMateAI - Designated Academic Counselors Data & Resolution Helper
 * 
 * Supports both '@callmate.edu' and '@gmail.com' email domains for all 5 counselors:
 * 1 -> Dr. Lakshmi Prasad, CSE - Section A
 * 2 -> Prof. Ramesh Kumar, CSE - Section B
 * 3 -> Dr. S. Anitha, ECE - Section A
 * 4 -> Prof. K. Venkatesh, IT - Section A
 * 5 -> Dr. Priya Darshini, AI&DS - Section A
 */

export const COUNSELORS = [
  {
    counselor_id: 1,
    id: 'cns-1',
    name: 'Dr. Lakshmi Prasad',
    emails: ['lakshmi.prasad@callmate.edu', 'lakshmi.prasad@gmail.com'],
    section: 'CSE - Section A',
    department: 'Computer Science & Engineering',
    phone: '+91 98765 01001',
    role: 'Academic Counselor',
    status: 'Available',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    assignedClass: 'CSE - Section A'
  },
  {
    counselor_id: 2,
    id: 'cns-2',
    name: 'Prof. Ramesh Kumar',
    emails: ['ramesh.kumar@callmate.edu', 'ramesh.kumar@gmail.com'],
    section: 'CSE - Section B',
    department: 'Computer Science & Engineering',
    phone: '+91 98765 01002',
    role: 'Academic Counselor',
    status: 'Available',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    assignedClass: 'CSE - Section B'
  },
  {
    counselor_id: 3,
    id: 'cns-3',
    name: 'Dr. S. Anitha',
    emails: ['s.anitha@callmate.edu', 's.anitha@gmail.com'],
    section: 'ECE - Section A',
    department: 'Electronics & Communication Engineering',
    phone: '+91 98765 01003',
    role: 'Academic Counselor',
    status: 'Available',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    assignedClass: 'ECE - Section A'
  },
  {
    counselor_id: 4,
    id: 'cns-4',
    name: 'Prof. K. Venkatesh',
    emails: ['k.venkatesh@callmate.edu', 'k.venkatesh@gmail.com'],
    section: 'IT - Section A',
    department: 'Information Technology',
    phone: '+91 98765 01004',
    role: 'Academic Counselor',
    status: 'Available',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    assignedClass: 'IT - Section A'
  },
  {
    counselor_id: 5,
    id: 'cns-5',
    name: 'Dr. Priya Darshini',
    emails: ['priya.darshini@callmate.edu', 'priya.darshini@gmail.com'],
    section: 'AI&DS - Section A',
    department: 'Artificial Intelligence & Data Science',
    phone: '+91 98765 01005',
    role: 'Academic Counselor',
    status: 'Available',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    assignedClass: 'AI&DS - Section A'
  }
];

/**
 * Resolves a counselor record matching given email address.
 * Matches either '@callmate.edu' or '@gmail.com' for all 5 counselors.
 */
export function findCounselorByEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const normalized = email.trim().toLowerCase();

  // 1. Direct match in emails array
  const exact = COUNSELORS.find((c) =>
    c.emails.some((e) => e.toLowerCase() === normalized)
  );
  if (exact) return exact;

  // 2. Prefix username match (e.g., 'lakshmi.prasad', 'ramesh.kumar', etc.)
  const [username, domain] = normalized.split('@');
  if (username && (domain === 'callmate.edu' || domain === 'gmail.com')) {
    const matched = COUNSELORS.find((c) =>
      c.emails.some((e) => e.split('@')[0].toLowerCase() === username)
    );
    if (matched) return matched;
  }

  return null;
}

/**
 * Clean, realistic initial call records for all 5 counselors (NO dummy records like 'Mom (Sarah)' or 'Amit Kumar')
 */
export function getInitialCounselorCalls() {
  return [
    {
      id: 'call-c1-01',
      callerName: 'Rajesh Sharma',
      callerPhone: '+91 98450 11223',
      studentName: 'Aarav Sharma',
      studentCode: 'STU-101',
      counselorId: 1,
      counselor_id: 1,
      timestamp: '25 mins ago',
      duration: '2m 10s',
      outcome: 'Completed',
      displayOutcome: 'AI Handled',
      status: 'General',
      summary: 'Parent inquired about term exam syllabus; CallMateAI autonomously summarized required chapters and schedule.',
      tag: 'ai_handled',
      transcript: [
        { sender: 'AI', text: 'Hello! I am CallMateAI for Dr. Lakshmi Prasad. How can I assist you today?' },
        { sender: 'Caller', text: 'Hello, I wanted to confirm Aarav Sharma’s Mathematics term examination syllabus.' },
        { sender: 'AI', text: 'Aarav’s records indicate Units 1 through 4 are included. The timetable has been synced to your parent portal.' },
        { sender: 'Caller', text: 'Thank you, that helps a lot!' }
      ],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'call-c1-02',
      callerName: 'Meenakshi Iyer',
      callerPhone: '+91 98450 44556',
      studentName: 'Ananya Iyer',
      studentCode: 'STU-102',
      counselorId: 1,
      counselor_id: 1,
      timestamp: '1 hour ago',
      duration: '3m 45s',
      outcome: 'Completed',
      displayOutcome: 'Handover',
      status: 'Important',
      summary: 'Emergency concern regarding laboratory injury; counselor accepted handover and coordinated school medical room assistance.',
      tag: 'handover',
      transcript: [
        { sender: 'AI', text: 'CallMateAI online. Connecting your message for Dr. Lakshmi Prasad.' },
        { sender: 'Caller', text: 'Please connect me immediately! Ananya informed me about an issue in Chemistry lab.' },
        { sender: 'AI', text: '🚨 High urgency detected. Transferring audio directly to Dr. Lakshmi Prasad now.' },
        { sender: 'AI', text: '✅ Counselor Dr. Lakshmi Prasad joined the call and verified student safety.' }
      ],
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'call-c1-03',
      callerName: 'Sanjay Patel',
      callerPhone: '+91 98450 99001',
      studentName: 'Diya Patel',
      studentCode: 'STU-104',
      counselorId: 1,
      counselor_id: 1,
      timestamp: '3 hours ago',
      duration: '1m 15s',
      outcome: 'Completed',
      displayOutcome: 'Completed',
      status: 'General',
      summary: 'Parent confirmed permission for inter-college AI hackathon participation.',
      tag: 'completed',
      transcript: [
        { sender: 'AI', text: 'CallMateAI concierge answering for Dr. Lakshmi Prasad.' },
        { sender: 'Caller', text: 'Confirming that Diya Patel has parental approval for the Saturday Hackathon.' },
        { sender: 'AI', text: 'Approval registered in student activity roster. Thank you!' }
      ],
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'call-c2-01',
      callerName: 'Vikram Varma',
      callerPhone: '+91 98450 77889',
      studentName: 'Rohan Varma',
      studentCode: 'STU-103',
      counselorId: 2,
      counselor_id: 2,
      timestamp: '45 mins ago',
      duration: '1m 55s',
      outcome: 'Completed',
      displayOutcome: 'AI Handled',
      status: 'General',
      summary: 'Autonomous attendance confirmation for CSE - Section B basketball tournament leave.',
      tag: 'ai_handled',
      transcript: [
        { sender: 'AI', text: 'Welcome to CallMateAI for Prof. Ramesh Kumar. How may I assist?' },
        { sender: 'Caller', text: 'Checking if Rohan Varma’s sports attendance exemption was approved.' },
        { sender: 'AI', text: 'Yes, Rohan has official sports duty leave recorded for Section B.' }
      ],
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'call-c2-02',
      callerName: 'Sunitha Reddy',
      callerPhone: '+91 98450 22334',
      studentName: 'Aditya Reddy',
      studentCode: 'STU-105',
      counselorId: 2,
      counselor_id: 2,
      timestamp: '2 hours ago',
      duration: '4m 12s',
      outcome: 'Completed',
      displayOutcome: 'Handover',
      status: 'Important',
      summary: 'Urgent consultation requested regarding mid-term academic counseling; Prof. Ramesh Kumar took over.',
      tag: 'handover',
      transcript: [
        { sender: 'AI', text: 'CallMateAI assistant for Prof. Ramesh Kumar.' },
        { sender: 'Caller', text: 'Need direct counseling handover regarding Aditya’s elective selection.' },
        { sender: 'AI', text: 'Handover initiated. Connecting to Prof. Ramesh Kumar now.' }
      ],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'call-c3-01',
      callerName: 'Venkat Iyer',
      callerPhone: '+91 98450 55667',
      studentName: 'Varun Iyer',
      studentCode: 'STU-107',
      counselorId: 3,
      counselor_id: 3,
      timestamp: '1 hour ago',
      duration: '1m 30s',
      outcome: 'Completed',
      displayOutcome: 'AI Handled',
      status: 'General',
      summary: 'Verified ECE circuit lab schedule and attendance record.',
      tag: 'ai_handled',
      transcript: [
        { sender: 'AI', text: 'CallMateAI answering for Dr. S. Anitha (ECE - Section A).' },
        { sender: 'Caller', text: 'Is Varun’s lab session scheduled until 4 PM today?' },
        { sender: 'AI', text: 'Yes, VLSI Design laboratory concludes at 4:00 PM.' }
      ],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'call-c4-01',
      callerName: 'Srinivas Gupta',
      callerPhone: '+91 98450 88990',
      studentName: 'Pranav Gupta',
      studentCode: 'STU-109',
      counselorId: 4,
      counselor_id: 4,
      timestamp: '35 mins ago',
      duration: '2m 05s',
      outcome: 'Completed',
      displayOutcome: 'AI Handled',
      status: 'General',
      summary: 'IT Department internship submission query answered autonomously.',
      tag: 'ai_handled',
      transcript: [
        { sender: 'AI', text: 'CallMateAI assistant for Prof. K. Venkatesh (IT - Section A).' },
        { sender: 'Caller', text: 'Checking if internship NOC forms are submitted.' },
        { sender: 'AI', text: 'Pranav’s NOC documentation is verified and marked complete.' }
      ],
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'call-c5-01',
      callerName: 'Ashok Choudhury',
      callerPhone: '+91 98450 98765',
      studentName: 'Naveen Choudhury',
      studentCode: 'STU-111',
      counselorId: 5,
      counselor_id: 5,
      timestamp: '50 mins ago',
      duration: '2m 40s',
      outcome: 'Completed',
      displayOutcome: 'AI Handled',
      status: 'General',
      summary: 'Verified AI&DS Machine Learning project showcase dates and attendance percentage.',
      tag: 'ai_handled',
      transcript: [
        { sender: 'AI', text: 'Hello! CallMateAI for Dr. Priya Darshini (AI&DS - Section A).' },
        { sender: 'Caller', text: 'Confirming Naveen Choudhury’s project submission status.' },
        { sender: 'AI', text: 'Naveen has 94% attendance and his Deep Learning project proposal is approved.' }
      ],
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80'
    }
  ];
}
