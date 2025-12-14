/**
 * Custom Error Classes
 * Production-ready error handling for the app
 */

/**
 * Base application error
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = 'APP_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authentication errors
 */
export class AuthError extends AppError {
  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message, code, 401);
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(message: string = 'Invalid email or password') {
    super(message, 'INVALID_CREDENTIALS');
  }
}

export class UserAlreadyExistsError extends AuthError {
  constructor(message: string = 'A user with this email already exists. Please sign in instead.') {
    super(message, 'USER_ALREADY_EXISTS');
  }
}

export class UserNotFoundError extends AuthError {
  constructor(message: string = 'User not found') {
    super(message, 'USER_NOT_FOUND');
  }
}

export class SessionExpiredError extends AuthError {
  constructor(message: string = 'Session has expired. Please sign in again.') {
    super(message, 'SESSION_EXPIRED');
  }
}

export class EmailNotVerifiedError extends AuthError {
  constructor(message: string = 'Please verify your email before continuing') {
    super(message, 'EMAIL_NOT_VERIFIED');
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message, 'VALIDATION_ERROR', 400);
    this.errors = errors;
  }
}

/**
 * Database errors
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 'DATABASE_ERROR', 500);
  }
}

export class RecordNotFoundError extends AppError {
  constructor(message: string = 'Record not found') {
    super(message, 'RECORD_NOT_FOUND', 404);
  }
}

export class DuplicateRecordError extends AppError {
  constructor(message: string = 'Record already exists') {
    super(message, 'DUPLICATE_RECORD', 409);
  }
}

/**
 * Storage errors
 */
export class StorageError extends AppError {
  constructor(message: string = 'Storage operation failed') {
    super(message, 'STORAGE_ERROR', 500);
  }
}

export class FileUploadError extends StorageError {
  constructor(message: string = 'Failed to upload file') {
    super(message);
    this.code = 'FILE_UPLOAD_ERROR';
  }
}

export class FileTooLargeError extends StorageError {
  constructor(maxSizeMB: number = 5) {
    super(`File size exceeds maximum allowed size of ${maxSizeMB}MB`);
    this.code = 'FILE_TOO_LARGE';
  }
}

export class InvalidFileTypeError extends StorageError {
  constructor(allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']) {
    super(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    this.code = 'INVALID_FILE_TYPE';
  }
}

/**
 * Network errors
 */
export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed') {
    super(message, 'NETWORK_ERROR', 503);
  }
}

/**
 * Parse Supabase errors into custom errors
 */
export function parseSupabaseError(error: any): AppError {
  const message = error?.message || 'An unexpected error occurred';
  const code = error?.code || '';

  // Network errors - check first
  if (
    message.includes('Network request failed') ||
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('Failed to fetch') ||
    code === 'ECONNREFUSED' ||
    code === 'ETIMEDOUT' ||
    code === 'ENOTFOUND'
  ) {
    return new NetworkError('Network request failed. Please check your internet connection.');
  }

  // Auth errors
  if (
    message.includes('User already registered') ||
    message.includes('already exists') ||
    message.includes('already registered') ||
    code === 'user_already_exists' ||
    code === '23505' // PostgreSQL unique constraint violation
  ) {
    return new UserAlreadyExistsError();
  }
  if (message.includes('Invalid login credentials') || code === 'invalid_credentials') {
    return new InvalidCredentialsError();
  }
  if (message.includes('Email not confirmed')) {
    return new EmailNotVerifiedError();
  }
  if (message.includes('JWT') || message.includes('token') || code === 'session_expired') {
    return new SessionExpiredError();
  }
  if (message.includes('User not found')) {
    return new UserNotFoundError();
  }

  // Database errors
  if (code === '23505' || message.includes('duplicate key')) {
    return new DuplicateRecordError();
  }
  if (code === 'PGRST116' || message.includes('not found')) {
    return new RecordNotFoundError();
  }

  // Default to generic app error
  return new AppError(message, code || 'UNKNOWN_ERROR');
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (isAppError(error)) {
    // Network errors get a friendly message
    if (error instanceof NetworkError) {
      return 'Network request failed. Please check your internet connection and try again.';
    }
    return error.message;
  }
  if (error instanceof Error) {
    // Check for network errors in generic Error objects
    if (
      error.message.includes('Network request failed') ||
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('Failed to fetch')
    ) {
      return 'Network request failed. Please check your internet connection and try again.';
    }
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}

