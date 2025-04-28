import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorMessage } from './ErrorMessage';
import { CommonErrorType } from '../types/errors';

/**
 * Tests for the ErrorMessage component
 *
 * These tests verify that the ErrorMessage component:
 * - Renders with the provided error message
 * - Has appropriate styling and structure
 * - Contains an error icon
 */
describe('ErrorMessage Component', () => {
  /**
   * Set up test cases with different error messages
   */
  const testCases = [
    { name: 'basic error', message: 'Something went wrong!' },
    { name: 'empty message', message: '' },
    {
      name: 'long message',
      message:
        'This is a very long error message that might potentially overflow the container or wrap to multiple lines depending on the styling. It should still be displayed correctly and maintain readability for the user.',
    },
  ];

  /**
   * Test that component renders with the provided error message
   */
  it.each(testCases)('should render with $name', ({ message }) => {
    // Arrange & Act
    render(<ErrorMessage message={message} />);

    // Assert
    const container = screen.getByTestId('error-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('error-container');

    if (message) {
      expect(screen.getByText(message)).toBeInTheDocument();
    }
  });

  /**
   * Test that component contains an error icon
   */
  it('should display an error icon', () => {
    // Arrange & Act
    render(<ErrorMessage message="Error" />);

    // Assert
    const container = screen.getByTestId('error-container');
    const errorIcon = container.querySelector('.error-icon');

    expect(errorIcon).toBeInTheDocument();
    expect(errorIcon).toHaveTextContent('!'); // The icon is an exclamation mark
    expect(errorIcon).toHaveClass('error-icon');
  });

  /**
   * Test that component has correct structure with icon and message
   */
  it('should have correct structure with icon and message elements', () => {
    // Arrange
    const testMessage = 'Test error message';

    // Act
    render(<ErrorMessage message={testMessage} />);

    // Assert
    const container = screen.getByTestId('error-container');

    // Check for both icon and message elements
    const icon = container.querySelector('.error-icon');
    const message = container.querySelector('.error-message');

    expect(icon).toBeInTheDocument();
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent(testMessage);
    expect(message?.tagName).toBe('P');
  });

  it('renders the error message correctly with string input', () => {
    // Arrange
    const errorMessage = 'Something went wrong';

    // Act
    render(<ErrorMessage message={errorMessage} />);

    // Assert
    expect(screen.getByTestId('error-container')).toBeInTheDocument();
    expect(screen.getByText('!')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders the error message correctly with CommonErrorType input', () => {
    // Arrange
    const errorData: CommonErrorType = {
      criticality: 'critical',
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Order Processing Failed',
      detail: 'Unable to process your order due to invalid payment details',
      recoverySuggestion:
        'Please update your payment information and try again',
    };

    // Act
    render(<ErrorMessage message={errorData} />);

    // Assert
    expect(screen.getByTestId('error-container')).toBeInTheDocument();
    expect(screen.getByText('!')).toBeInTheDocument();
    expect(screen.getByText(errorData.title!)).toBeInTheDocument();
    expect(screen.getByText(errorData.detail)).toBeInTheDocument();
    expect(screen.getByText(errorData.recoverySuggestion!)).toBeInTheDocument();
  });

  it('renders the error message without title or recovery suggestion when not provided', () => {
    // Arrange
    const errorData: CommonErrorType = {
      criticality: 'non-critical',
      id: '123e4567-e89b-12d3-a456-426614174000',
      detail: 'Product information is temporarily unavailable',
    };

    // Act
    render(<ErrorMessage message={errorData} />);

    // Assert
    expect(screen.getByTestId('error-container')).toBeInTheDocument();
    expect(screen.getByText('!')).toBeInTheDocument();
    expect(screen.getByText(errorData.detail)).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument(); // No title heading
    expect(screen.queryByText(/please try/i)).not.toBeInTheDocument(); // No recovery suggestion
  });
});
