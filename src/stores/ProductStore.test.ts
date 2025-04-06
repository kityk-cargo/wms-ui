import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProductStore } from './ProductStore';
import { RootStore } from './RootStore';
import * as apiService from '../services/api';

/**
 * Tests for the ProductStore
 * 
 * These tests verify the ProductStore's functionality for managing products:
 * - Loading products
 * - Loading individual products
 * - Error handling
 * - State management
 */
describe('ProductStore', () => {
  // Setup variables
  let rootStore: RootStore;
  let productStore: ProductStore;
  
  // Mock data
  const mockProducts = [
    {
      id: 1,
      sku: 'PROD-001',
      name: 'Test Product 1',
      category: 'Category A',
      description: 'Description for product 1',
      created_at: '2023-01-01T12:00:00Z',
      updated_at: '2023-01-01T12:00:00Z',
    },
    {
      id: 2,
      sku: 'PROD-002',
      name: 'Test Product 2',
      category: 'Category B',
      description: 'Description for product 2',
      created_at: '2023-01-02T12:00:00Z',
      updated_at: '2023-01-02T12:00:00Z',
    }
  ];
  
  // Mock single product
  const mockSingleProduct = {
    id: 3,
    sku: 'PROD-003',
    name: 'Test Product 3',
    category: 'Category C',
    description: 'Description for product 3',
    created_at: '2023-01-03T12:00:00Z',
    updated_at: '2023-01-03T12:00:00Z',
  };

  // Setup before each test
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Create new instances for each test
    rootStore = new RootStore();
    productStore = new ProductStore(rootStore);
    
    // Mock API service functions
    vi.spyOn(apiService, 'fetchProducts').mockResolvedValue(mockProducts);
    vi.spyOn(apiService, 'fetchProduct').mockResolvedValue(mockSingleProduct);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test initial state of the ProductStore
   */
  it('should initialize with default values', () => {
    // Arrange - store is already initialized in beforeEach
    
    // Act - no action needed
    
    // Assert
    expect(productStore.products).toEqual([]);
    expect(productStore.currentProduct).toBeNull();
    expect(productStore.loading).toBe(false);
    expect(productStore.error).toBeNull();
  });

  /**
   * Test loading all products
   */
  it('should load all products successfully', async () => {
    // Arrange - API mock already set in beforeEach
    
    // Act
    await productStore.loadProducts();
    
    // Assert
    expect(apiService.fetchProducts).toHaveBeenCalledTimes(1);
    expect(productStore.products).toEqual(mockProducts);
    expect(productStore.loading).toBe(false);
    expect(productStore.error).toBeNull();
  });

  /**
   * Test error handling when loading products fails
   */
  it('should handle errors when loading products fails', async () => {
    // Arrange
    vi.spyOn(apiService, 'fetchProducts').mockRejectedValueOnce(new Error('Network error'));
    
    // Act
    await productStore.loadProducts();
    
    // Assert
    expect(apiService.fetchProducts).toHaveBeenCalledTimes(1);
    expect(productStore.products).toEqual([]);
    expect(productStore.loading).toBe(false);
    expect(productStore.error).toBe('Failed to fetch products. Please try again later.');
  });

  /**
   * Test loading a single product by ID
   */
  it('should load a single product by ID', async () => {
    // Arrange - API mock already set in beforeEach
    
    // Act
    await productStore.loadProduct(3);
    
    // Assert
    expect(apiService.fetchProduct).toHaveBeenCalledWith(3);
    expect(productStore.currentProduct).toEqual(mockSingleProduct);
    expect(productStore.loading).toBe(false);
    expect(productStore.error).toBeNull();
  });

  /**
   * Test error handling when loading a single product fails
   */
  it('should handle errors when loading a single product fails', async () => {
    // Arrange
    vi.spyOn(apiService, 'fetchProduct').mockRejectedValueOnce(new Error('Network error'));
    
    // Act
    await productStore.loadProduct(3);
    
    // Assert
    expect(apiService.fetchProduct).toHaveBeenCalledWith(3);
    expect(productStore.currentProduct).toBeNull();
    expect(productStore.loading).toBe(false);
    expect(productStore.error).toBe('Failed to fetch product with ID 3. Please try again later.');
  });

  /**
   * Test the setLoading helper method
   */
  it('should set loading state correctly', () => {
    // Arrange
    expect(productStore.loading).toBe(false);
    
    // Act
    productStore.setLoading(true);
    
    // Assert
    expect(productStore.loading).toBe(true);
    
    // Act again
    productStore.setLoading(false);
    
    // Assert again
    expect(productStore.loading).toBe(false);
  });

  /**
   * Test the setError helper method
   */
  it('should set error state correctly', () => {
    // Arrange
    expect(productStore.error).toBeNull();
    
    // Act
    productStore.setError('Some error occurred');
    
    // Assert
    expect(productStore.error).toBe('Some error occurred');
    
    // Act again
    productStore.setError(null);
    
    // Assert again
    expect(productStore.error).toBeNull();
  });

  /**
   * Test the reset method
   */
  it('should reset the store to its initial state', async () => {
    // Arrange
    // Populate the store first
    await productStore.loadProducts();
    await productStore.loadProduct(3);
    productStore.setError('Some error');
    
    // Verify store has data
    expect(productStore.products).toHaveLength(2);
    expect(productStore.currentProduct).not.toBeNull();
    expect(productStore.error).not.toBeNull();
    
    // Act
    productStore.reset();
    
    // Assert
    expect(productStore.products).toEqual([]);
    expect(productStore.currentProduct).toBeNull();
    expect(productStore.loading).toBe(false);
    expect(productStore.error).toBeNull();
  });

  /**
   * Test loading state transitions during API calls
   */
  it('should manage loading state during API calls', async () => {
    // Arrange
    // Create a promise that won't resolve immediately
    let resolvePromise: (value: any) => void;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    vi.spyOn(apiService, 'fetchProducts').mockReturnValueOnce(delayedPromise as Promise<any>);
    
    // Act - Start the API call but don't await it yet
    const loadPromise = productStore.loadProducts();
    
    // Assert - Check loading state is true during the call
    expect(productStore.loading).toBe(true);
    
    // Resolve the API call
    resolvePromise!(mockProducts);
    
    // Wait for the loadProducts promise to complete
    await loadPromise;
    
    // Assert - loading state should be false after completion
    expect(productStore.loading).toBe(false);
    expect(productStore.products).toEqual(mockProducts);
  });
}); 