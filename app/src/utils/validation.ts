// Email validation regex
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

// Password requirements:
// - At least 8 characters
// - Contains at least one uppercase letter
// - Contains at least one lowercase letter
// - Contains at least one number
// - Contains at least one special character
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Phone number validation (supports multiple formats)
const PHONE_REGEX = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

// Validation functions
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email is required';
  }
  if (!EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  if (!PASSWORD_REGEX.test(password)) {
    return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';
  }
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

export const validateName = (name: string, fieldName: string = 'Name'): string | null => {
  if (!name) {
    return `${fieldName} is required`;
  }
  if (name.length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }
  if (name.length > 50) {
    return `${fieldName} must be less than 50 characters long`;
  }
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) {
    return 'Phone number is required';
  }
  if (!PHONE_REGEX.test(phone)) {
    return 'Please enter a valid phone number';
  }
  return null;
};

export const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateDate = (date: string): string | null => {
  if (!date) {
    return 'Date is required';
  }
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Please enter a valid date';
  }
  return null;
};

export const validateTime = (time: string): string | null => {
  if (!time) {
    return 'Time is required';
  }
  // HH:mm format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return 'Please enter a valid time in HH:mm format';
  }
  return null;
};

export const validateAmount = (amount: number | string): string | null => {
  if (amount === undefined || amount === null || amount === '') {
    return 'Amount is required';
  }
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) {
    return 'Please enter a valid amount';
  }
  if (numAmount < 0) {
    return 'Amount cannot be negative';
  }
  return null;
};

// Form validation helper
export const validateForm = (values: Record<string, any>, validations: Record<string, (value: any) => string | null>): Record<string, string | null> => {
  const errors: Record<string, string | null> = {};
  
  Object.keys(validations).forEach((key) => {
    const value = values[key];
    const validation = validations[key];
    const error = validation(value);
    if (error) {
      errors[key] = error;
    }
  });

  return errors;
}; 