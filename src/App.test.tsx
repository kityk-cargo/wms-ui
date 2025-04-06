import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';

describe('App', () => {
  it('renders the WMS logo and navigation', () => {
    render(<App />);

    // Check for the WMS logo
    const logoElement = screen.getByText('WMS');
    expect(logoElement).toBeInTheDocument();
    
    // Check for navigation links
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });
});
