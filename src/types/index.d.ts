// Include types from @pact-foundation/pact
/// <reference types="@pact-foundation/pact" />

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
  orderReference?: string;
  customerId: number;
  customer?: any;
  orderDate: string;
  status: "Pending" | "Allocated" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
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
