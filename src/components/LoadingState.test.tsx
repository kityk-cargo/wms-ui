import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoadingState } from './LoadingState';

/**
 * Tests for the LoadingState component
 *
 * These tests verify that the LoadingState component:
 * - Renders with default or custom loading message
 * - Contains appropriate elements (spinner and message)
 * - Applies correct styling
 */
describe('LoadingState Component', () => {
  /**
   * Test that component renders with default loading message
   */
  it('should render with default loading message', () => {
    // Arrange & Act
    render(<LoadingState />);

    // Assert
    const container = screen.getByTestId('loading-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('loading-container');

    const message = screen.getByText('Loading...');
    expect(message).toBeInTheDocument();
    expect(message).toHaveClass('loading-message');
    expect(message.tagName).toBe('P');
  });

  /**
   * Test that component renders with custom message
   */
  it('should render with custom loading message', () => {
    // Arrange
    const customMessage = 'Fetching data...';

    // Act
    render(<LoadingState message={customMessage} />);

    // Assert
    expect(screen.getByText(customMessage)).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument(); // Default message should not appear
  });

  /**
   * Test that component has the correct structure with spinner and message
   */
  it('should have correct structure with spinner and message elements', () => {
    // Arrange & Act
    render(<LoadingState />);

    // Assert
    const container = screen.getByTestId('loading-container');

    // Check for both spinner and message elements
    const spinner = container.querySelector('.loading-spinner');
    const message = container.querySelector('.loading-message');

    expect(spinner).toBeInTheDocument();
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent('Loading...');
  });

  /**
   * Test that component handles empty message
   */
  it('should handle empty message by rendering an empty paragraph', () => {
    // Arrange & Act
    render(<LoadingState message="" />);

    // Assert
    const container = screen.getByTestId('loading-container');
    const message = container.querySelector('.loading-message');

    expect(message).toBeInTheDocument();
    expect(message?.textContent).toBe('');
  });
});
