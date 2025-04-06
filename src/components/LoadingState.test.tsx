import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoadingState } from './LoadingState';

/**
 * Tests for the LoadingState component
 * 
 * These tests verify that the LoadingState component:
 * - Renders with default loading message
 * - Accepts and displays custom loading messages
 * - Has appropriate styling and structure
 */
describe('LoadingState Component', () => {
  /**
   * Test that component renders with default loading message
   */
  it('should render with default loading message', () => {
    // Arrange
    
    // Act
    render(<LoadingState />);
    
    // Assert
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    const container = screen.getByText('Loading...').closest('.loading-container');
    expect(container).toBeInTheDocument();
    expect(container).toContainElement(screen.getByText('Loading...'));
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
   * Test that component renders the spinner
   */
  it('should render a loading spinner', () => {
    // Arrange
    
    // Act
    render(<LoadingState />);
    
    // Assert
    // Look for the spinner within the container
    const container = screen.getByText('Loading...').closest('.loading-container');
    const spinner = container?.querySelector('.loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  /**
   * Test that component has correct structure with message and spinner
   */
  it('should have correct structure with container, spinner, and message', () => {
    // Arrange
    
    // Act
    render(<LoadingState />);
    
    // Assert
    const container = screen.getByText('Loading...').closest('.loading-container');
    expect(container).toBeInTheDocument();
    
    // Check that the container has both elements
    const spinner = container?.querySelector('.loading-spinner');
    const message = container?.querySelector('.loading-message');
    
    expect(spinner).toBeInTheDocument();
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent('Loading...');
  });

  /**
   * Test that component handles empty message
   */
  it('should handle empty message gracefully', () => {
    // Arrange
    
    // Act
    render(<LoadingState message="" />);
    
    // Assert
    // Find the container by looking for the empty message element
    const container = screen.getByTestId('loading-container') || document.querySelector('.loading-container');
    const message = container?.querySelector('.loading-message');
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent(''); // Empty but exists
  });

  /**
   * Test that message is displayed within a paragraph element
   */
  it('should display message within a paragraph element', () => {
    // Arrange
    
    // Act
    render(<LoadingState />);
    
    // Assert
    const message = screen.getByText('Loading...');
    expect(message.tagName).toBe('P');
    expect(message).toHaveClass('loading-message');
  });
}); 