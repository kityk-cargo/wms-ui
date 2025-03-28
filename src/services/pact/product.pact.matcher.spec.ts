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
import { fetchProducts } from '../api';
import * as path from 'path';

// Must be before any constants declarations due to hoisting
vi.mock('../../config', () => ({
  config: {
    apiUrl: 'http://localhost:9999',
  },
}));

const PACT_PORT = 9999;
// Get the absolute path to the project root
const PROJECT_ROOT = path.resolve(process.cwd());

// Define product schema with matchers for more flexible contract
const productSchema = {
  id: Matchers.like('1'),
  sku: Matchers.like('SKU123'),
  name: Matchers.like('Product Name'),
  category: Matchers.like('Category'),
  description: Matchers.like('Product description'),
  created_at: Matchers.like('2023-01-01T00:00:00Z'),
  updated_at: Matchers.like('2023-01-01T00:00:00Z'),
};

describe('Products API Pact with Matchers', () => {
  const provider = new Pact({
    consumer: 'wms_ui',
    provider: 'wms_inventory_management',
    port: PACT_PORT,
    log: path.join(PROJECT_ROOT, 'logs', 'pact-matcher.log'),
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

  describe('get all products with matchers', () => {
    it('returns all products', async () => {
      // Arrange - Setup the expected interaction with matchers
      await provider.addInteraction({
        state: 'products exist',
        uponReceiving: 'a request for all products with matchers',
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
      expect(products[0]).toHaveProperty('sku');
      expect(products[0]).toHaveProperty('name');
      expect(products[0]).toHaveProperty('category');
      expect(products[0]).toHaveProperty('description');
      expect(products[0]).toHaveProperty('created_at');
      expect(products[0]).toHaveProperty('updated_at');
    });
  });
});
