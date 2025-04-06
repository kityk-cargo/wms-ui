import { makeAutoObservable } from 'mobx';
import { RootStore } from './RootStore';

export type Theme = 'light' | 'dark' | 'system';

/**
 * MobX store for theme management
 */
export class ThemeStore {
  // Observable state
  theme: Theme = 'system';
  isExpanded: boolean = false;
  
  // Root store reference
  rootStore: RootStore;
  
  // Media query for system theme detection
  private darkModeMediaQuery: MediaQueryList | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    
    // Initialize the theme from localStorage
    this.theme = this.initializeTheme();
    
    // Make all properties observable
    makeAutoObservable(this, {
      rootStore: false, // Do not make the root store reference observable
      darkModeMediaQuery: false // Do not make media query observable
    });
    
    // Apply the theme immediately
    this.applyTheme();
    
    // Set up system theme change listener
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.setupSystemThemeListener();
    }
  }

  /**
   * Sets a new theme and applies it
   */
  setTheme = (newTheme: Theme): void => {
    this.theme = newTheme;
    this.applyTheme();
  };

  /**
   * Toggles expanded state for theme selector
   */
  toggleExpanded = (): void => {
    this.isExpanded = !this.isExpanded;
  };

  /**
   * Sets expanded state for theme selector
   */
  setExpanded = (expanded: boolean): void => {
    this.isExpanded = expanded;
  };

  /**
   * Gets the system theme preference
   */
  getSystemThemePreference = (): 'light' | 'dark' => {
    if (typeof window === 'undefined' || !window.matchMedia) return 'light';
    
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch (err) {
      console.error('Error checking system theme preference:', err);
      return 'light';
    }
  };

  /**
   * Initialize theme from localStorage
   */
  private initializeTheme = (): Theme => {
    if (typeof window === 'undefined' || !window.localStorage) return 'system';
    
    try {
      const storedTheme = localStorage.getItem('theme') as Theme | null;

      if (
        storedTheme &&
        (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system')
      ) {
        return storedTheme;
      }
    } catch (err) {
      console.error('Error reading theme from localStorage:', err);
    }

    // Default to system
    return 'system';
  };

  /**
   * Apply the current theme to the document
   */
  private applyTheme = (): void => {
    if (typeof document === 'undefined') return;
    
    try {
      const root = document.documentElement;
      const effectiveTheme = this.theme === 'system' 
        ? this.getSystemThemePreference() 
        : this.theme;

      // Remove existing theme classes
      root.classList.remove('light-theme', 'dark-theme');

      // Add the appropriate theme class
      root.classList.add(`${effectiveTheme}-theme`);

      // Store the theme preference
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('theme', this.theme);
      }
    } catch (err) {
      console.error('Error applying theme:', err);
    }
  };

  /**
   * Set up listener for system theme changes
   */
  private setupSystemThemeListener = (): void => {
    // Clean up any existing listeners first
    this.cleanupSystemThemeListener();
    
    if (this.theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      try {
        this.darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        // Handler for system theme changes
        const handleThemeChange = (): void => {
          this.applyTheme();
        };

        // Modern browsers
        if (this.darkModeMediaQuery.addEventListener) {
          this.darkModeMediaQuery.addEventListener('change', handleThemeChange);
        } else if (this.darkModeMediaQuery.addListener) {
          // Legacy support for older browsers
          this.darkModeMediaQuery.addListener(handleThemeChange);
        }
      } catch (err) {
        console.error('Error setting up system theme listener:', err);
      }
    }
  };

  /**
   * Clean up system theme change listeners
   */
  private cleanupSystemThemeListener = (): void => {
    if (!this.darkModeMediaQuery) return;
    
    try {
      // Handler for system theme changes - should match the one in setupSystemThemeListener
      const handleThemeChange = (): void => {
        this.applyTheme();
      };

      // Modern browsers
      if (this.darkModeMediaQuery.removeEventListener) {
        this.darkModeMediaQuery.removeEventListener('change', handleThemeChange);
      } else if (this.darkModeMediaQuery.removeListener) {
        // Legacy support for older browsers
        this.darkModeMediaQuery.removeListener(handleThemeChange);
      }
      
      this.darkModeMediaQuery = null;
    } catch (err) {
      console.error('Error cleaning up system theme listener:', err);
    }
  };
} 