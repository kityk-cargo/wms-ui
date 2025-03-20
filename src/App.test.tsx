import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';

describe('App', () => {
  it('renders the WMS heading', () => {
    render(<App />);

    // Check for the new heading instead of "Vite + React"
    const headingElement = screen.getByText(
      /WMS - Warehouse Management System/i,
    );
    expect(headingElement).toBeInTheDocument();
  });
});
