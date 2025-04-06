import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from './Button';

/**
 * Tests for the Button component
 * 
 * These tests verify that the Button component works correctly:
 * - Renders with different variants
 * - Handles click events
 * - Shows loading state
 * - Applies appropriate CSS classes
 * - Handles disabled state
 */
describe('Button Component', () => {
  /**
   * Test that button renders with default props
   */
  it('should render with default props', () => {
    // Arrange
    
    // Act
    render(<Button>Click me</Button>);
    
    // Assert
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn');
    expect(button).toHaveClass('btn-primary');
    expect(button).not.toBeDisabled();
  });

  /**
   * Test that button renders with primary variant
   */
  it('should render with primary variant', () => {
    // Arrange
    
    // Act
    render(<Button variant="primary">Primary Button</Button>);
    
    // Assert
    const button = screen.getByRole('button', { name: 'Primary Button' });
    expect(button).toHaveClass('btn-primary');
  });

  /**
   * Test that button renders with secondary variant
   */
  it('should render with secondary variant', () => {
    // Arrange
    
    // Act
    render(<Button variant="secondary">Secondary Button</Button>);
    
    // Assert
    const button = screen.getByRole('button', { name: 'Secondary Button' });
    expect(button).toHaveClass('btn-secondary');
  });

  /**
   * Test that button renders with danger variant
   */
  it('should render with danger variant', () => {
    // Arrange
    
    // Act
    render(<Button variant="danger">Danger Button</Button>);
    
    // Assert
    const button = screen.getByRole('button', { name: 'Danger Button' });
    expect(button).toHaveClass('btn-danger');
  });

  /**
   * Test that button handles click events
   */
  it('should handle click events', () => {
    // Arrange
    const handleClick = vi.fn();
    
    // Act
    render(<Button onClick={handleClick}>Clickable Button</Button>);
    
    const button = screen.getByRole('button', { name: 'Clickable Button' });
    fireEvent.click(button);
    
    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  /**
   * Test that button shows loading state
   */
  it('should show loading state', () => {
    // Arrange
    
    // Act
    render(<Button isLoading>Loading Button</Button>);
    
    // Assert
    // Check for screen reader text that indicates loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Button should have loading class
    const button = screen.getByRole('button');
    expect(button).toHaveClass('loading');
    
    // Button should be disabled when loading
    expect(button).toBeDisabled();
    
    // Button content should not be visible during loading
    expect(screen.queryByText('Loading Button')).not.toBeInTheDocument();
  });

  /**
   * Test that disabled button cannot be clicked
   */
  it('should not trigger click event when disabled', () => {
    // Arrange
    const handleClick = vi.fn();
    
    // Act
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>);
    
    const button = screen.getByRole('button', { name: 'Disabled Button' });
    fireEvent.click(button);
    
    // Assert
    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  /**
   * Test that custom className is applied
   */
  it('should apply additional CSS class when provided', () => {
    // Arrange
    const customClass = 'custom-button-class';
    
    // Act
    render(<Button className={customClass}>Custom Class Button</Button>);
    
    // Assert
    const button = screen.getByRole('button', { name: 'Custom Class Button' });
    expect(button).toHaveClass(customClass);
    expect(button).toHaveClass('btn'); // Still has the base class
  });

  /**
   * Test that button is disabled when both disabled and loading
   */
  it('should be disabled when both disabled prop and loading state are true', () => {
    // Arrange
    
    // Act
    render(<Button disabled isLoading>Disabled Loading Button</Button>);
    
    // Assert
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('loading');
  });

  /**
   * Test that additional props are passed through
   */
  it('should pass additional props to the button element', () => {
    // Arrange
    const dataTestId = 'test-button';
    const ariaLabel = 'Test Button';
    
    // Act
    render(
      <Button 
        data-testid={dataTestId} 
        aria-label={ariaLabel}
      >
        Props Button
      </Button>
    );
    
    // Assert
    const button = screen.getByTestId(dataTestId);
    expect(button).toHaveAttribute('aria-label', ariaLabel);
  });
}); 