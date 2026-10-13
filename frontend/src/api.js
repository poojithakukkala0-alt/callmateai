/**
 * CallMateAI Unified API Client
 * Configured to communicate with the FastAPI backend engine.
 * Target URL is dynamically configured via VITE_API_BASE_URL environment variable.
 */

// Resolve base URL from Vite environment or default to local FastAPI server
export const API_BASE_URL =
  (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://127.0.0.1:8000';

/**
 * Core generic request helper with JSON parsing and standardized error handling.
 *
 * @param {string} endpoint - Relative path (e.g., '/api/health')
 * @param {RequestInit} [options={}] - Fetch configuration options
 * @returns {Promise<any>}
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL.replace(/\/+$/, '')}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Parse JSON or return empty object on 204 No Content
    const data =
      response.status === 204
        ? {}
        : await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg =
        data.detail ||
        data.message ||
        `HTTP ${response.status}: ${response.statusText}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[CallMateAI API Error] ${options.method || 'GET'} ${url}:`, err);
    throw err;
  }
}

// =====================================================================
// System & Health Endpoints
// =====================================================================

/**
 * Check root status of CallMateAI backend.
 */
export async function getRoot() {
  return request('/');
}

/**
 * Check backend telemetry and service health metrics.
 */
export async function checkHealth() {
  return request('/api/health');
}

// =====================================================================
// Students API
// =====================================================================

/**
 * Retrieve all registered student profiles.
 * Merges MongoDB server records with locally scoped counselor additions.
 */
export async function fetchStudents() {
  const serverStudents = await request('/api/students');
  try {
    const custom = JSON.parse(localStorage.getItem('callmate_v1_custom_students') || '[]');
    if (Array.isArray(custom) && custom.length > 0) {
      return [...serverStudents, ...custom];
    }
  } catch (err) {
    console.warn('[CallMateAI API] Failed reading custom student cache:', err);
  }
  return serverStudents;
}

/**
 * Retrieve a single student's complete record by ID.
 * @param {number|string} studentId
 */
export async function fetchStudentById(studentId) {
  try {
    const custom = JSON.parse(localStorage.getItem('callmate_v1_custom_students') || '[]');
    const match = custom.find((s) => String(s.student_id) === String(studentId));
    if (match) return match;
  } catch (e) {
    // ignore
  }
  return request(`/api/students/${studentId}`);
}

/**
 * Add a new student contact scoped to the active counselor.
 * Appends to local storage so directory displays count 51, 52, etc.
 * @param {Object} studentData
 */
export function addStudentContact(studentData) {
  try {
    const customKey = 'callmate_v1_custom_students';
    const custom = JSON.parse(localStorage.getItem(customKey) || '[]');

    let activeCounselor = null;
    try {
      activeCounselor = JSON.parse(localStorage.getItem('callmate_current_counselor') || 'null');
    } catch (_) {}

    const counselorId = Number(
      studentData.counselor_id ||
      studentData.counselorId ||
      activeCounselor?.counselor_id ||
      1
    );
    const counselorName =
      studentData.counselor_name ||
      studentData.counselorName ||
      activeCounselor?.name ||
      'Dr. Lakshmi Prasad';
    const defaultSection =
      studentData.section ||
      activeCounselor?.section ||
      'CSE - Section A';

    const newStudentId = 2000 + custom.length + 1;
    const newStudent = {
      student_id: newStudentId,
      student_code: `STU-${newStudentId}`,
      name: studentData.studentName || studentData.name,
      section: defaultSection,
      counselor_id: counselorId,
      counselor_name: counselorName,
      attendance_pct: studentData.attendance_pct || '88%',
      current_status: 'Good Standing',
      parents: [
        {
          name: studentData.parentName || 'Primary Guardian',
          phone: studentData.phone || '+91 9800000000',
          relationship: 'Parent'
        }
      ],
      remarks: studentData.notes || `Student contact assigned to ${counselorName} (Counselor ${counselorId}).`
    };

    custom.push(newStudent);
    localStorage.setItem(customKey, JSON.stringify(custom));
    return newStudent;
  } catch (err) {
    console.error('[CallMateAI API] Failed to add student contact:', err);
    throw err;
  }
}

/**
 * Record a completed call for a contact in local storage so that
 * CallerDirectory updates the contact card in place (lastCalled, totalCalls, priority).
 * @param {Object} params
 * @param {number|string} params.studentId
 * @param {string} [params.phone]
 * @param {'High'|'Medium'|'Low'} params.riskLevel
 */
export function recordCallCompletionForContact({ studentId, phone, riskLevel }) {
  try {
    const key = 'callmate_v1_caller_updates';
    const existingUpdates = JSON.parse(localStorage.getItem(key) || '{}');
    const lookupKey = studentId ? String(studentId) : String(phone);

    const prev = existingUpdates[lookupKey] || { totalCallsAdded: 0 };
    existingUpdates[lookupKey] = {
      lastCalled: 'Just now',
      totalCallsAdded: (prev.totalCallsAdded || 0) + 1,
      priority: riskLevel || 'Low',
      timestamp: Date.now()
    };

    localStorage.setItem(key, JSON.stringify(existingUpdates));

    // Also update KEYS.CALLERS in localStorage if present, in-place without duplicate
    const callersKey = 'callmate_v1_callers';
    const existingCallers = JSON.parse(localStorage.getItem(callersKey) || '[]');
    if (Array.isArray(existingCallers) && existingCallers.length > 0) {
      const updatedCallers = existingCallers.map((c) => {
        const matches =
          (studentId && (String(c.studentId) === String(studentId) || String(c.student_id) === String(studentId))) ||
          (phone && c.phone === phone);
        if (matches) {
          return {
            ...c,
            lastCalled: 'Just now',
            totalCalls: (c.totalCalls || 0) + 1,
            priority: riskLevel || c.priority || 'Low'
          };
        }
        return c;
      });
      localStorage.setItem(callersKey, JSON.stringify(updatedCallers));
    }

    return existingUpdates[lookupKey];
  } catch (err) {
    console.error('[CallMateAI API] Failed to record call completion for contact:', err);
  }
}

// =====================================================================
// Calls API (Lifecycle, Forwarding, Messaging, Handover)
// =====================================================================

/**
 * Initiate an incoming parent call session.
 * @param {number} studentId - Student identifier
 * @param {number} counselorId - Assigned counselor identifier
 */
export async function createCall(studentId, counselorId) {
  return request('/api/calls', {
    method: 'POST',
    body: JSON.stringify({
      student_id: Number(studentId),
      counselor_id: Number(counselorId),
    }),
  });
}

/**
 * Retrieve all active and archived call sessions.
 */
export async function fetchCalls() {
  return request('/api/calls');
}

/**
 * Retrieve current status and message transcript for a specific call.
 * @param {number|string} callId
 */
export async function fetchCallById(callId) {
  return request(`/api/calls/${callId}`);
}

/**
 * Forward an incoming call to the AI agent.
 * @param {number|string} callId
 * @param {string} [target='ai_agent']
 */
export async function forwardCallToAgent(callId, target = 'ai_agent') {
  return request(`/api/calls/${callId}/forward`, {
    method: 'POST',
    body: JSON.stringify({ target }),
  });
}

/**
 * Post a caller message to the active AI agent.
 * Automatically triggers emergency handover detection if critical keywords are present.
 * @param {number|string} callId
 * @param {string} messageText
 */
export async function sendCallMessage(callId, messageText) {
  return request(`/api/calls/${callId}/message`, {
    method: 'POST',
    body: JSON.stringify({ message: messageText }),
  });
}

/**
 * Accept counselor handover takeover.
 * @param {number|string} callId
 * @param {string} [reason='Counselor takeover accepted']
 */
export async function requestHandover(callId, reason = 'Counselor takeover accepted') {
  return request(`/api/calls/${callId}/handover`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

/**
 * Conclude and archive a call session.
 * @param {number|string} callId
 */
export const completeCall = async (callId) => {
  const cleanBase = API_BASE_URL.replace(/\/+$/, '');
  const res = await fetch(`${cleanBase}/api/calls/${callId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'completed' })
  });
  return res.json();
};

// =====================================================================
// Emergencies & Counselor Alerts API
// =====================================================================

/**
 * List emergency incidents for dashboard monitoring.
 * @param {string} [statusFilter='open'] - 'open', 'acknowledged', 'resolved', or 'all'
 */
export async function fetchEmergencies(statusFilter = 'open') {
  const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
  return request(`/api/emergencies${query}`);
}

/**
 * Retrieve details of a specific emergency record.
 * @param {number|string} emergencyId
 */
export async function fetchEmergencyById(emergencyId) {
  return request(`/api/emergencies/${emergencyId}`);
}

/**
 * Counselor acknowledges an active emergency incident.
 * @param {number|string} emergencyId
 */
export async function acknowledgeEmergency(emergencyId) {
  return request(`/api/emergencies/${emergencyId}/acknowledge`, {
    method: 'POST',
  });
}

/**
 * Counselor marks an emergency incident as resolved.
 * @param {number|string} emergencyId
 * @param {string} [resolutionNote='Resolved by counselor']
 */
export async function resolveEmergency(emergencyId, resolutionNote = 'Resolved by counselor') {
  return request(`/api/emergencies/${emergencyId}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ note: resolutionNote }),
  });
}

// Export default object bundle
const api = {
  API_BASE_URL,
  getRoot,
  checkHealth,
  fetchStudents,
  fetchStudentById,
  createCall,
  fetchCalls,
  fetchCallById,
  forwardCallToAgent,
  sendCallMessage,
  requestHandover,
  completeCall,
  fetchEmergencies,
  fetchEmergencyById,
  acknowledgeEmergency,
  resolveEmergency,
  addStudentContact,
  recordCallCompletionForContact,
};

export default api;
