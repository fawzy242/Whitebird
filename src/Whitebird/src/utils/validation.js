/**
 * Validation Utilities
 * Input validation and sanitization
 */

export class Validation {
  /**
   * Validate email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static isStrongPassword(password, minLength = 8) {
    if (password.length < minLength) return false;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  /**
   * Validate phone number
   */
  static isValidPhone(phone) {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate URL
   */
  static isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize input
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '');
  }

  /**
   * Validate required field
   */
  static isRequired(value) {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  }

  /**
   * Validate min length
   */
  static minLength(value, min) {
    return value.length >= min;
  }

  /**
   * Validate max length
   */
  static maxLength(value, max) {
    return value.length <= max;
  }

  /**
   * Validate number range
   */
  static inRange(value, min, max) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  }

  /**
   * Validate file size
   */
  static isValidFileSize(file, maxSizeInMB = 10) {
    const maxSize = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSize;
  }

  /**
   * Validate file type
   */
  static isValidFileType(file, allowedTypes = []) {
    if (allowedTypes.length === 0) return true;
    return allowedTypes.some(type => file.type.includes(type));
  }

  /**
   * Validate credit card number (Luhn algorithm)
   */
  static isValidCreditCard(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Validate date
   */
  static isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Custom validation with regex
   */
  static matchesPattern(value, pattern) {
    return pattern.test(value);
  }
}

export default Validation;
