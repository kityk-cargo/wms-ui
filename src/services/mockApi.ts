/**
 * Mock API service for testing
 * This file provides mock implementations of the API functions for testing purposes.
 */

import { Product } from './api';

/**
 * todo: consider removing this file and just using the mockProducts array in the pact tests
 */
export const mockProducts: Product[] = [
  {
    id: 1,
    sku: 'SKU001',
    name: 'Product A',
    category: 'Category Alpha',
    description: 'Description for Product A',
    created_at: '2025-03-05T01:00:20.154260+00:00',
    updated_at: '2025-03-05T01:00:20.154260+00:00',
  },
  {
    id: 2,
    sku: 'SKU002',
    name: 'Product B',
    category: 'Category Beta',
    description: 'Description for Product B',
    created_at: '2025-03-05T01:00:20.154260+00:00',
    updated_at: '2025-03-05T01:00:20.154260+00:00',
  },
];

/**
 * Mock implementation of fetchProducts
 */
export async function mockFetchProducts(): Promise<Product[]> {
  return Promise.resolve([...mockProducts]);
}

/**
 * Setup for MSW or other API mocking libraries
 */
export const productHandlers = {
  getProducts: () => {
    return new Response(JSON.stringify(mockProducts), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};
