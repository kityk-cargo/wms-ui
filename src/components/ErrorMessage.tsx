import './ErrorMessage.css';
import { CommonErrorType } from '../types/errors';

interface ErrorMessageProps {
  message: string | CommonErrorType;
}

/**
 * Reusable error message component that supports both string messages and CommonErrorType
 */
export function ErrorMessage({ message }: ErrorMessageProps) {
  // Parse the message if it's a CommonErrorType
  let displayTitle = '';
  let displayMessage = '';
  let recoverySuggestion = '';
  let errorId = '';

  if (typeof message === 'string') {
    displayMessage = message;
  } else {
    // It's a CommonErrorType - only detail is required
    displayMessage = message.detail;

    // Handle optional fields only if they exist
    displayTitle = message.title || '';
    recoverySuggestion = message.recoverySuggestion || '';
    errorId = message.id || '';
  }

  return (
    <div className="error-container" data-testid="error-container">
      <div className="error-icon">!</div>
      {displayTitle && <h4 className="error-title">{displayTitle}</h4>}
      <p className="error-message">{displayMessage}</p>
      {errorId && <p className="error-id">Error ID: {errorId}</p>}
      {recoverySuggestion && (
        <p className="error-recovery">{recoverySuggestion}</p>
      )}
    </div>
  );
}
