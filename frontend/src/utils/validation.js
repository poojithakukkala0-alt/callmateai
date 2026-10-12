/**
 * CallMateAI - Form Validation Utilities
 * Strictly implements rules specified for email and password validation
 */

/**
 * Normalizes email: trims whitespace and converts to lowercase
 */
export function normalizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Validates normalized email:
 * 1. Must match valid email structure
 * 2. Domain must be EXACTLY "gmail.com"
 * Rejects other domains (yahoo.com, hotmail.com, etc.), fake subdomains, or malformed suffixes
 */
export function validateEmail(rawEmail) {
  const email = normalizeEmail(rawEmail);

  if (!email) {
    return {
      isValid: false,
      error: 'Email address is required.',
      normalized: ''
    };
  }

  // General email syntax test
  const generalEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!generalEmailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email format.',
      normalized: email
    };
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return {
      isValid: false,
      error: 'Invalid email format.',
      normalized: email
    };
  }

  const [username, domain] = parts;

  if (!username || username.length < 1) {
    return {
      isValid: false,
      error: 'Email must include a username before @.',
      normalized: email
    };
  }

  // Domain must be EXACTLY "gmail.com"
  if (domain !== 'gmail.com') {
    return {
      isValid: false,
      error: 'Only Google Mail accounts (@gmail.com) are accepted for CallMateAI demo.',
      normalized: email
    };
  }

  return {
    isValid: true,
    error: null,
    normalized: email
  };
}

/**
 * Checks password against live requirements:
 * 1. At least 8 characters
 * 2. At least one lowercase letter (a-z)
 * 3. At least one uppercase letter (A-Z)
 * 4. At least one special character (!@#$%^&* etc.)
 */
export function validatePassword(password) {
  const p = password || '';
  const hasMinLength = p.length >= 8;
  const hasLowercase = /[a-z]/.test(p);
  const hasUppercase = /[A-Z]/.test(p);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(p);

  const criteria = [
    { id: 'length', label: 'At least 8 characters', met: hasMinLength },
    { id: 'lowercase', label: 'One lowercase letter (a-z)', met: hasLowercase },
    { id: 'uppercase', label: 'One uppercase letter (A-Z)', met: hasUppercase },
    { id: 'special', label: 'One special character (!@#$%^&*)', met: hasSpecial }
  ];

  const isValid = hasMinLength && hasLowercase && hasUppercase && hasSpecial;

  return {
    isValid,
    criteria,
    error: isValid ? null : 'Password does not meet all security criteria.'
  };
}
