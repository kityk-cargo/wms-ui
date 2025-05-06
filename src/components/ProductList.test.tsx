import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProductList } from './ProductList';
import * as apiService from '../services/api';
import { CommonErrorType } from '../types/errors';

/**
 * Tests for the ProductList component
 *
 * These tests verify the ProductList component's functionality:
 * - Fetching and displaying products
 * - Loading state
 * - Error handling
 * - Empty state
 */
describe('ProductList Component', () => {
  // Mock API response data
  const mockProducts = [
    {
      id: 1,
      sku: 'TEST-SKU-001',
      name: 'Test Product 1',
      category: 'Test Category A',
      description: 'This is test product 1',
      created_at: '2023-01-01T12:00:00Z',
      updated_at: '2023-01-10T15:30:00Z',
    },
    {
      id: 2,
      sku: 'TEST-SKU-002',
      name: 'Test Product 2',
      category: 'Test Category B',
      created_at: '2023-02-15T09:45:00Z',
      updated_at: '2023-02-20T14:20:00Z',
    },
  ];

  // Setup and cleanup
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test that component displays loading state while fetching data
   */
  it('should show loading state while fetching products', () => {
    // Arrange
    // Create a promise that won't resolve during the test
    vi.spyOn(apiService, 'fetchProducts').mockImplementation(
      () => new Promise(() => {}),
    );

    // Act
    render(<ProductList />);

    // Assert
    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  /**
   * Test that component displays products correctly after loading
   */
  it('should display products when fetch is successful', async () => {
    // Arrange
    vi.spyOn(apiService, 'fetchProducts').mockResolvedValue(mockProducts);

    // Act
    render(<ProductList />);

    // Assert - wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Products')).toBeInTheDocument();
    });

    // Verify products are displayed
    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    expect(screen.getByText('SKU: TEST-SKU-001')).toBeInTheDocument();
    expect(screen.getByText('SKU: TEST-SKU-002')).toBeInTheDocument();
    expect(screen.getByText('Test Category A')).toBeInTheDocument();
    expect(screen.getByText('Test Category B')).toBeInTheDocument();
    expect(screen.getByText('This is test product 1')).toBeInTheDocument();

    // Verify the dates are formatted correctly
    expect(screen.getAllByText(/Created:/)).toHaveLength(2);
    expect(screen.getAllByText(/Updated:/)).toHaveLength(2);
  });

  /**
   * Test that component handles empty product array properly
   */
  it('should display "No products found" when product array is empty', async () => {
    // Arrange
    vi.spyOn(apiService, 'fetchProducts').mockResolvedValue([]);

    // Act
    render(<ProductList />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });
  });

  /**
   * Test that component handles fetch errors properly
   */
  it('should display error message when fetch fails', async () => {
    // Arrange
    vi.spyOn(apiService, 'fetchProducts').mockRejectedValue(
      new Error('Network error'),
    );

    // Act
    render(<ProductList />);

    // Assert
    await waitFor(() => {
      // The error now comes from an ErrorMessage component with common format
      expect(
        screen.getByText('Failed to fetch products. Please try again later.'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('error-container')).toBeInTheDocument();
      // Client errors should NOT have Error ID displayed
      expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument();
    });
  });

  /**
   * Test that component handles API-specific errors properly with Common Error Format
   */
  it('should display error message for API-specific errors using Common Error Format', async () => {
    // Arrange
    const errorData: CommonErrorType = {
      criticality: 'critical',
      id: 'api-error-123',
      detail: 'API server error occurred',
      title: 'Service Unavailable',
    };
    const apiError = new apiService.ApiError('API error', 500, errorData);
    vi.spyOn(apiService, 'fetchProducts').mockRejectedValue(apiError);

    // Act
    render(<ProductList />);

    // Assert
    await waitFor(() => {
      // Look for the error components from the ErrorMessage component
      expect(screen.getByText(errorData.detail)).toBeInTheDocument();
      if (errorData.title) {
        expect(screen.getByText(errorData.title)).toBeInTheDocument();
      }
      // Only API errors should have Error IDs displayed
      expect(screen.getByText(`Error ID: ${errorData.id}`)).toBeInTheDocument();
    });
  });

  /**
   * Test that fetch products is called exactly once
   */
  it('should call fetchProducts exactly once on mount', async () => {
    // Arrange
    const fetchProductsSpy = vi
      .spyOn(apiService, 'fetchProducts')
      .mockResolvedValue(mockProducts);

    // Act
    render(<ProductList />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Products')).toBeInTheDocument();
    });

    expect(fetchProductsSpy).toHaveBeenCalledTimes(1);
  });

  /**
   * Test that component renders product with missing optional field
   */
  it('should correctly render product without description field', async () => {
    // Arrange
    vi.spyOn(apiService, 'fetchProducts').mockResolvedValue([mockProducts[1]]);

    // Act
    render(<ProductList />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });

    // Verify the optional description is not rendered
    expect(
      screen.queryByText('This is test product 1'),
    ).not.toBeInTheDocument();
  });

  /**
   * Test for date formatting function
   */
  it('should format dates correctly in product card', async () => {
    // Arrange
    // Use a specific date for consistent testing
    const fixedDateProduct = {
      ...mockProducts[0],
      created_at: '2023-04-15T14:30:45Z',
    };

    vi.spyOn(apiService, 'fetchProducts').mockResolvedValue([fixedDateProduct]);

    // Act
    render(<ProductList />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    // Check that the date is formatted as expected
    // This will depend on the locale of the test environment
    // Using a partial match to avoid locale issues in testing environments
    expect(screen.getByText(/4\/15\/2023/)).toBeInTheDocument();
  });

  /**
   * Test that component falls back to generic error message when ApiError doesn't have errorData
   */
  it('should display generic error message when ApiError has no errorData', async () => {
    // Arrange
    const apiError = new apiService.ApiError('Generic API error', 500);
    vi.spyOn(apiService, 'fetchProducts').mockRejectedValue(apiError);

    // Act
    render(<ProductList />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Generic API error')).toBeInTheDocument();
      expect(screen.getByTestId('error-container')).toBeInTheDocument();
      // Should not display Error ID for client-side errors
      expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument();
    });
  });
});
