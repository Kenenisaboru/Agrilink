/**
 * Security Utilities for AgriLink Platform
 * Provides security functions for input validation, XSS prevention, and data sanitization
 */

/**
 * Sanitize HTML input to prevent XSS attacks
 * @param {string} html - Raw HTML string
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeHTML = (html) => {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
};

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Ethiopian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format
 */
export const validatePhone = (phone) => {
  // Accepts formats: +251 9XX XXX XXX, 09XX XXX XXX, etc.
  const phoneRegex = /^(\+251|0)?[9]\d{8}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with strength score and feedback
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    strength: 0,
    feedback: []
  };

  if (password.length < 8) {
    result.feedback.push('Password must be at least 8 characters');
  } else {
    result.strength += 1;
  }

  if (!/[a-z]/.test(password)) {
    result.feedback.push('Password must contain lowercase letters');
  } else {
    result.strength += 1;
  }

  if (!/[A-Z]/.test(password)) {
    result.feedback.push('Password must contain uppercase letters');
  } else {
    result.strength += 1;
  }

  if (!/[0-9]/.test(password)) {
    result.feedback.push('Password must contain numbers');
  } else {
    result.strength += 1;
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    result.feedback.push('Password must contain special characters');
  } else {
    result.strength += 1;
  }

  result.isValid = result.strength >= 4;
  return result;
};

/**
 * Sanitize user input to prevent injection attacks
 * @param {string} input - Raw user input
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validate Ethiopian ID format
 * @param {string} id - ID number to validate
 * @returns {boolean} - True if valid ID format
 */
export const validateEthiopianID = (id) => {
  // Ethiopian IDs are typically 9-13 digits
  const idRegex = /^\d{9,13}$/;
  return idRegex.test(id);
};

/**
 * Generate a secure random token
 * @param {number} length - Length of token to generate
 * @returns {string} - Secure random token
 */
export const generateSecureToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  
  return result;
};

/**
 * Mask sensitive data for logging
 * @param {string} data - Sensitive data to mask
 * @param {number} visibleChars - Number of characters to keep visible
 * @returns {string} - Masked data
 */
export const maskSensitiveData = (data, visibleChars = 4) => {
  if (!data || typeof data !== 'string') return data;
  
  if (data.length <= visibleChars) return '*'.repeat(data.length);
  
  return data.substring(0, visibleChars) + '*'.repeat(data.length - visibleChars);
};

/**
 * Validate URL to prevent open redirects
 * @param {string} url - URL to validate
 * @returns {boolean} - True if URL is safe
 */
export const validateURL = (url) => {
  try {
    const parsed = new URL(url, window.location.origin);
    
    // Only allow same-origin or whitelisted domains
    const allowedDomains = [
      'agrilink.et',
      'localhost',
      window.location.hostname
    ];
    
    return allowedDomains.includes(parsed.hostname);
  } catch {
    return false;
  }
};

/**
 * Rate limiter for API calls
 */
class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getRemainingTime() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length < this.maxRequests) {
      return 0;
    }
    
    const oldestRequest = this.requests[0];
    return this.timeWindow - (now - oldestRequest);
  }
}

/**
 * CSRF token management
 */
export const CSRFManager = {
  getToken: () => {
    return localStorage.getItem('csrf_token') || '';
  },
  
  setToken: (token) => {
    localStorage.setItem('csrf_token', token);
  },
  
  clearToken: () => {
    localStorage.removeItem('csrf_token');
  },
  
  generateToken: () => {
    const token = generateSecureToken(32);
    CSRFManager.setToken(token);
    return token;
  }
};

/**
 * Session management utilities
 */
export const SessionManager = {
  setSession: (sessionData) => {
    localStorage.setItem('session', JSON.stringify(sessionData));
  },
  
  getSession: () => {
    try {
      return JSON.parse(localStorage.getItem('session')) || null;
    } catch {
      return null;
    }
  },
  
  clearSession: () => {
    localStorage.removeItem('session');
    localStorage.removeItem('csrf_token');
  },
  
  isSessionValid: () => {
    const session = SessionManager.getSession();
    if (!session) return false;
    
    const now = Date.now();
    return session.expiresAt > now;
  },
  
  refreshSession: () => {
    const session = SessionManager.getSession();
    if (!session) return false;
    
    const newExpiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    session.expiresAt = newExpiresAt;
    SessionManager.setSession(session);
    return true;
  }
};

/**
 * Content Security Policy helper
 */
export const CSPHelper = {
  /**
   * Validate that a script source is allowed
   * @param {string} source - Script source to validate
   * @returns {boolean} - True if source is allowed
   */
  isScriptAllowed: (source) => {
    const allowedSources = [
      'self',
      'agrilink.et',
      'localhost',
      'cdn.jsdelivr.net',
      'fonts.googleapis.com',
      'fonts.gstatic.com'
    ];
    
    try {
      const url = new URL(source, window.location.origin);
      return allowedSources.includes(url.hostname) || allowedSources.includes('self');
    } catch {
      return false;
    }
  }
};

/**
 * Error tracking and reporting
 */
export const ErrorTracker = {
  logError: (error, context = {}) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context
    };
    
    // In production, send to error tracking service
    console.error('Error tracked:', errorData);
    
    // Store in localStorage for debugging
    const errors = JSON.parse(localStorage.getItem('error_log') || '[]');
    errors.push(errorData);
    
    // Keep only last 50 errors
    if (errors.length > 50) {
      errors.shift();
    }
    
    localStorage.setItem('error_log', JSON.stringify(errors));
  },
  
  getErrors: () => {
    try {
      return JSON.parse(localStorage.getItem('error_log') || '[]');
    } catch {
      return [];
    }
  },
  
  clearErrors: () => {
    localStorage.removeItem('error_log');
  }
};

export default {
  sanitizeHTML,
  validateEmail,
  validatePhone,
  validatePassword,
  sanitizeInput,
  validateEthiopianID,
  generateSecureToken,
  maskSensitiveData,
  validateURL,
  RateLimiter,
  CSRFManager,
  SessionManager,
  CSPHelper,
  ErrorTracker
};
