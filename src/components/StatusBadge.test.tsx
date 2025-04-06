import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusBadge } from './StatusBadge';
import { orderStatusValues } from '../test/test-utils';

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
  it.each(orderStatusValues)('should render with %s status', (statusValue) => {
    // Arrange & Act
    render(<StatusBadge status={statusValue} />);

    // Assert
    const badge = screen.getByText(statusValue);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('status-badge');
    expect(badge).toHaveClass(`status-${statusValue.toLowerCase()}`);
  });

  /**
   * Test that status value is correctly processed for CSS class
   */
  it('should convert status to lowercase for CSS class', () => {
    // Arrange - using uppercase status
    const uppercaseStatus = 'SHIPPED' as 'Shipped';
    const lowercaseClass = 'status-shipped';

    // Act
    render(<StatusBadge status={uppercaseStatus} />);

    // Assert
    const badge = screen.getByText(uppercaseStatus);
    expect(badge).toHaveClass(lowercaseClass);
    expect(badge).not.toHaveClass(`status-${uppercaseStatus}`);
  });

  /**
   * Test that badge preserves the provided status text case
   */
  it('should display the status text exactly as provided', () => {
    // Arrange
    const mixedCaseStatus = 'sHiPpEd' as 'Shipped';

    // Act
    render(<StatusBadge status={mixedCaseStatus} />);

    // Assert
    expect(screen.getByText(mixedCaseStatus)).toBeInTheDocument();
  });

  /**
   * Test for semantic meaning and correct element type
   */
  it('should render as a span element with status indicator role', () => {
    // Arrange
    const testStatus = 'Processing';

    // Act
    render(<StatusBadge status={testStatus} />);

    // Assert
    const badge = screen.getByText(testStatus);
    expect(badge.tagName).toBe('SPAN');
  });
});
