import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from './Button';
import { buttonVariants } from '../test/test-utils';

/**
 * Tests for the Button component
 *
 * These tests verify that the Button component:
 * - Renders with different variants
 * - Handles click events correctly
 * - Shows loading state appropriately
 * - Supports being disabled
 */
describe('Button Component', () => {
  /**
   * Test that button renders with text content
   */
  it('should render with provided text content', () => {
    // Arrange
    const buttonText = 'Click Me';

    // Act
    render(<Button>{buttonText}</Button>);

    // Assert
    const button = screen.getByRole('button', { name: buttonText });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(buttonText);
  });

  /**
   * Test that button has default variant if none provided
   */
  it('should have default variant if none provided', () => {
    // Arrange & Act
    render(<Button>Default Button</Button>);

    // Assert
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn');
    expect(button).toHaveClass('btn-primary'); // Primary is default
  });

  /**
   * Test all button variants with parameterized test
   */
  it.each(buttonVariants)(
    'should apply btn-%s class for %s variant',
    (variant) => {
      // Arrange & Act
      render(<Button variant={variant}>Button</Button>);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass(`btn-${variant}`);
    },
  );

  /**
   * Test that button handles click events
   */
  it('should trigger onClick handler when clicked', () => {
    // Arrange
    const handleClick = vi.fn();

    // Act
    render(<Button onClick={handleClick}>Clickable Button</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  /**
   * Test that button shows loading state
   */
  it('should show loading state when isLoading is true', () => {
    // Arrange & Act
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
    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>,
    );

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
    // Arrange & Act
    render(
      <Button disabled isLoading>
        Disabled Loading Button
      </Button>,
    );

    // Assert
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('loading');
  });
});
