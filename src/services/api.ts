import { config } from '../config';
import { Order, OrderCreate } from '../types';

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
 * API Error class for better error handling with HTTP status
 */
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Base API request function with common error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    if (!config.apiUrl) {
      console.error('API URL is not configured. Please check your environment variables.');
      throw new Error('API URL is not configured');
    }

    const url = `${config.apiUrl}${endpoint}`;
    
    // Only pass options to fetch if they're not empty
    const hasOptions = Object.keys(options).length > 0;
    const response = hasOptions 
      ? await fetch(url, options)
      : await fetch(url);

    if (!response.ok) {
      throw new ApiError(`API error: ${response.status}`, response.status);
    }

    // For DELETE operations that don't return content
    if (response.status === 204 || options.method === 'DELETE') {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    // Preserve ApiError instances but wrap others
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error(`Error in API request to ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Creates request options for JSON requests
 */
function createJsonRequestOptions(method: string, data?: unknown): RequestInit {
  return {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  };
}

// Product Endpoints

/**
 * Fetches all products from the API
 */
export async function fetchProducts(): Promise<Product[]> {
  return apiRequest<Product[]>('/api/v1/products');
}

/**
 * Fetches a single product by ID
 */
export async function fetchProduct(id: number): Promise<Product> {
  return apiRequest<Product>(`/api/v1/products/${id}`);
}

// Order Endpoints

/**
 * Fetches all orders from the API
 */
export async function fetchOrders(): Promise<Order[]> {
  return apiRequest<Order[]>('/api/v1/orders');
}

/**
 * Fetches a single order by ID
 */
export async function fetchOrder(id: number): Promise<Order> {
  return apiRequest<Order>(`/api/v1/orders/${id}`);
}

/**
 * Creates a new order
 */
export async function createOrder(orderData: OrderCreate): Promise<Order> {
  return apiRequest<Order>(
    '/api/v1/orders',
    createJsonRequestOptions('POST', orderData)
  );
}

/**
 * Updates an existing order
 */
export async function updateOrder(
  id: number,
  orderData: Order
): Promise<Order> {
  return apiRequest<Order>(
    `/api/v1/orders/${id}`,
    createJsonRequestOptions('PUT', orderData)
  );
}

/**
 * Deletes an order
 */
export async function deleteOrder(id: number): Promise<void> {
  await apiRequest<void>(
    `/api/v1/orders/${id}`,
    { method: 'DELETE' }
  );
}
