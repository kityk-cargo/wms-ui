import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusBadge } from './StatusBadge';

/**
 * Tests for the StatusBadge component
 * 
 * These tests verify that the StatusBadge component correctly:
 * - Renders with different status types
 * - Applies the appropriate CSS classes based on status
 * - Displays the status text
 */
describe('StatusBadge Component', () => {
  /**
   * Test that badge renders with all the different statuses
   */
  it.each([
    'Pending',
    'Allocated',
    'Processing', 
    'Shipped',
    'Delivered',
    'Cancelled'
  ])('should render with %s status', (status) => {
    // Arrange & Act
    render(<StatusBadge status={status} />);
    
    // Assert
    const badge = screen.getByText(status);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('status-badge');
    expect(badge).toHaveClass(`status-${status.toLowerCase()}`);
  });

  /**
   * Test that all possible status values are rendered with correct case-insensitive class
   */
  it('should convert status to lowercase for CSS class', () => {
    // Arrange - component should automatically lowercase the status for the class
    
    // Act - for this test we'll use a non-standard casing
    render(<StatusBadge status="SHIPPED" />);
    
    // Assert
    const badge = screen.getByText('SHIPPED');
    expect(badge).toHaveClass('status-shipped'); // Class should be lowercase
    expect(badge).not.toHaveClass('status-SHIPPED'); // Not with uppercase
  });

  /**
   * Test that badge preserves the provided status text case
   */
  it('should display the status text exactly as provided', () => {
    // Arrange
    
    // Act - test with mixed case
    render(<StatusBadge status="ShIpPeD" />);
    
    // Assert
    // Text content should match the original, not be normalized
    expect(screen.getByText('ShIpPeD')).toBeInTheDocument();
  });

  /**
   * Test that badge has appropriate accessibility semantics
   */
  it('should have semantic meaning as a status indicator', () => {
    // Arrange
    
    // Act
    render(<StatusBadge status="Processing" />);
    
    // Assert
    const badge = screen.getByText('Processing');
    // Verify it's a span element as expected
    expect(badge.tagName).toBe('SPAN');
  });
}); 