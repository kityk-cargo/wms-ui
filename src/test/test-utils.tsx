import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '../stores/StoreContext';

// Define types for better type safety
export type OrderStatus =
  | 'Pending'
  | 'Allocated'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

/**
 * Custom render function that wraps components with necessary providers
 *
 * @param ui - The component to render
 * @param options - Additional render options
 * @returns The rendered component with testing utilities
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <StoreProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </StoreProvider>
    ),
    ...options,
  });
}

/**
 * Render a component within just the router context (no store)
 *
 * @param ui - The component to render
 * @param options - Additional render options
 * @returns The rendered component with testing utilities
 */
export function renderWithRouter(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    ...options,
  });
}

/**
 * Mock data for products used across tests
 */
export const mockProducts = [
  {
    id: 1,
    sku: 'TEST-SKU-001',
    name: 'Test Product 1',
    category: 'Test Category A',
    description: 'This is test product 1',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-10T15:30:00Z',
  },
  {
    id: 2,
    sku: 'TEST-SKU-002',
    name: 'Test Product 2',
    category: 'Test Category B',
    created_at: '2023-02-15T09:45:00Z',
    updated_at: '2023-02-20T14:20:00Z',
  },
];

/**
 * Mock data for a single product
 */
export const mockSingleProduct = {
  id: 3,
  sku: 'TEST-SKU-003',
  name: 'Test Product 3',
  category: 'Test Category C',
  description: 'This is test product 3',
  created_at: '2023-03-01T12:00:00Z',
  updated_at: '2023-03-10T15:30:00Z',
};

/**
 * Mock data for orders with all required fields
 */
export const mockOrders = [
  {
    id: 1,
    orderNumber: 'ORD-001',
    status: 'Pending' as OrderStatus,
    customerId: 12345,
    items: [{ id: 1, productId: 101, quantity: 2, price: 99.99 }],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    orderDate: '2023-01-01T00:00:00Z',
    totalAmount: 199.99,
  },
  {
    id: 2,
    orderNumber: 'ORD-002',
    status: 'Shipped' as OrderStatus,
    customerId: 67890,
    items: [{ id: 2, productId: 102, quantity: 1, price: 99.99 }],
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z',
    orderDate: '2023-01-02T00:00:00Z',
    totalAmount: 99.99,
  },
];

/**
 * Mock data for a single order with all required fields
 */
export const mockSingleOrder = {
  id: 3,
  orderNumber: 'ORD-003',
  status: 'Delivered' as OrderStatus,
  customerId: 13579,
  items: [{ id: 3, productId: 103, quantity: 3, price: 99.99 }],
  createdAt: '2023-01-04T00:00:00Z',
  updatedAt: '2023-01-05T00:00:00Z',
  orderDate: '2023-01-04T00:00:00Z',
  totalAmount: 299.99,
};

/**
 * Available status values for OrderStatus
 */
export const orderStatusValues: OrderStatus[] = [
  'Pending',
  'Allocated',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

/**
 * Button variants for testing
 */
export const buttonVariants: ButtonVariant[] = [
  'primary',
  'secondary',
  'danger',
];

/**
 * Setup a delayed promise that can be resolved later
 *
 * @returns A tuple with the promise and a resolve function
 */
export function createResolvablePromise<T>(): [Promise<T>, (value: T) => void] {
  let resolveFunction: (value: T) => void = () => {};
  const promise = new Promise<T>((resolve) => {
    resolveFunction = resolve;
  });

  return [promise, resolveFunction];
}
