import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { Home } from './Home';

/**
 * Tests for the Home page component
 * 
 * These tests verify that the Home page renders correctly:
 * - Displays the welcome message
 * - Shows the feature sections
 * - Provides navigation links
 */
describe('Home Page', () => {
  /**
   * Utility function to render the component within a router context
   */
  const renderWithRouter = () => {
    return render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
  };

  /**
   * Test that the page renders the welcome message
   */
  it('should render the welcome message', () => {
    // Arrange & Act
    renderWithRouter();
    
    // Assert
    expect(screen.getByText('Welcome to the Warehouse Management System')).toBeInTheDocument();
    expect(
      screen.getByText('Manage your inventory, orders, and warehouse operations efficiently')
    ).toBeInTheDocument();
  });

  /**
   * Test that the page displays all feature cards
   */
  it('should display all feature cards', () => {
    // Arrange & Act
    renderWithRouter();
    
    // Assert
    expect(screen.getByText('Order Management')).toBeInTheDocument();
    expect(screen.getByText('Inventory Control')).toBeInTheDocument();
    expect(screen.getByText('Warehouse Operations')).toBeInTheDocument();
    
    // Check that descriptions are also rendered
    expect(screen.getByText('Create, track, and manage customer orders with ease')).toBeInTheDocument();
    expect(screen.getByText('Keep track of your products and stock levels')).toBeInTheDocument();
    expect(screen.getByText('Optimize picking, packing, and shipping processes')).toBeInTheDocument();
  });

  /**
   * Test that the page contains navigation links
   */
  it('should contain navigation links with correct URLs', () => {
    // Arrange & Act
    renderWithRouter();
    
    // Assert
    const createOrderLink = screen.getByRole('link', { name: 'Create Order' });
    expect(createOrderLink).toBeInTheDocument();
    expect(createOrderLink).toHaveAttribute('href', '/orders/create');
    
    const viewOrdersLink = screen.getByRole('link', { name: 'View Orders' });
    expect(viewOrdersLink).toBeInTheDocument();
    expect(viewOrdersLink).toHaveAttribute('href', '/orders');
  });

  /**
   * Test that the navigation links have the correct styling
   */
  it('should style navigation links correctly', () => {
    // Arrange & Act
    renderWithRouter();
    
    // Assert
    const createOrderLink = screen.getByRole('link', { name: 'Create Order' });
    expect(createOrderLink).toHaveClass('btn');
    expect(createOrderLink).toHaveClass('btn-primary');
    
    const viewOrdersLink = screen.getByRole('link', { name: 'View Orders' });
    expect(viewOrdersLink).toHaveClass('btn');
    expect(viewOrdersLink).toHaveClass('btn-secondary');
  });

  /**
   * Test the overall page structure
   */
  it('should have the correct page structure with hero and features sections', () => {
    // Arrange & Act
    renderWithRouter();
    
    // Assert
    const homePage = screen.getByText('Welcome to the Warehouse Management System').closest('.home-page');
    expect(homePage).toBeInTheDocument();
    
    // Check that the page has the main sections
    const heroSection = screen.getByText('Welcome to the Warehouse Management System').closest('.hero-section');
    expect(heroSection).toBeInTheDocument();
    
    const featuresSection = screen.getByText('Order Management').closest('.features-section');
    expect(featuresSection).toBeInTheDocument();
    
    // Directly test for the existence of three feature cards with their specific titles
    const orderManagementCard = screen.getByText('Order Management').closest('.feature-card');
    const inventoryControlCard = screen.getByText('Inventory Control').closest('.feature-card');
    const warehouseOperationsCard = screen.getByText('Warehouse Operations').closest('.feature-card');
    
    expect(orderManagementCard).toBeInTheDocument();
    expect(inventoryControlCard).toBeInTheDocument();
    expect(warehouseOperationsCard).toBeInTheDocument();
  });
}); 