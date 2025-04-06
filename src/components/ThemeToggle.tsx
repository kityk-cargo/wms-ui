import { useState, useEffect } from 'react';
import {
  initializeTheme,
  applyTheme,
  setupThemeListeners,
  Theme,
} from '../utils/theme';
import './ThemeToggle.css';

/**
 * ThemeToggle component that allows switching between light, dark, and system theme
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(initializeTheme());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Apply the current theme
    applyTheme(theme);

    // Set up listeners for system theme changes
    setupThemeListeners(theme);

    // Cleanup function to remove previously registered listeners
    return () => {
      removeThemeListeners(theme);
    };
  }, [theme]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsExpanded(false);
  };

  return (
    <div className="theme-toggle">
      {!isExpanded ? (
        <button
          className="theme-toggle-button"
          onClick={() => setIsExpanded(true)}
          aria-label="Open theme settings"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8V16Z"
              fill="currentColor"
            />
            <path
              d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4V8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16V20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z"
              fill="currentColor"
            />
          </svg>
          <span className="theme-toggle-label">Theme</span>
        </button>
      ) : (
        <div className="theme-options">
          <button
            className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
            onClick={() => handleThemeChange('light')}
            title="Light mode"
            aria-label="Switch to light mode"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
                fill="currentColor"
              />
              <path
                d="M12 3.5V1M12 23V20.5M3.5 12H1M23 12H20.5M5.4 5.4L3.5 3.5M20.5 20.5L18.6 18.6M18.6 5.4L20.5 3.5M3.5 20.5L5.4 18.6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="theme-btn-label">Light</span>
          </button>
          <button
            className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => handleThemeChange('dark')}
            title="Dark mode"
            aria-label="Switch to dark mode"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 11.54 20.96 11.08 20.9 10.64C19.92 12.01 18.32 12.9 16.5 12.9C13.52 12.9 11.1 10.48 11.1 7.5C11.1 5.69 11.99 4.08 13.36 3.1C12.92 3.04 12.46 3 12 3Z"
                fill="currentColor"
              />
            </svg>
            <span className="theme-btn-label">Dark</span>
          </button>
          <button
            className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
            onClick={() => handleThemeChange('system')}
            title="System preference"
            aria-label="Use system theme preference"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V15C20 16.1046 19.1046 17 18 17H6C4.89543 17 4 16.1046 4 15V6Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M8 20H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path d="M12 17V20" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="theme-btn-label">System</span>
          </button>
          <button
            className="theme-close-btn"
            onClick={() => setIsExpanded(false)}
            aria-label="Close theme settings"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 18L18 6M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
