import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
}

/**
 * Reusable error message component
 */
export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="error-container" data-testid="error-container">
      <div className="error-icon">!</div>
      <p className="error-message">{message}</p>
    </div>
  );
}
