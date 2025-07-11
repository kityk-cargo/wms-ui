// For Pact testing with Vitest
import { Pact, Matchers } from '@pact-foundation/pact';
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  vi,
} from 'vitest';
import { fetchProducts, fetchProduct } from '../api';
import * as path from 'path';

// Must be before any constants declarations due to hoisting
vi.mock('../../config', () => ({
  config: {
    apiUrl: 'http://localhost:8888',
  },
}));

const PACT_PORT = 8888;
// Get the absolute path to the project root
const PROJECT_ROOT = path.resolve(process.cwd());

// Define product schema with matchers for flexible contract
const productSchema = {
  id: Matchers.integer(1),
  sku: Matchers.string('SKU123'),
  name: Matchers.string('Product Name'),
  category: Matchers.string('Category'),
  description: Matchers.string('Product description'),
  created_at: Matchers.iso8601DateTime(),
  updated_at: Matchers.iso8601DateTime(),
};

// Create a common error format template
const commonErrorTemplate = {
  criticality: Matchers.string('critical'),
  id: Matchers.uuid(),
  detail: Matchers.string('Error message will go here'),
};

describe('Products API Pact', () => {
  // Ensure consistent naming for proper pact organization
  // Note: Provider name should match the backend service name exactly
  const provider = new Pact({
    consumer: 'wms_ui',
    provider: 'wms_inventory_management',
    port: PACT_PORT,
    log: path.join(PROJECT_ROOT, 'logs', 'pact.log'),
    dir: path.join(PROJECT_ROOT, 'pacts'),
    pactfileWriteMode: 'merge',
    logLevel: 'warn',
  });

  beforeAll(async () => {
    await provider.setup();
  });

  afterAll(async () => {
    await provider.finalize();
  });

  afterEach(async () => {
    await provider.verify();
  });

  describe('get all products', () => {
    it('returns all products with matchers', async () => {
      // Arrange - Setup the expected interaction with matchers
      await provider.addInteraction({
        state: 'products exist',
        uponReceiving: 'a request for all products',
        withRequest: {
          method: 'GET',
          path: '/api/v1/products',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: Matchers.eachLike(productSchema, { min: 2 }),
        },
      });

      // Act - Make the request
      const products = await fetchProducts();

      // Assert - Verify the response contains products
      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThanOrEqual(2);

      // Verify product structure
      expect(products[0]).toHaveProperty('id');
      expect(typeof products[0].id).toBe('number');
      expect(Number.isInteger(products[0].id)).toBe(true);
      expect(products[0]).toHaveProperty('sku');
      expect(products[0]).toHaveProperty('name');
      expect(products[0]).toHaveProperty('category');
      expect(products[0]).toHaveProperty('description');
      expect(products[0]).toHaveProperty('created_at');
      expect(products[0]).toHaveProperty('updated_at');
    });
  });

  describe('get product by id', () => {
    it('returns a specific product', async () => {
      const productId = 1;

      // Arrange - Setup the expected interaction
      await provider.addInteraction({
        state: `product with ID ${productId} exists`,
        uponReceiving: `a request for product with ID ${productId}`,
        withRequest: {
          method: 'GET',
          path: `/api/v1/products/${productId}`,
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: productSchema,
        },
      });

      // Act - Make the request
      const product = await fetchProduct(productId);

      // Assert - Verify the response contains the product
      expect(product).toBeDefined();
      expect(product.id).toBe(productId);
      expect(product).toHaveProperty('sku');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('category');
      expect(typeof product.id).toBe('number');
      expect(Number.isInteger(product.id)).toBe(true);
    });
  });

  describe('get product by id - not found', () => {
    it('returns a 404 when product does not exist', async () => {
      const nonExistentProductId = 9999;

      // Arrange - Setup the expected interaction
      await provider.addInteraction({
        state: `product with ID ${nonExistentProductId} does not exist`,
        uponReceiving: `a request for non-existent product with ID ${nonExistentProductId}`,
        withRequest: {
          method: 'GET',
          path: `/api/v1/products/${nonExistentProductId}`,
        },
        willRespondWith: {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            ...commonErrorTemplate,
            detail: Matchers.string('Product not found'),
          },
        },
      });

      // Act & Assert - Expect the request to throw an error
      await expect(fetchProduct(nonExistentProductId)).rejects.toThrow(
        'Product not found',
      );
    });
  });

  describe('get product - server error', () => {
    it('handles unexpected server errors gracefully', async () => {
      const productId = 1;

      // Arrange - Setup the expected interaction
      await provider.addInteraction({
        state: 'product service is experiencing issues',
        uponReceiving: 'a request during server issues',
        withRequest: {
          method: 'GET',
          path: `/api/v1/products/${productId}`,
        },
        willRespondWith: {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            ...commonErrorTemplate,
            detail: Matchers.string('Internal server error'),
          },
        },
      });

      // Act & Assert - Make the request and expect an error
      await expect(fetchProduct(productId)).rejects.toThrow(
        'Internal server error',
      );
    });
  });
});
