/**
 * CallMateAI - Password Hashing Utility
 * Client-Side Demonstration Hashing using SHA-256
 * 
 * NOTE: As this is a frontend-only application, client-side hashing is used
 * to avoid storing raw plaintext passwords in browser localStorage.
 * In a production architecture, password hashing and verification is strictly
 * handled server-side using Argon2 or bcrypt.
 */

const DEMO_SALT = 'callmate_ai_secure_salt_v1_';

export async function hashPassword(plainPassword) {
  if (!plainPassword) return '';
  const textWithSalt = `${DEMO_SALT}${plainPassword}`;
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(textWithSalt);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch {
      // Fallback
    }
  }

  // Fallback simple deterministic hash if Web Crypto is unavailable
  let hash = 0;
  for (let i = 0; i < textWithSalt.length; i++) {
    const char = textWithSalt.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `fallback_hash_${Math.abs(hash).toString(16)}`;
}
