import { ApiError } from '../services/api';
import { convertToCommonError } from './errorHelpers';

describe('convertToCommonError', () => {
  it('should return error data when ApiError has errorData', () => {
    const errorData = {
      criticality: 'critical' as const,
      id: 'test-123',
      detail: 'API error occurred',
    };
    const apiError = new ApiError('API Error', 500, errorData);

    const result = convertToCommonError(apiError, 'Fallback message');

    expect(result).toEqual(errorData);
  });

  it('should return fallback CommonErrorType when ApiError has no errorData', () => {
    const apiError = new ApiError('API Error', 500);

    const result = convertToCommonError(apiError, 'Fallback message');

    expect(result).toEqual({
      criticality: 'critical',
      id: '',
      detail: 'Fallback message',
    });
  });

  it('should return fallback CommonErrorType for generic errors', () => {
    const genericError = new Error('Network error');

    const result = convertToCommonError(genericError, 'Network failed');

    expect(result).toEqual({
      criticality: 'critical',
      id: '',
      detail: 'Network failed',
    });
  });
});
