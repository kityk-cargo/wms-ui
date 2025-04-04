import { config } from '../config';

// Type definitions
export interface Product {
  id: number; // ID must be a number (integer)
  sku: string;
  name: string;
  category: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches all products from the API
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    // Check if API URL is configured
    if (!config.apiUrl) {
      console.error(
        'API URL is not configured. Please check your environment variables.',
      );
      throw new Error('API URL is not configured');
    }

    const response = await fetch(`${config.apiUrl}/api/v1/products`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // The API contract requires product IDs to be integers
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}
