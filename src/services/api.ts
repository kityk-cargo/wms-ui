import { config } from '../config';
import { Order, OrderCreate, Product as ProductType } from '../types';

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

/**
 * Fetches a single product by ID
 */
export async function fetchProduct(id: number): Promise<Product> {
  try {
    if (!config.apiUrl) {
      throw new Error('API URL is not configured');
    }

    const response = await fetch(`${config.apiUrl}/api/v1/products/${id}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
}

/**
 * Fetches all orders from the API
 */
export async function fetchOrders(): Promise<Order[]> {
  try {
    if (!config.apiUrl) {
      throw new Error('API URL is not configured');
    }

    const response = await fetch(`${config.apiUrl}/api/v1/orders`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

/**
 * Fetches a single order by ID
 */
export async function fetchOrder(id: number): Promise<Order> {
  try {
    if (!config.apiUrl) {
      throw new Error('API URL is not configured');
    }

    const response = await fetch(`${config.apiUrl}/api/v1/orders/${id}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
}

/**
 * Creates a new order
 */
export async function createOrder(orderData: OrderCreate): Promise<Order> {
  try {
    if (!config.apiUrl) {
      throw new Error('API URL is not configured');
    }

    const response = await fetch(`${config.apiUrl}/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Updates an existing order
 */
export async function updateOrder(
  id: number,
  orderData: Order,
): Promise<Order> {
  try {
    if (!config.apiUrl) {
      throw new Error('API URL is not configured');
    }

    const response = await fetch(`${config.apiUrl}/api/v1/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating order ${id}:`, error);
    throw error;
  }
}

/**
 * Deletes an order
 */
export async function deleteOrder(id: number): Promise<void> {
  try {
    if (!config.apiUrl) {
      throw new Error('API URL is not configured');
    }

    const response = await fetch(`${config.apiUrl}/api/v1/orders/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error deleting order ${id}:`, error);
    throw error;
  }
}
