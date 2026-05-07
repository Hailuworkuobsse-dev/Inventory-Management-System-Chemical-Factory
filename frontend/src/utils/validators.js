/**
 * Form validation utilities using Yup/Zod-style schemas
 * Reusable validation functions for forms across the application
 */

/**
 * Validate email format
 * @param {string} email 
 * @returns {Object} { valid, message }
 */
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate password strength
 * @param {string} password 
 * @returns {Object} { valid, message, strength }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Password is required', strength: 0 };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters', strength: 1 };
  }
  
  let strength = 0;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (hasLower) strength++;
  if (hasUpper) strength++;
  if (hasNumber) strength++;
  if (hasSpecial) strength++;
  
  if (strength < 3) {
    return { 
      valid: false, 
      message: 'Password must include uppercase, lowercase, number, and special character',
      strength 
    };
  }
  
  return { valid: true, message: '', strength };
};

/**
 * Validate phone number (Ethiopian format)
 * @param {string} phone 
 * @returns {Object} { valid, message }
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { valid: false, message: 'Phone number is required' };
  }
  
  // Ethiopian phone formats: +251 XXX XXX XXX or 0XX XXX XXXX
  const phoneRegex = /^(\+251|0)[1-9]\d{8}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return { valid: false, message: 'Invalid phone number format' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate required field
 * @param {any} value 
 * @param {string} fieldName 
 * @returns {Object} { valid, message }
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return { valid: false, message: `At least one ${fieldName.toLowerCase()} is required` };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate number range
 * @param {number} value 
 * @param {Object} options - { min, max, fieldName }
 * @returns {Object} { valid, message }
 */
export const validateNumberRange = (value, options = {}) => {
  const { min, max, fieldName = 'Value' } = options;
  
  if (value === null || value === undefined || value === '') {
    return { valid: true, message: '' }; // Allow empty, use validateRequired for required fields
  }
  
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return { valid: false, message: `${fieldName} must be a number` };
  }
  
  if (min !== undefined && numValue < min) {
    return { valid: false, message: `${fieldName} must be at least ${min}` };
  }
  
  if (max !== undefined && numValue > max) {
    return { valid: false, message: `${fieldName} must be at most ${max}` };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate batch number format
 * @param {string} batchNumber 
 * @returns {Object} { valid, message }
 */
export const validateBatchNumber = (batchNumber) => {
  if (!batchNumber) {
    return { valid: false, message: 'Batch number is required' };
  }
  
  if (batchNumber.length < 3) {
    return { valid: false, message: 'Batch number must be at least 3 characters' };
  }
  
  // Allow alphanumeric, hyphens, underscores
  const batchRegex = /^[A-Za-z0-9_-]+$/;
  if (!batchRegex.test(batchNumber)) {
    return { valid: false, message: 'Batch number can only contain letters, numbers, hyphens, and underscores' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate expiry date
 * @param {Date|string} expiryDate 
 * @returns {Object} { valid, message }
 */
export const validateExpiryDate = (expiryDate) => {
  if (!expiryDate) {
    return { valid: false, message: 'Expiry date is required' };
  }
  
  const date = new Date(expiryDate);
  if (isNaN(date.getTime())) {
    return { valid: false, message: 'Invalid date format' };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date < today) {
    return { valid: false, message: 'Expiry date cannot be in the past' };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate quantity (positive number)
 * @param {number} quantity 
 * @param {Object} options - { allowZero, fieldName }
 * @returns {Object} { valid, message }
 */
export const validateQuantity = (quantity, options = {}) => {
  const { allowZero = false, fieldName = 'Quantity' } = options;
  
  if (quantity === null || quantity === undefined || quantity === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  const numValue = Number(quantity);
  if (isNaN(numValue)) {
    return { valid: false, message: `${fieldName} must be a number` };
  }
  
  if (numValue < 0 || (!allowZero && numValue <= 0)) {
    return { valid: false, message: `${fieldName} must be ${allowZero ? 'non-negative' : 'positive'}` };
  }
  
  if (!Number.isInteger(numValue)) {
    return { valid: false, message: `${fieldName} must be a whole number` };
  }
  
  return { valid: true, message: '' };
};

/**
 * Validate URL format
 * @param {string} url 
 * @returns {Object} { valid, message }
 */
export const validateUrl = (url) => {
  if (!url) {
    return { valid: true, message: '' }; // Allow empty URLs
  }
  
  try {
    new URL(url);
    return { valid: true, message: '' };
  } catch {
    return { valid: false, message: 'Invalid URL format' };
  }
};

/**
 * Compose multiple validators
 * @param  {...Function} validators 
 * @returns {Function} Combined validator
 */
export const composeValidators = (...validators) => {
  return (value, options) => {
    for (const validator of validators) {
      const result = validator(value, options);
      if (!result.valid) {
        return result;
      }
    }
    return { valid: true, message: '' };
  };
};

/**
 * Create a form validation result object
 * @param {Object} errors - Key-value pairs of field errors
 * @returns {Object} { isValid, errors }
 */
export const createValidationResult = (errors) => {
  const fieldNames = Object.keys(errors);
  const isValid = fieldNames.every((field) => !errors[field]);
  
  return {
    isValid,
    errors,
  };
};

export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateRequired,
  validateNumberRange,
  validateBatchNumber,
  validateExpiryDate,
  validateQuantity,
  validateUrl,
  composeValidators,
  createValidationResult,
};
