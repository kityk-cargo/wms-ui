import React from 'react';
import './LoadingState.css';

interface LoadingStateProps {
  message?: string;
}

/**
 * Reusable loading indicator component
 */
export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
}
