import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchProducts } from './api';
import { config } from '../config';

//todo: consider removing these tests as pact tests cover this functionality
describe('Product API Contract Tests', () => {
  // Mock the global fetch
  const mockFetch = vi.fn();

  // Store original window.fetch and global.fetch
  const originalFetch = global.fetch;

  const mockProductData = [
    {
      sku: 'SKU001',
      name: 'Product A',
      category: 'Category Alpha',
      description: 'Description for Product A',
      id: 1,
      created_at: '2025-03-05T01:00:20.154260+00:00',
      updated_at: '2025-03-05T01:00:20.154260+00:00',
    },
    {
      sku: 'SKU002',
      name: 'Product B',
      category: 'Category Beta',
      description: 'Description for Product B',
      id: 2,
      created_at: '2025-03-05T01:00:20.154260+00:00',
      updated_at: '2025-03-05T01:00:20.154260+00:00',
    },
  ];

  beforeEach(() => {
    // Mock config.apiUrl to ensure it has a value for testing
    vi.spyOn(config, 'apiUrl', 'get').mockReturnValue('http://test-api');

    // Setup mock fetch implementation
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockProductData,
    });

    // Replace global fetch with mock
    global.fetch = mockFetch;
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;

    // Clear all mocks
    vi.clearAllMocks();
  });

  it('should fetch products with the correct contract format', async () => {
    // Act
    const products = await fetchProducts();

    // Assert
    // Verify fetch was called correctly
    expect(mockFetch).toHaveBeenCalledWith('http://test-api/api/v1/products');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Verify product contract - structure and data types
    expect(products).toHaveLength(2);

    // Test first product schema
    expect(products[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        sku: expect.any(String),
        name: expect.any(String),
        category: expect.any(String),
        description: expect.any(String),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      }),
    );

    // Test against exact mock data to ensure proper parsing
    expect(products).toEqual(mockProductData);
  });

  it('should handle API errors properly', async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    // Act & Assert
    await expect(fetchProducts()).rejects.toThrow('API error: 500');
  });

  it('should handle network errors properly', async () => {
    // Arrange
    mockFetch.mockRejectedValue(new Error('Network failure'));

    // Act & Assert
    await expect(fetchProducts()).rejects.toThrow('Network failure');
  });

  it('should verify required fields in the product schema', async () => {
    // Act
    const products = await fetchProducts();

    // Assert - verify each required field
    products.forEach((product) => {
      expect(product.id).toBeDefined();
      expect(product.sku).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.category).toBeDefined();
      // Description is optional in the Product interface, so we don't strictly check it
      expect(product.created_at).toBeDefined();
      expect(product.updated_at).toBeDefined();
    });
  });
});
