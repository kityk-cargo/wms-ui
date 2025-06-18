import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProductStore } from './ProductStore';
import { RootStore } from './RootStore';
import * as apiService from '../services/api';
import {
  mockProducts,
  mockSingleProduct,
  createResolvablePromise,
} from '../test/test-utils';

/**
 * Tests for the ProductStore
 *
 * These tests verify that the ProductStore correctly:
 * - Manages product data and state
 * - Handles API operations (load products, load product)
 * - Manages loading and error states
 */
describe('ProductStore', () => {
  // Setup variables
  let rootStore: RootStore;
  let productStore: ProductStore;

  // Setup before each test
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Create new instances for each test
    rootStore = new RootStore();
    productStore = new ProductStore(rootStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test initial state of the ProductStore
   */
  it('should initialize with default values', () => {
    // Assert
    expect(productStore.products).toEqual([]);
    expect(productStore.currentProduct).toBeNull();
    expect(productStore.loading).toBe(false);
    expect(productStore.error).toBeNull();
  });

  /**
   * Test product loading operations
   */
  describe('product loading operations', () => {
    it('should load all products successfully', async () => {
      // Arrange
      vi.spyOn(apiService, 'fetchProducts').mockResolvedValue(mockProducts);

      // Act
      await productStore.loadProducts();

      // Assert
      expect(productStore.products).toEqual(mockProducts);
      expect(productStore.loading).toBe(false);
      expect(productStore.error).toBeNull();
    });

    it('should handle errors when loading products fails', async () => {
      // Arrange
      vi.spyOn(apiService, 'fetchProducts').mockRejectedValue(
        new Error('Network error'),
      );

      // Act
      await productStore.loadProducts();

      // Assert
      expect(productStore.products).toEqual([]);
      expect(productStore.loading).toBe(false);
      expect(productStore.error).toEqual({
        criticality: 'critical',
        id: '',
        detail: 'Failed to fetch products. Please try again later.',
      });
    });

    it('should load a single product by ID', async () => {
      // Arrange
      const productId = 3;
      vi.spyOn(apiService, 'fetchProduct').mockResolvedValue(mockSingleProduct);

      // Act
      await productStore.loadProduct(productId);

      // Assert
      expect(apiService.fetchProduct).toHaveBeenCalledWith(productId);
      expect(productStore.currentProduct).toEqual(mockSingleProduct);
      expect(productStore.loading).toBe(false);
      expect(productStore.error).toBeNull();
    });

    it('should handle errors when loading a single product fails', async () => {
      // Arrange
      const productId = 3;
      vi.spyOn(apiService, 'fetchProduct').mockRejectedValue(
        new Error('Network error'),
      );

      // Act
      await productStore.loadProduct(productId);

      // Assert
      expect(productStore.currentProduct).toBeNull();
      expect(productStore.loading).toBe(false);
      expect(productStore.error).toEqual({
        criticality: 'critical',
        id: '',
        detail: `Failed to fetch product with ID ${productId}. Please try again later.`,
      });
    });
  });

  /**
   * Test state management functions
   */
  describe('state management functions', () => {
    it('should set error state correctly', () => {
      // Arrange
      const errorMessage = 'Test error message';

      // Act
      productStore.setError(errorMessage);

      // Assert
      expect(productStore.error).toBe(errorMessage);

      // Act again - clear error
      productStore.setError(null);

      // Assert again
      expect(productStore.error).toBeNull();
    });

    it('should reset the store to its initial state', async () => {
      // Arrange - populate the store
      vi.spyOn(apiService, 'fetchProducts').mockResolvedValue(mockProducts);
      vi.spyOn(apiService, 'fetchProduct').mockResolvedValue(mockSingleProduct);

      await productStore.loadProducts();
      await productStore.loadProduct(3);
      productStore.setError('Some error');

      // Verify store has data
      expect(productStore.products).toHaveLength(mockProducts.length);
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

    it('should manage loading state during API calls', async () => {
      // Arrange
      const [promise, resolve] = createResolvablePromise<typeof mockProducts>();
      vi.spyOn(apiService, 'fetchProducts').mockReturnValueOnce(promise);

      // Act - Start the API call but don't await it yet
      const loadPromise = productStore.loadProducts();

      // Assert - loading state should be true during call
      expect(productStore.loading).toBe(true);

      // Resolve the API call
      resolve(mockProducts);

      // Wait for the loadProducts promise to complete
      await loadPromise;

      // Assert - loading state should be false after completion
      expect(productStore.loading).toBe(false);
      expect(productStore.products).toEqual(mockProducts);
    });
  });
});
