import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProductList } from './ProductList';
import { renderWithProviders, mockProducts } from '../test/test-utils';
import { useProductStore } from '../stores/StoreContext';
import { ReactNode } from 'react';

// Mock the store
vi.mock('../stores/StoreContext', () => ({
  useProductStore: vi.fn(),
  StoreProvider: ({ children }: { children: ReactNode }) => children
}));

describe('ProductList', () => {
  // Create mock store for testing with proper typing
  const mockProductStore = {
    products: [] as typeof mockProducts,
    loading: false,
    error: null as string | null,
    loadProducts: vi.fn(),
    reset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock store
    (useProductStore as any).mockReturnValue(mockProductStore);
  });

  it('should render loading state when loading products', () => {
    // Arrange: Set loading to true
    mockProductStore.loading = true;
    
    // Act: Render component
    renderWithProviders(<ProductList />);
    
    // Assert: Check loading message is displayed
    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('should render error message when there is an error', () => {
    // Arrange: Set error message
    mockProductStore.loading = false;
    mockProductStore.error = 'Failed to load products';
    
    // Act: Render component
    renderWithProviders(<ProductList />);
    
    // Assert: Check error message is displayed
    expect(screen.getByText('Failed to load products')).toBeInTheDocument();
  });

  it('should render "No products found" when products array is empty', () => {
    // Arrange: Set empty products array
    mockProductStore.loading = false;
    mockProductStore.error = null;
    mockProductStore.products = [];
    
    // Act: Render component
    renderWithProviders(<ProductList />);
    
    // Assert: Check no products message is displayed
    expect(screen.getByText('No products found.')).toBeInTheDocument();
  });

  it('should render product cards when products are available', () => {
    // Arrange: Set mock products data
    mockProductStore.loading = false;
    mockProductStore.error = null;
    mockProductStore.products = mockProducts;
    
    // Act: Render component
    renderWithProviders(<ProductList />);
    
    // Assert: Check header is displayed
    expect(screen.getByText('Products')).toBeInTheDocument();
    
    // Check product data is rendered
    mockProducts.forEach(product => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
      expect(screen.getByText(`SKU: ${product.sku}`)).toBeInTheDocument();
      expect(screen.getByText(product.category)).toBeInTheDocument();
      
      // Check description if it exists
      if (product.description) {
        expect(screen.getByText(product.description)).toBeInTheDocument();
      }
    });
    
    // Check created/updated dates are rendered
    expect(screen.getAllByText('Created:').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Updated:').length).toBeGreaterThan(0);
  });

  it('should call loadProducts on component mount', () => {
    // Arrange & Act: Render component
    renderWithProviders(<ProductList />);
    
    // Assert: loadProducts should be called
    expect(mockProductStore.loadProducts).toHaveBeenCalledTimes(1);
  });

  it('should call reset when component unmounts', () => {
    // Arrange: Render component
    const { unmount } = renderWithProviders(<ProductList />);
    
    // Act: Unmount component
    unmount();
    
    // Assert: reset should be called
    expect(mockProductStore.reset).toHaveBeenCalledTimes(1);
  });
}); 