/**
 * CallMateAI - Initial Demo Sample Data
 * Universal personal AI call assistant sample records (strictly <= 10 items per list)
 */

export const INITIAL_CALLERS = [
  {
    id: 'clr-1',
    name: 'Mom (Sarah)',
    phone: '+1 (555) 234-8901',
    category: 'Family & VIP',
    priority: 'High',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    notes: 'Always route with high priority. Checks in during evenings.',
    lastCalled: '10 mins ago',
    totalCalls: 14
  },
  {
    id: 'clr-2',
    name: 'Rahul Verma',
    phone: '+91 98765 43210',
    category: 'VIP Client',
    priority: 'High',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    notes: 'Managing partner at Apex Corp. Always needs fast callback or direct handover.',
    lastCalled: 'Today, 10:24 AM',
    totalCalls: 8
  },
  {
    id: 'clr-3',
    name: 'Priya Sharma',
    phone: '+91 91234 56789',
    category: 'Healthcare',
    priority: 'Medium',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    notes: 'Metro Clinic care coordinator. Call for routine appointment confirmation.',
    lastCalled: 'Today, 09:15 AM',
    totalCalls: 3
  },
  {
    id: 'clr-4',
    name: 'Amit Kumar',
    phone: '+91 99887 66554',
    category: 'Business Partner',
    priority: 'High',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    notes: 'Legal counsel regarding upcoming partnership agreements.',
    lastCalled: 'Today, 08:40 AM',
    totalCalls: 5
  },
  {
    id: 'clr-5',
    name: 'Elena Rostova',
    phone: '+1 (555) 891-2304',
    category: 'School & Family',
    priority: 'Medium',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    notes: 'School principal assistant checking scheduled parent-teacher slot.',
    lastCalled: 'Yesterday',
    totalCalls: 2
  },
  {
    id: 'clr-6',
    name: 'Marcus Vance',
    phone: '+1 (555) 431-7729',
    category: 'Financial Advisory',
    priority: 'Low',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    notes: 'Quarterly portfolio review scheduling. AI handles scheduling automatically.',
    lastCalled: '2 days ago',
    totalCalls: 6
  },
  {
    id: 'clr-7',
    name: 'Delivery Express (Rider)',
    phone: '+91 98200 11223',
    category: 'Delivery / Courier',
    priority: 'Medium',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    notes: 'Package delivery at apartment front gate.',
    lastCalled: '3 days ago',
    totalCalls: 4
  }
];

export const INITIAL_CALLS = [
  {
    id: 'call-101',
    callerName: 'Mom (Sarah)',
    callerPhone: '+1 (555) 234-8901',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    timestamp: '10 mins ago',
    duration: '2m 14s',
    category: 'Family & VIP',
    status: 'Important',
    outcome: 'Completed',
    summary: 'Checked in on weekend dinner plans; AI scheduled reminder for Friday 7 PM.',
    transcript: [
      { sender: 'AI', text: 'Hello! I am CallMateAI, answering on behalf of Thanu. How can I help you today?' },
      { sender: 'Caller', text: 'Hi sweetheart, it is Mom! Just wanted to know if we are still having family dinner this Friday.' },
      { sender: 'AI', text: 'Hi Sarah! Yes, Thanu has Friday evening marked open. I will ping a reminder and confirm the reservation with you.' },
      { sender: 'Caller', text: 'Wonderful, thank you so much! Tell him I called.' },
      { sender: 'AI', text: 'You got it! Have a wonderful day!' }
    ]
  },
  {
    id: 'call-102',
    callerName: 'Rahul Verma',
    callerPhone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    timestamp: '10:24 AM',
    duration: '1m 45s',
    category: 'VIP Client',
    status: 'Important',
    outcome: 'Handover',
    summary: 'Urgent contract amendment question. Handed over priority alert to phone notification.',
    transcript: [
      { sender: 'AI', text: 'Welcome to CallMateAI. Thanu is currently in a strategy meeting.' },
      { sender: 'Caller', text: 'Rahul here from Apex. We need immediate clarification on Clause 4 before noon.' },
      { sender: 'AI', text: 'Understood, Rahul. I am categorizing this as High Priority and alerting Thanu immediately.' },
      { sender: 'Caller', text: 'Appreciate it, please expedite.' }
    ]
  },
  {
    id: 'call-103',
    callerName: 'Priya Sharma',
    callerPhone: '+91 91234 56789',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    timestamp: '09:15 AM',
    duration: '52s',
    category: 'Healthcare',
    status: 'General',
    outcome: 'AI Handled',
    summary: 'Confirmed dental checkup appointment for Thursday at 3:00 PM without disturbing user.',
    transcript: [
      { sender: 'AI', text: 'Hi! CallMateAI here. How can I assist?' },
      { sender: 'Caller', text: 'Calling from Metro Dental to confirm Thanu’s cleaning for Thursday at 3 PM.' },
      { sender: 'AI', text: 'Confirmed. The appointment is added to Thanu’s calendar. Thank you!' }
    ]
  },
  {
    id: 'call-104',
    callerName: 'Amit Kumar',
    callerPhone: '+91 99887 66554',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    timestamp: '08:40 AM',
    duration: '3m 10s',
    category: 'Business',
    status: 'Business',
    outcome: 'Completed',
    summary: 'Discussed draft feedback for Q4 investor deck. AI summarized action items.',
    transcript: [
      { sender: 'AI', text: 'CallMateAI online. Connecting your message to Thanu.' },
      { sender: 'Caller', text: 'Let him know slides 8 through 12 look solid. Sending email recap.' },
      { sender: 'AI', text: 'Noted with priority flag. Notification sent!' }
    ]
  },
  {
    id: 'call-105',
    callerName: 'Elena Rostova',
    callerPhone: '+1 (555) 891-2304',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    timestamp: 'Yesterday',
    duration: '1m 15s',
    category: 'School & Family',
    status: 'General',
    outcome: 'AI Handled',
    summary: 'Inquired about permission slip for science museum field trip.',
    transcript: [
      { sender: 'AI', text: 'CallMateAI answering for Thanu.' },
      { sender: 'Caller', text: 'Just confirming receipt of field trip waiver form.' },
      { sender: 'AI', text: 'Thanu submitted the signed e-form this morning. Have a great day!' }
    ]
  },
  {
    id: 'call-106',
    callerName: 'Marcus Vance',
    callerPhone: '+1 (555) 431-7729',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    timestamp: 'Yesterday',
    duration: '45s',
    category: 'Finance',
    status: 'General',
    outcome: 'AI Handled',
    summary: 'Quarterly statement dispatched; notified user of statement availability.',
    transcript: [
      { sender: 'AI', text: 'CallMateAI automated concierge.' },
      { sender: 'Caller', text: 'Statement for September is ready in your portal.' },
      { sender: 'AI', text: 'Logged into user reminders. Thanks Marcus!' }
    ]
  },
  {
    id: 'call-107',
    callerName: 'Courier Rider (FedEx)',
    callerPhone: '+91 98200 11223',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    timestamp: '2 days ago',
    duration: '38s',
    category: 'Delivery',
    status: 'Attention',
    outcome: 'Handover',
    summary: 'Parcel requires OTP passcode at main reception gate.',
    transcript: [
      { sender: 'AI', text: 'CallMateAI assistant. How can I help?' },
      { sender: 'Caller', text: 'I am at gate 2 with package #4410. Need one-time password.' },
      { sender: 'AI', text: 'Broadcasting instant push alert to Thanu for OTP code.' }
    ]
  }
];

