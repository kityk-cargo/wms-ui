import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Home } from './Home';
import { renderWithRouter } from '../test/test-utils';

/**
 * Tests for the Home page component
 *
 * These tests verify that the Home page:
 * - Displays the welcome message correctly
 * - Shows feature sections with appropriate content
 * - Provides navigation links with correct attributes
 */
describe('Home Page', () => {
  const featureCards = [
    {
      title: 'Order Management',
      description: 'Create, track, and manage customer orders with ease',
    },
    {
      title: 'Inventory Control',
      description: 'Keep track of your products and stock levels',
    },
    {
      title: 'Warehouse Operations',
      description: 'Optimize picking, packing, and shipping processes',
    },
  ];

  const navigationLinks = [
    { name: 'Create Order', href: '/orders/create', className: 'btn-primary' },
    { name: 'View Orders', href: '/orders', className: 'btn-secondary' },
  ];

  /**
   * Test that the page renders the welcome message
   */
  it('should render the welcome message', () => {
    // Arrange & Act
    renderWithRouter(<Home />);

    // Assert
    expect(
      screen.getByText('Welcome to the Warehouse Management System'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Manage your inventory, orders, and warehouse operations efficiently',
      ),
    ).toBeInTheDocument();
  });

  /**
   * Test that the page displays all feature cards
   */
  it('should display all feature cards with correct content', () => {
    // Arrange & Act
    renderWithRouter(<Home />);

    // Assert
    featureCards.forEach(({ title, description }) => {
      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(description)).toBeInTheDocument();

      // Verify each title is within a feature card
      const card = screen.getByText(title).closest('.feature-card');
      expect(card).toBeInTheDocument();
    });
  });

  /**
   * Test that the page contains navigation links with correct attributes
   */
  it('should contain navigation links with correct URLs and styling', () => {
    // Arrange & Act
    renderWithRouter(<Home />);

    // Assert
    navigationLinks.forEach(({ name, href, className }) => {
      const link = screen.getByRole('link', { name });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveClass('btn');
      expect(link).toHaveClass(className);
    });
  });

  /**
   * Test the overall page structure
   */
  it('should have the correct page structure with hero and features sections', () => {
    // Arrange & Act
    renderWithRouter(<Home />);

    // Assert
    // Check main page container
    const homePage =
      screen.getByTestId('home-page') ||
      screen
        .getByText('Welcome to the Warehouse Management System')
        .closest('.home-page');
    expect(homePage).toBeInTheDocument();

    // Check main sections
    const heroSection = screen
      .getByText('Welcome to the Warehouse Management System')
      .closest('.hero-section');
    expect(heroSection).toBeInTheDocument();

    const featuresSection =
      screen.getByTestId('features-section') ||
      screen.getByText('Order Management').closest('.features-section');
    expect(featuresSection).toBeInTheDocument();

    // Check that all feature cards are children of the features section
    featureCards.forEach(({ title }) => {
      const card = screen
        .getByText(title)
        .closest('.feature-card') as HTMLElement;
      expect(featuresSection).toContainElement(card);
    });
  });
});
