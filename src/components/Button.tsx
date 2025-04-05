import React, { ButtonHTMLAttributes } from 'react';
import './Button.css';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

/**
 * Reusable button component with different variants and loading state
 */
export function Button({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  isLoading = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} ${isLoading ? 'loading' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="loading-dots"></span>
          <span className="sr-only">Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
} 