export const INITIAL_ALERTS = [
  {
    id: 'alt-1',
    title: 'Urgent Callback Requested - Contract Clause 4',
    callerName: 'Rahul Verma',
    callerPhone: '+91 98765 43210',
    severity: 'High',
    status: 'Active',
    category: 'VIP Client',
    timestamp: '15 mins ago',
    description: 'Requires rapid decision on legal terms before 12:00 PM EST. Handover flagged.',
    acknowledged: false
  },
  {
    id: 'alt-2',
    title: 'Gate Delivery Verification Needed',
    callerName: 'Courier Rider (FedEx)',
    callerPhone: '+91 98200 11223',
    severity: 'Medium',
    status: 'Active',
    category: 'Courier',
    timestamp: '35 mins ago',
    description: 'Rider is at main entrance waiting for security OTP code verification.',
    acknowledged: false
  },
  {
    id: 'alt-3',
    title: 'Family Medical Follow-Up Reminder',
    callerName: 'Priya Sharma (Clinic)',
    callerPhone: '+91 91234 56789',
    severity: 'High',
    status: 'Active',
    category: 'Healthcare',
    timestamp: '1 hour ago',
    description: 'Doctor requested verification of prescription refill before pharmacy closes.',
    acknowledged: false
  },
  {
    id: 'alt-4',
    title: 'Parent-Teacher Meeting Rescheduled',
    callerName: 'Elena Rostova',
    callerPhone: '+1 (555) 891-2304',
    severity: 'Medium',
    status: 'Resolved',
    category: 'Family',
    timestamp: 'Yesterday',
    description: 'Slot moved to Friday 4:00 PM. AI automatically synced to personal calendar.',
    acknowledged: true
  }
];

export const CALL_ACTIVITY_WEEK = [
  { day: 'Mon', total: 4, aiHandled: 3, escalated: 1 },
  { day: 'Tue', total: 7, aiHandled: 5, escalated: 2 },
  { day: 'Wed', total: 11, aiHandled: 8, escalated: 3 },
  { day: 'Thu', total: 9, aiHandled: 7, escalated: 2 },
  { day: 'Fri', total: 14, aiHandled: 11, escalated: 3 },
  { day: 'Sat', total: 6, aiHandled: 5, escalated: 1 },
  { day: 'Sun', total: 3, aiHandled: 3, escalated: 0 }
];

export const CALL_OUTCOMES_DATA = [
  { name: 'Completed & Resolved', value: 60, color: '#38bdf8' },
  { name: 'AI Handled Routine', value: 25, color: '#8b5cf6' },
  { name: 'Escalated to Human', value: 10, color: '#f59e0b' },
  { name: 'Declined / Spam Blocked', value: 5, color: '#ef4444' }
];

export const DEMO_STATS_SUMMARY = {
  totalCalls: 12,
  callsChange: '+20% from last week',
  importantCalls: 5,
  importantChange: '+3 new today',
  requiringAttention: 3,
  attentionChange: '+2 urgent',
  handoverCompleted: 4,
  handoverChange: '+1 today'
};
