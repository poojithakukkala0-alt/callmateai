/**
 * CallMateAI - LocalStorage Storage Manager
 * Versioned keys, safe JSON parsing, and graceful fallbacks
 */

import { INITIAL_CALLERS, INITIAL_CALLS, INITIAL_ALERTS } from '../data/sampleData';
import { hashPassword } from './crypto';

const STORAGE_PREFIX = 'callmate_v1_';

export const KEYS = {
  USERS: `${STORAGE_PREFIX}users`,
  SESSION: `${STORAGE_PREFIX}session`,
  CALLERS: `${STORAGE_PREFIX}callers`,
  CALLS: `${STORAGE_PREFIX}calls`,
  ALERTS: `${STORAGE_PREFIX}alerts`,
  PREFERENCES: `${STORAGE_PREFIX}preferences`,
  THEME: `${STORAGE_PREFIX}theme`
};

/**
 * Safe local storage reader
 */
export function getStorageItem(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    if (item === null || item === undefined) return defaultValue;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`[CallMateAI Storage] Error parsing ${key}:`, err);
    return defaultValue;
  }
}

/**
 * Safe local storage writer
 */
export function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[CallMateAI Storage] Error saving ${key}:`, err);
    return false;
  }
}

/**
 * Safe local storage remover
 */
export function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`[CallMateAI Storage] Error removing ${key}:`, err);
  }
}

/**
 * Initialize storage with initial sample data if not already present.
 * Never overwrites existing user data on subsequent boots.
 */
export async function initializeStorage() {
  // 1. Initialize Users (seed demo user thanu@gmail.com / CallMate@123)
  const existingUsers = getStorageItem(KEYS.USERS, null);
  if (!existingUsers) {
    const demoPasswordHash = await hashPassword('CallMate@123');
    const defaultUsers = [
      {
        id: 'usr-demo-1',
        name: 'Thanu Sharma',
        email: 'thanu@gmail.com',
        passwordHash: demoPasswordHash,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        role: 'Personal Account',
        createdAt: new Date().toISOString()
      }
    ];
    setStorageItem(KEYS.USERS, defaultUsers);
  }

  // 2. Initialize Callers
  const existingCallers = getStorageItem(KEYS.CALLERS, null);
  if (!existingCallers) {
    setStorageItem(KEYS.CALLERS, INITIAL_CALLERS);
  }

  // 3. Initialize Calls History
  const existingCalls = getStorageItem(KEYS.CALLS, null);
  if (!existingCalls) {
    setStorageItem(KEYS.CALLS, INITIAL_CALLS);
  }

  // 4. Initialize Alerts
  const existingAlerts = getStorageItem(KEYS.ALERTS, null);
  if (!existingAlerts) {
    setStorageItem(KEYS.ALERTS, INITIAL_ALERTS);
  }

  // 5. Initialize Preferences
  const existingPrefs = getStorageItem(KEYS.PREFERENCES, null);
  if (!existingPrefs) {
    setStorageItem(KEYS.PREFERENCES, {
      soundEnabled: true,
      pushNotifications: true,
      autoSummarize: true,
      autoHandoverThreshold: 'high',
      voiceAssistantStyle: 'Friendly & Concise',
      vibration: true
    });
  }

  // 6. Initialize Theme
  const existingTheme = getStorageItem(KEYS.THEME, null);
  if (!existingTheme) {
    setStorageItem(KEYS.THEME, 'midnight');
  }
}

/**
 * Restores sample records to default initial state (used by Reset Demo Data)
 */
export async function resetDemoData() {
  setStorageItem(KEYS.CALLERS, INITIAL_CALLERS);
  setStorageItem(KEYS.CALLS, INITIAL_CALLS);
  setStorageItem(KEYS.ALERTS, INITIAL_ALERTS);
  setStorageItem(KEYS.PREFERENCES, {
    soundEnabled: true,
    pushNotifications: true,
    autoSummarize: true,
    autoHandoverThreshold: 'high',
    voiceAssistantStyle: 'Friendly & Concise',
    vibration: true
  });
  setStorageItem(KEYS.THEME, 'midnight');
  return true;
}
