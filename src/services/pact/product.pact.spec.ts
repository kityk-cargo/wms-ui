// For Pact testing with Vitest
import { Pact } from '@pact-foundation/pact';
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
    apiUrl: 'http://localhost:8888',
  },
}));

const PACT_PORT = 8888;
// Get the absolute path to the project root
const PROJECT_ROOT = path.resolve(process.cwd());

// Sample product data that matches our expected contract
const EXPECTED_PRODUCTS = [
  {
    id: '1',
    sku: 'SKU123',
    name: 'Product 1',
    category: 'Category A',
    description: 'Product 1 description',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
  },
  {
    id: '2',
    sku: 'SKU456',
    name: 'Product 2',
    category: 'Category B',
    description: 'Product 2 description',
    created_at: '2023-01-03T00:00:00Z',
    updated_at: '2023-01-04T00:00:00Z',
  },
];

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
    it('returns all products', async () => {
      // Arrange - Setup the expected interaction
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
          body: EXPECTED_PRODUCTS,
        },
      });

      // Act - Make the request
      const products = await fetchProducts();

      // Assert - Verify the response
      expect(products).toEqual(EXPECTED_PRODUCTS);
    });
  });
});
