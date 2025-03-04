import axios, { AxiosError } from 'axios';

// Custom error class for API errors
export class APIError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number = 500, code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
  }
}

// Error codes mapping
export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// Error messages mapping
export const ErrorMessages = {
  [ErrorCodes.NETWORK_ERROR]: 'Network error occurred. Please check your internet connection.',
  [ErrorCodes.UNAUTHORIZED]: 'You are not authorized to perform this action.',
  [ErrorCodes.FORBIDDEN]: 'You do not have permission to access this resource.',
  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCodes.VALIDATION_ERROR]: 'Invalid data provided.',
  [ErrorCodes.SERVER_ERROR]: 'An internal server error occurred.',
  [ErrorCodes.UNKNOWN_ERROR]: 'An unknown error occurred.',
} as const;

// Function to handle API errors
export const handleAPIError = (error: unknown): APIError => {
  if (error instanceof APIError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    let code: ErrorCode = ErrorCodes.UNKNOWN_ERROR;

    switch (status) {
      case 401:
        code = ErrorCodes.UNAUTHORIZED;
        break;
      case 403:
        code = ErrorCodes.FORBIDDEN;
        break;
      case 404:
        code = ErrorCodes.NOT_FOUND;
        break;
      case 422:
        code = ErrorCodes.VALIDATION_ERROR;
        break;
      case 500:
        code = ErrorCodes.SERVER_ERROR;
        break;
      default:
        if (!navigator.onLine) {
          code = ErrorCodes.NETWORK_ERROR;
        }
    }

    return new APIError(message, status, code);
  }

  if (error instanceof Error) {
    return new APIError(error.message);
  }

  return new APIError('An unknown error occurred');
};

// Function to get user-friendly error message
export const getErrorMessage = (error: unknown): string => {
  const apiError = handleAPIError(error);
  return ErrorMessages[apiError.code as keyof typeof ErrorMessages] || apiError.message;
};

// Function to log errors
export const logError = (error: unknown, context?: Record<string, any>) => {
  const apiError = handleAPIError(error);
  
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      name: apiError.name,
      message: apiError.message,
      status: apiError.status,
      code: apiError.code,
      context,
      stack: apiError.stack,
    });
  }
  
  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implement error tracking service integration
  }
};

// Function to check if error is a specific type
export const isErrorType = (error: unknown, code: keyof typeof ErrorCodes): boolean => {
  const apiError = handleAPIError(error);
  return apiError.code === code;
};

// Function to check if error is a network error
export const isNetworkError = (error: unknown): boolean => {
  return isErrorType(error, 'NETWORK_ERROR');
};

// Function to check if error is an authentication error
export const isAuthError = (error: unknown): boolean => {
  return isErrorType(error, 'UNAUTHORIZED');
};

// Function to check if error is a validation error
export const isValidationError = (error: unknown): boolean => {
  return isErrorType(error, 'VALIDATION_ERROR');
}; 