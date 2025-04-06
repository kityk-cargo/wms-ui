import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ThemeStore } from './ThemeStore';
import { RootStore } from './RootStore';

/**
 * Tests for the ThemeStore
 * 
 * These tests verify the core functionality of the theme management system,
 * including theme switching, persistence, and system theme detection.
 */
describe('ThemeStore', () => {
  // Mock dependencies
  let rootStore: RootStore;
  let themeStore: ThemeStore;
  
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
    removeItem: vi.fn(),
    key: vi.fn(),
    length: 0,
  };
  
  // Mock matchMedia with controllable return value
  const matchMediaMock = vi.fn();
  let prefersDarkMode = false;

  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
    
    // Setup matchMedia mock with configurable dark mode preference
    Object.defineProperty(window, 'matchMedia', {
      value: matchMediaMock.mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)' ? prefersDarkMode : false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    // Setup document mock
    document.documentElement.classList.remove('light-theme', 'dark-theme');
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Create root store and theme store for testing
    rootStore = new RootStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove('light-theme', 'dark-theme');
  });

  /**
   * Test that verifies the initial theme is read from localStorage properly
   */
  it('should initialize theme from localStorage if available', () => {
    // Arrange
    localStorageMock.getItem.mockReturnValueOnce('dark');
    
    // Act
    themeStore = new ThemeStore(rootStore);
    
    // Assert
    expect(localStorageMock.getItem).toHaveBeenCalledWith('theme');
    expect(themeStore.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
  });

  /**
   * Test that verifies the default theme when localStorage has no value
   */
  it('should default to system theme when no localStorage value exists', () => {
    // Arrange
    localStorageMock.getItem.mockReturnValueOnce(null);
    
    // Act
    themeStore = new ThemeStore(rootStore);
    
    // Assert
    expect(themeStore.theme).toBe('system');
  });

  /**
   * Test that verifies invalid localStorage values are handled properly
   */
  it('should default to system theme when localStorage has invalid value', () => {
    // Arrange
    localStorageMock.getItem.mockReturnValueOnce('invalid_theme');
    
    // Act
    themeStore = new ThemeStore(rootStore);
    
    // Assert
    expect(themeStore.theme).toBe('system');
  });

  /**
   * Test the setTheme method with a light theme
   */
  it('should correctly set and apply light theme', () => {
    // Arrange
    themeStore = new ThemeStore(rootStore);
    vi.clearAllMocks(); // Clear initialization calls
    
    // Act
    themeStore.setTheme('light');
    
    // Assert
    expect(themeStore.theme).toBe('light');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    expect(document.documentElement.classList.contains('light-theme')).toBe(true);
    expect(document.documentElement.classList.contains('dark-theme')).toBe(false);
  });

  /**
   * Test the setTheme method with a dark theme
   */
  it('should correctly set and apply dark theme', () => {
    // Arrange
    themeStore = new ThemeStore(rootStore);
    vi.clearAllMocks(); // Clear initialization calls
    
    // Act
    themeStore.setTheme('dark');
    
    // Assert
    expect(themeStore.theme).toBe('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
    expect(document.documentElement.classList.contains('light-theme')).toBe(false);
  });

  /**
   * Test that system theme correctly applies OS preference (light)
   */
  it('should apply light theme when system preference is light', () => {
    // Arrange
    prefersDarkMode = false;
    
    // Act
    themeStore = new ThemeStore(rootStore);
    themeStore.setTheme('system');
    
    // Assert
    expect(themeStore.theme).toBe('system');
    expect(document.documentElement.classList.contains('light-theme')).toBe(true);
    expect(document.documentElement.classList.contains('dark-theme')).toBe(false);
  });

  /**
   * Test that system theme correctly applies OS preference (dark)
   */
  it('should apply dark theme when system preference is dark', () => {
    // Arrange
    prefersDarkMode = true;
    
    // Act
    themeStore = new ThemeStore(rootStore);
    themeStore.setTheme('system');
    
    // Assert
    expect(themeStore.theme).toBe('system');
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
    expect(document.documentElement.classList.contains('light-theme')).toBe(false);
  });

  /**
   * Test the toggleExpanded method
   */
  it('should toggle expanded state', () => {
    // Arrange
    themeStore = new ThemeStore(rootStore);
    expect(themeStore.isExpanded).toBe(false);
    
    // Act - toggle on
    themeStore.toggleExpanded();
    
    // Assert
    expect(themeStore.isExpanded).toBe(true);
    
    // Act - toggle off
    themeStore.toggleExpanded();
    
    // Assert
    expect(themeStore.isExpanded).toBe(false);
  });

  /**
   * Test the setExpanded method
   */
  it('should directly set expanded state', () => {
    // Arrange
    themeStore = new ThemeStore(rootStore);
    expect(themeStore.isExpanded).toBe(false);
    
    // Act
    themeStore.setExpanded(true);
    
    // Assert
    expect(themeStore.isExpanded).toBe(true);
    
    // Act again
    themeStore.setExpanded(false);
    
    // Assert
    expect(themeStore.isExpanded).toBe(false);
  });

  /**
   * Test system theme detection function
   */
  it('should correctly detect system theme preference', () => {
    // Arrange
    themeStore = new ThemeStore(rootStore);
    
    // Test light preference
    prefersDarkMode = false;
    
    // Act & Assert
    expect(themeStore.getSystemThemePreference()).toBe('light');
    
    // Test dark preference
    prefersDarkMode = true;
    
    // Act & Assert
    expect(themeStore.getSystemThemePreference()).toBe('dark');
  });

  /**
   * Test that localStorage exceptions are handled gracefully when reading theme
   */
  it('should handle localStorage exceptions gracefully when reading theme', () => {
    // Arrange
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    // Act
    themeStore = new ThemeStore(rootStore);
    
    // Assert
    expect(themeStore.theme).toBe('system'); // Falls back to default
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Cleanup
    consoleErrorSpy.mockRestore();
  });

  /**
   * Test that localStorage exceptions are handled gracefully when saving theme
   */
  it('should handle localStorage exceptions gracefully when saving theme', () => {
    // Arrange
    themeStore = new ThemeStore(rootStore);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    // Act
    themeStore.setTheme('dark');
    
    // Assert
    expect(themeStore.theme).toBe('dark'); // Theme still changes in memory
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Cleanup
    consoleErrorSpy.mockRestore();
  });
}); 