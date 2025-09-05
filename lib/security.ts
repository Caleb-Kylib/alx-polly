/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param input - The input string to sanitize
 * @returns Sanitized string safe for HTML display
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitizes text content for safe display (removes HTML tags)
 * @param input - The input string to sanitize
 * @returns Sanitized string with HTML tags removed
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validates and sanitizes poll question input
 * @param question - The poll question to validate
 * @returns Object with sanitized question and validation errors
 */
export function validatePollQuestion(question: string): {
  sanitized: string;
  errors: string[];
} {
  const errors: string[] = [];
  let sanitized = sanitizeText(question).trim();
  
  if (!sanitized) {
    errors.push('Poll question is required');
  } else if (sanitized.length < 5) {
    errors.push('Poll question must be at least 5 characters long');
  } else if (sanitized.length > 500) {
    errors.push('Poll question must be less than 500 characters');
  }
  
  return { sanitized, errors };
}

/**
 * Validates and sanitizes poll options
 * @param options - Array of poll options to validate
 * @returns Object with sanitized options and validation errors
 */
export function validatePollOptions(options: string[]): {
  sanitized: string[];
  errors: string[];
} {
  const errors: string[] = [];
  const sanitized: string[] = [];
  
  if (!options || options.length < 2) {
    errors.push('At least 2 options are required');
    return { sanitized: [], errors };
  }
  
  if (options.length > 10) {
    errors.push('Maximum 10 options allowed');
    return { sanitized: [], errors };
  }
  
  for (let i = 0; i < options.length; i++) {
    const option = sanitizeText(options[i]).trim();
    
    if (!option) {
      errors.push(`Option ${i + 1} cannot be empty`);
    } else if (option.length > 200) {
      errors.push(`Option ${i + 1} must be less than 200 characters`);
    } else {
      sanitized.push(option);
    }
  }
  
  // Check for duplicate options
  const uniqueOptions = new Set(sanitized);
  if (uniqueOptions.size !== sanitized.length) {
    errors.push('Duplicate options are not allowed');
  }
  
  return { sanitized, errors };
}

/**
 * Validates email input
 * @param email - Email to validate
 * @returns Object with sanitized email and validation errors
 */
export function validateEmail(email: string): {
  sanitized: string;
  errors: string[];
} {
  const errors: string[] = [];
  const sanitized = email.trim().toLowerCase();
  
  if (!sanitized) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
    errors.push('Please enter a valid email address');
  } else if (sanitized.length > 254) {
    errors.push('Email address is too long');
  }
  
  return { sanitized, errors };
}

/**
 * Validates password input
 * @param password - Password to validate
 * @returns Object with validation errors
 */
export function validatePassword(password: string): {
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (password.length > 128) {
    errors.push('Password is too long');
  } else if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return { errors };
}

/**
 * Validates name input
 * @param name - Name to validate
 * @returns Object with sanitized name and validation errors
 */
export function validateName(name: string): {
  sanitized: string;
  errors: string[];
} {
  const errors: string[] = [];
  const sanitized = sanitizeText(name).trim();
  
  if (!sanitized) {
    errors.push('Name is required');
  } else if (sanitized.length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (sanitized.length > 100) {
    errors.push('Name must be less than 100 characters');
  } else if (!/^[a-zA-Z\s'-]+$/.test(sanitized)) {
    errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
  }
  
  return { sanitized, errors };
}
