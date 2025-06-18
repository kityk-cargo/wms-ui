import { ApiError } from '../services/api';
import { CommonErrorType } from '../types/errors';

/**
 * Converts an error (ApiError or generic Error) to CommonErrorType format
 * @param err - The error to convert
 * @param fallbackMessage - The fallback message to use for non-API errors
 * @returns CommonErrorType object
 */
export function convertToCommonError(
  err: unknown,
  fallbackMessage: string,
): CommonErrorType {
  if (err instanceof ApiError && err.errorData) {
    return err.errorData;
  }

  return {
    criticality: 'critical' as const,
    id: '', // Client errors don't have server-generated IDs
    detail: fallbackMessage,
  };
}
