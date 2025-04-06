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
   * Test that component renders with the provided error message
   */
  it('should render with the provided error message', () => {
    // Arrange
    const errorMessage = 'Something went wrong!';
    
    // Act
    render(<ErrorMessage message={errorMessage} />);
    
    // Assert
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  /**
   * Test that component contains an error icon
   */
  it('should display an error icon', () => {
    // Arrange
    
    // Act
    render(<ErrorMessage message="Error" />);
    
    // Assert
    const container = screen.getByText('Error').closest('.error-container');
    const errorIcon = container?.querySelector('.error-icon');
    expect(errorIcon).toBeInTheDocument();
    expect(errorIcon).toHaveTextContent('!'); // The icon is an exclamation mark
  });

  /**
   * Test that component has correct structure
   */
  it('should have correct structure with container, icon, and message', () => {
    // Arrange
    const testMessage = 'Test error message';
    
    // Act
    render(<ErrorMessage message={testMessage} />);
    
    // Assert
    const container = screen.getByText(testMessage).closest('.error-container');
    expect(container).toBeInTheDocument();
    
    // Check that the container has both elements
    const icon = container?.querySelector('.error-icon');
    const message = container?.querySelector('.error-message');
    
    expect(icon).toBeInTheDocument();
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent(testMessage);
  });

  /**
   * Test that message is displayed within a paragraph element
   */
  it('should display message within a paragraph element', () => {
    // Arrange
    const testMessage = 'Test paragraph error';
    
    // Act
    render(<ErrorMessage message={testMessage} />);
    
    // Assert
    const message = screen.getByText(testMessage);
    expect(message.tagName).toBe('P');
    expect(message).toHaveClass('error-message');
  });

  /**
   * Test that component handles long error messages
   */
  it('should handle long error messages', () => {
    // Arrange
    const longErrorMessage = 'This is a very long error message that might potentially overflow the container or wrap to multiple lines depending on the styling. It should still be displayed correctly and maintain readability for the user.';
    
    // Act
    render(<ErrorMessage message={longErrorMessage} />);
    
    // Assert
    expect(screen.getByText(longErrorMessage)).toBeInTheDocument();
  });

  /**
   * Test that component applies correct CSS classes
   */
  it('should apply correct CSS classes', () => {
    // Arrange
    
    // Act
    render(<ErrorMessage message="CSS test" />);
    
    // Assert
    const container = screen.getByText('CSS test').closest('.error-container');
    expect(container).toHaveClass('error-container');
    
    const icon = container?.querySelector('.error-icon');
    expect(icon).toHaveClass('error-icon');
    
    const message = screen.getByText('CSS test');
    expect(message).toHaveClass('error-message');
  });
}); 