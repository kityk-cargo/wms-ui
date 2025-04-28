// Include types from @pact-foundation/pact
/// <reference types="@pact-foundation/pact" />

// Common Error Format
export interface CommonErrorType {
  criticality: 'critical' | 'non-critical' | 'unknown';
  id: string;
  title?: string;
  detail: string;
  recoverySuggestion?: string;
  criticalityExplanation?: string;
  errorCode?: string;
  suggestedHTTPCode?: number;
  recoveryData?: Record<string, unknown>;
  otherErrors?: CommonErrorType[];
}

// Product interfaces
export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Order interfaces
export interface OrderItemCreate {
  productId: number;
  quantity: number;
}

export interface OrderItem extends OrderItemCreate {
  id: number;
  price: number;
}

export interface OrderCreate {
  customerId: number;
  items: OrderItemCreate[];
}

export interface Order {
  id: number;
  customerId: number;
  customer?: {
    id: number;
    name?: string;
    email?: string;
    [key: string]: unknown;
  };
  orderDate: string;
  status:
    | 'Pending'
    | 'Allocated'
    | 'Processing'
    | 'Shipped'
    | 'Delivered'
    | 'Cancelled';
  totalAmount: number;
  items: OrderItem[];
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZipCode?: string;
  shippingCountry?: string;
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
