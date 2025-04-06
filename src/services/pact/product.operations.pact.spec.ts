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
import { fetchProduct } from '../api';
import * as path from 'path';

// Must be before any constants declarations due to hoisting
vi.mock('../../config', () => ({
  config: {
    apiUrl: 'http://localhost:7777',
  },
}));

const PACT_PORT = 7777;
// Get the absolute path to the project root
const PROJECT_ROOT = path.resolve(process.cwd());

// Define product schema with matchers for more flexible contract
const productSchema = {
  id: Matchers.integer(1),
  sku: Matchers.string('SKU123'),
  name: Matchers.string('Product Name'),
  category: Matchers.string('Category'),
  description: Matchers.string('Product description'),
  created_at: Matchers.iso8601DateTime(),
  updated_at: Matchers.iso8601DateTime(),
};

describe('Product Single Operations API Pact', () => {
  const provider = new Pact({
    consumer: 'wms_ui',
    provider: 'wms_inventory_management',
    port: PACT_PORT,
    log: path.join(PROJECT_ROOT, 'logs', 'product-operations-pact.log'),
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
            error: Matchers.string('Product not found'),
          },
        },
      });

      // Act & Assert - Expect the request to throw an error
      await expect(fetchProduct(nonExistentProductId)).rejects.toThrow(
        'API error: 404',
      );
    });
  });
});
