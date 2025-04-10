import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import {
  getSystemThemePreference,
  initializeTheme,
  applyTheme,
  setupThemeListeners,
  removeThemeListeners,
  Theme
} from './theme';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

// Type for our MediaQueryList mock to ensure consistency
type MediaQueryListMock = {
  matches: boolean;
  media: string;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  addListener: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  dispatchEvent: ReturnType<typeof vi.fn>;
};

// Create a media query list factory function that returns a consistent mock
const createMediaQueryListMock = (matches: boolean): MediaQueryListMock => ({
  matches,
  media: '(prefers-color-scheme: dark)',
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

describe('Theme Utils', () => {
  // Setup global mocks and spies
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    // Use spyOn instead of direct assignment for classList methods
    vi.spyOn(document.documentElement.classList, 'add').mockImplementation(vi.fn());
    vi.spyOn(document.documentElement.classList, 'remove').mockImplementation(vi.fn());
    vi.spyOn(document.documentElement.classList, 'contains').mockImplementation(vi.fn());
  });

  // Clear mocks between tests
  afterEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('getSystemThemePreference', () => {
    it('should return dark when system preference is dark', () => {
      // Setup mock to return dark mode
      const darkMediaQueryMock = createMediaQueryListMock(true);
      vi.spyOn(window, 'matchMedia').mockImplementationOnce(() => darkMediaQueryMock as any);
      
      expect(getSystemThemePreference()).toBe('dark');
    });

    it('should return light when system preference is not dark', () => {
      // Setup mock to return light mode
      const lightMediaQueryMock = createMediaQueryListMock(false);
      vi.spyOn(window, 'matchMedia').mockImplementationOnce(() => lightMediaQueryMock as any);
      
      expect(getSystemThemePreference()).toBe('light');
    });
  });

  describe('initializeTheme', () => {
    it('should return stored theme when valid', () => {
      localStorageMock.getItem.mockReturnValueOnce('dark');
      expect(initializeTheme()).toBe('dark');
      
      // Test all valid theme values
      localStorageMock.getItem.mockReturnValueOnce('light');
      expect(initializeTheme()).toBe('light');
      
      localStorageMock.getItem.mockReturnValueOnce('system');
      expect(initializeTheme()).toBe('system');
    });

    it('should return system when stored theme is invalid', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid');
      expect(initializeTheme()).toBe('system');
    });

    it('should return system when no stored theme exists', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      expect(initializeTheme()).toBe('system');
    });
  });

  describe('applyTheme', () => {
    it('should apply light theme correctly', () => {
      applyTheme('light');
      
      // Should remove both theme classes and add light-theme
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('light-theme', 'dark-theme');
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('light-theme');
      
      // Should store the theme preference
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('should apply dark theme correctly', () => {
      applyTheme('dark');
      
      // Should remove both theme classes and add dark-theme
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('light-theme', 'dark-theme');
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark-theme');
      
      // Should store the theme preference
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should apply system theme based on system preference', () => {
      // Mock system preference to dark
      const darkMediaQueryMock = createMediaQueryListMock(true);
      vi.spyOn(window, 'matchMedia').mockImplementationOnce(() => darkMediaQueryMock as any);
      
      applyTheme('system');
      
      // Should remove both theme classes and add dark-theme (based on mocked system preference)
      expect(document.documentElement.classList.remove).toHaveBeenCalledWith('light-theme', 'dark-theme');
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark-theme');
      
      // Should store the theme preference as system
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'system');

      // Reset mocks and test with light system preference
      vi.clearAllMocks();
      const lightMediaQueryMock = createMediaQueryListMock(false);
      vi.spyOn(window, 'matchMedia').mockImplementationOnce(() => lightMediaQueryMock as any);
      
      applyTheme('system');
      
      // Should add light-theme based on system preference
      expect(document.documentElement.classList.add).toHaveBeenCalledWith('light-theme');
    });
  });

  describe('setupThemeListeners', () => {
    it('should setup event listeners when theme is system for modern browsers', () => {
      // Create a modern browser mock
      const mediaQueryMock = createMediaQueryListMock(false);
      // Modern browser implements addEventListener
      mediaQueryMock.addEventListener.mockImplementation(vi.fn());
      vi.spyOn(window, 'matchMedia').mockImplementationOnce(() => mediaQueryMock as any);
      
      // Call the function we're testing
      setupThemeListeners('system');
      
      // Should add event listeners for modern browsers
      expect(mediaQueryMock.addEventListener).toHaveBeenCalledTimes(1);
      expect(mediaQueryMock.addListener).not.toHaveBeenCalled();
    });

    it('should setup event listeners when theme is system for legacy browsers', () => {
      // Create a legacy browser mock
      const mediaQueryMock = createMediaQueryListMock(false);
      
      // Legacy implementation check - we need to modify the mediaQueryMock to simulate legacy browser behavior
      const mockMatchMedia = () => {
        const result = { ...mediaQueryMock };
        // Remove modern methods to simulate legacy browser
        Object.defineProperty(result, 'addEventListener', { value: undefined });
        Object.defineProperty(result, 'removeEventListener', { value: undefined });
        return result as any;
      };
      
      vi.spyOn(window, 'matchMedia').mockImplementationOnce(mockMatchMedia);
      
      // Call the function
      setupThemeListeners('system');
      
      // Should add event listeners for legacy browsers
      expect(mediaQueryMock.addListener).toHaveBeenCalledTimes(1);
    });

    it('should not setup event listeners when theme is not system', () => {
      const mediaQueryMock = createMediaQueryListMock(false);
      vi.spyOn(window, 'matchMedia').mockImplementationOnce(() => mediaQueryMock as any);
      
      setupThemeListeners('dark');
      
      // Should not add any event listeners
      expect(mediaQueryMock.addEventListener).not.toHaveBeenCalled();
      expect(mediaQueryMock.addListener).not.toHaveBeenCalled();
    });
  });

  describe('removeThemeListeners', () => {
    it('should remove event listeners for modern browsers', () => {
      // Create a modern browser mock
      const mediaQueryMock = createMediaQueryListMock(false);
      // Modern browser implements removeEventListener
      mediaQueryMock.removeEventListener.mockImplementation(vi.fn());
      vi.spyOn(window, 'matchMedia').mockImplementationOnce(() => mediaQueryMock as any);
      
      removeThemeListeners();
      
      // Should remove event listeners for modern browsers
      expect(mediaQueryMock.removeEventListener).toHaveBeenCalledTimes(1);
      expect(mediaQueryMock.removeListener).not.toHaveBeenCalled();
    });

    it('should remove event listeners for legacy browsers', () => {
      // Create a legacy browser mock
      const mediaQueryMock = createMediaQueryListMock(false);
      
      // Legacy implementation check
      const mockMatchMedia = () => {
        const result = { ...mediaQueryMock };
        // Remove modern methods to simulate legacy browser
        Object.defineProperty(result, 'addEventListener', { value: undefined });
        Object.defineProperty(result, 'removeEventListener', { value: undefined });
        return result as any;
      };
      
      vi.spyOn(window, 'matchMedia').mockImplementationOnce(mockMatchMedia);
      
      // Call the function
      removeThemeListeners();
      
      // Should remove event listeners for legacy browsers
      expect(mediaQueryMock.removeListener).toHaveBeenCalledTimes(1);
    });
  });
}); 