import { config } from '../config';

// Type definitions
export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  sku?: string;
  // Add other properties as needed
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

    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}
