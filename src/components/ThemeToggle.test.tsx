import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeToggle } from './ThemeToggle';
import { StoreProvider } from '../stores/StoreContext';
import { rootStore } from '../stores/RootStore';

/**
 * Tests for the ThemeToggle component
 * 
 * These tests verify that the theme toggle functionality works as expected
 * focusing on user interactions and theme switching behavior
 */
describe('ThemeToggle Component', () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
    removeItem: vi.fn(),
    key: vi.fn(),
    length: 0,
  };

  // Mock matchMedia
  const matchMediaMock = vi.fn();

  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
    
    // Setup matchMedia mock
    Object.defineProperty(window, 'matchMedia', {
      value: matchMediaMock.mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    // Reset mocks between tests
    vi.clearAllMocks();
    
    // Reset theme store state
    rootStore.themeStore.theme = 'system';
    rootStore.themeStore.isExpanded = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test that ensures the component renders in its initial collapsed state
   */
  it('should render the theme toggle button in collapsed state', () => {
    // Arrange
    render(
      <StoreProvider>
        <ThemeToggle />
      </StoreProvider>
    );
    
    // Act - no action needed, testing initial render
    
    // Assert
    expect(screen.getByLabelText('Open theme settings')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
    
    // Should not show theme options in collapsed state
    expect(screen.queryByText('Light')).not.toBeInTheDocument();
    expect(screen.queryByText('Dark')).not.toBeInTheDocument();
    expect(screen.queryByText('System')).not.toBeInTheDocument();
  });

  /**
   * Test that verifies clicking the toggle button expands the theme options
   */
  it('should expand theme options when toggle button is clicked', () => {
    // Arrange
    render(
      <StoreProvider>
        <ThemeToggle />
      </StoreProvider>
    );
    
    // Act
    fireEvent.click(screen.getByLabelText('Open theme settings'));
    
    // Assert
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByLabelText('Close theme settings')).toBeInTheDocument();
  });

  /**
   * Test that ensures selecting the light theme works correctly
   */
  it('should set theme to light when light option is selected', () => {
    // Arrange
    render(
      <StoreProvider>
        <ThemeToggle />
      </StoreProvider>
    );
    
    // Act
    fireEvent.click(screen.getByLabelText('Open theme settings'));
    fireEvent.click(screen.getByLabelText('Switch to light mode'));
    
    // Assert
    expect(rootStore.themeStore.theme).toBe('light');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    
    // Should collapse after selection
    expect(rootStore.themeStore.isExpanded).toBe(false);
    expect(screen.queryByText('Light')).not.toBeInTheDocument();
  });

  /**
   * Test that ensures selecting the dark theme works correctly
   */
  it('should set theme to dark when dark option is selected', () => {
    // Arrange
    render(
      <StoreProvider>
        <ThemeToggle />
      </StoreProvider>
    );
    
    // Act
    fireEvent.click(screen.getByLabelText('Open theme settings'));
    fireEvent.click(screen.getByLabelText('Switch to dark mode'));
    
    // Assert
    expect(rootStore.themeStore.theme).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    
    // Should collapse after selection
    expect(rootStore.themeStore.isExpanded).toBe(false);
  });

  /**
   * Test that ensures selecting the system theme works correctly
   */
  it('should set theme to system when system option is selected', () => {
    // Arrange
    render(
      <StoreProvider>
        <ThemeToggle />
      </StoreProvider>
    );
    
    // Act
    fireEvent.click(screen.getByLabelText('Open theme settings'));
    fireEvent.click(screen.getByLabelText('Use system theme preference'));
    
    // Assert
    expect(rootStore.themeStore.theme).toBe('system');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'system');
    
    // Should collapse after selection
    expect(rootStore.themeStore.isExpanded).toBe(false);
  });

  /**
   * Test that ensures the close button in expanded view works correctly
   */
  it('should collapse the theme options when close button is clicked', () => {
    // Arrange
    render(
      <StoreProvider>
        <ThemeToggle />
      </StoreProvider>
    );
    
    // Act
    fireEvent.click(screen.getByLabelText('Open theme settings'));
    fireEvent.click(screen.getByLabelText('Close theme settings'));
    
    // Assert
    expect(rootStore.themeStore.isExpanded).toBe(false);
    expect(screen.queryByText('Light')).not.toBeInTheDocument();
    expect(screen.queryByText('Dark')).not.toBeInTheDocument();
    expect(screen.queryByText('System')).not.toBeInTheDocument();
    
    // Toggle button should be visible again
    expect(screen.getByLabelText('Open theme settings')).toBeInTheDocument();
  });

  /**
   * Test that verifies the active state is applied correctly to the selected theme
   */
  it('should mark the current theme as active in the expanded view', () => {
    // Arrange
    rootStore.themeStore.theme = 'dark';
    
    render(
      <StoreProvider>
        <ThemeToggle />
      </StoreProvider>
    );
    
    // Act
    fireEvent.click(screen.getByLabelText('Open theme settings'));
    
    // Assert - check for active class on dark mode button
    const darkButton = screen.getByLabelText('Switch to dark mode');
    expect(darkButton.classList.contains('active')).toBe(true);
    
    // Light and system buttons should not have active class
    const lightButton = screen.getByLabelText('Switch to light mode');
    const systemButton = screen.getByLabelText('Use system theme preference');
    
    expect(lightButton.classList.contains('active')).toBe(false);
    expect(systemButton.classList.contains('active')).toBe(false);
  });
}); 