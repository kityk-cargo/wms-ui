import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorMessage } from './ErrorMessage';

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
});
