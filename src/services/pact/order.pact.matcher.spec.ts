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
import {
  fetchOrders,
  fetchOrder,
  createOrder,
  updateOrder,
  deleteOrder,
} from '../api';
import { OrderCreate } from '../../types';
import * as path from 'path';

// Must be before any constants declarations due to hoisting
vi.mock('../../config', () => ({
  config: {
    apiUrl: 'http://localhost:8899',
  },
}));

const PACT_PORT = 8899;
// Get the absolute path to the project root
const PROJECT_ROOT = path.resolve(process.cwd());

// Define order item schema with matchers for more flexible contract
const orderItemSchema = {
  id: Matchers.integer(1),
  productId: Matchers.integer(1),
  quantity: Matchers.integer(1),
  price: Matchers.decimal(19.99),
};

// Define order schema with matchers for more flexible contract
const orderSchema = {
  id: Matchers.integer(1),
  customerId: Matchers.integer(1),
  orderDate: Matchers.iso8601DateTime(),
  status: Matchers.term({
    generate: 'Pending',
    matcher: 'Pending|Allocated|Processing|Shipped|Delivered|Cancelled',
  }),
  totalAmount: Matchers.decimal(99.99),
  items: Matchers.eachLike(orderItemSchema),
  createdAt: Matchers.iso8601DateTime(),
  updatedAt: Matchers.iso8601DateTime(),
};

describe('Orders API Pact with Matchers', () => {
  const provider = new Pact({
    consumer: 'wms_ui',
    provider: 'wms_order_management',
    port: PACT_PORT,
    log: path.join(PROJECT_ROOT, 'logs', 'order-pact-matcher.log'),
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

  describe('get all orders with matchers', () => {
    it('returns all orders', async () => {
      // Arrange - Setup the expected interaction with matchers
      await provider.addInteraction({
        state: 'orders exist',
        uponReceiving: 'a request for all orders with matchers',
        withRequest: {
          method: 'GET',
          path: '/api/v1/orders',
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: Matchers.eachLike(orderSchema, { min: 2 }),
        },
      });

      // Act - Make the request
      const orders = await fetchOrders();

      // Assert - Verify the response contains orders
      expect(orders).toBeDefined();
      expect(Array.isArray(orders)).toBe(true);
      expect(orders.length).toBeGreaterThanOrEqual(2);

      // Verify order structure
      expect(orders[0]).toHaveProperty('id');
      expect(typeof orders[0].id).toBe('number');
      expect(Number.isInteger(orders[0].id)).toBe(true);
      expect(orders[0]).toHaveProperty('customerId');
      expect(orders[0]).toHaveProperty('status');
      expect(orders[0]).toHaveProperty('totalAmount');
      expect(orders[0]).toHaveProperty('items');
      expect(Array.isArray(orders[0].items)).toBe(true);
    });
  });

  describe('get order by id with matchers', () => {
    it('returns a specific order', async () => {
      const orderId = 1;

      // Arrange - Setup the expected interaction with matchers
      await provider.addInteraction({
        state: `order with ID ${orderId} exists`,
        uponReceiving: `a request for order with ID ${orderId}`,
        withRequest: {
          method: 'GET',
          path: `/api/v1/orders/${orderId}`,
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: orderSchema,
        },
      });

      // Act - Make the request
      const order = await fetchOrder(orderId);

      // Assert - Verify the response contains the order
      expect(order).toBeDefined();
      expect(order.id).toBe(orderId);
      expect(order).toHaveProperty('customerId');
      expect(order).toHaveProperty('status');
      expect(order).toHaveProperty('totalAmount');
      expect(order).toHaveProperty('items');
      expect(Array.isArray(order.items)).toBe(true);
    });
  });

  describe('create order with matchers', () => {
    it('creates a new order', async () => {
      // Define the order creation payload
      const orderData: OrderCreate = {
        customerId: 1,
        items: [
          {
            productId: 1,
            quantity: 2,
          },
          {
            productId: 2,
            quantity: 1,
          },
        ],
      };

      // Arrange - Setup the expected interaction with matchers
      await provider.addInteraction({
        state: 'can create a new order',
        uponReceiving: 'a request to create a new order',
        withRequest: {
          method: 'POST',
          path: '/api/v1/orders',
          headers: {
            'Content-Type': 'application/json',
          },
          body: orderData,
        },
        willRespondWith: {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: orderSchema,
        },
      });

      // Act - Make the request
      const createdOrder = await createOrder(orderData);

      // Assert - Verify the response contains the created order
      expect(createdOrder).toBeDefined();
      expect(createdOrder).toHaveProperty('id');
      expect(typeof createdOrder.id).toBe('number');
      expect(Number.isInteger(createdOrder.id)).toBe(true);
      expect(createdOrder.customerId).toBe(orderData.customerId);
      expect(createdOrder).toHaveProperty('status');
      expect(createdOrder).toHaveProperty('items');
      expect(Array.isArray(createdOrder.items)).toBe(true);
    });
  });

  describe('update order with matchers', () => {
    it('updates an existing order', async () => {
      const orderId = 1;
      // Order data for update - only status field in this example
      const orderUpdateData = {
        id: orderId,
        customerId: 1,
        status: 'Processing' as
          | 'Pending'
          | 'Allocated'
          | 'Processing'
          | 'Shipped'
          | 'Delivered'
          | 'Cancelled',
        orderDate: '2023-04-01T10:00:00Z',
        totalAmount: 149.99,
        items: [
          {
            id: 1,
            productId: 1,
            quantity: 3,
            price: 49.99,
          },
        ],
        createdAt: '2023-04-01T10:00:00Z',
        updatedAt: '2023-04-02T10:00:00Z',
      };

      // Arrange - Setup the expected interaction with matchers
      await provider.addInteraction({
        state: `order with ID ${orderId} exists`,
        uponReceiving: `a request to update order with ID ${orderId}`,
        withRequest: {
          method: 'PUT',
          path: `/api/v1/orders/${orderId}`,
          headers: {
            'Content-Type': 'application/json',
          },
          body: orderUpdateData,
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            ...orderSchema,
            status: Matchers.term({
              generate: 'Processing',
              matcher:
                'Pending|Allocated|Processing|Shipped|Delivered|Cancelled',
            }),
          },
        },
      });

      // Act - Make the request
      const updatedOrder = await updateOrder(orderId, orderUpdateData);

      // Assert - Verify the response contains the updated order
      expect(updatedOrder).toBeDefined();
      expect(updatedOrder.id).toBe(orderId);
      expect(updatedOrder.status).toBe('Processing');
    });
  });

  describe('delete order with matchers', () => {
    it('deletes an existing order', async () => {
      const orderId = 1;

      // Arrange - Setup the expected interaction with matchers
      await provider.addInteraction({
        state: `order with ID ${orderId} exists`,
        uponReceiving: `a request to delete order with ID ${orderId}`,
        withRequest: {
          method: 'DELETE',
          path: `/api/v1/orders/${orderId}`,
        },
        willRespondWith: {
          status: 204,
        },
      });

      // Act - Make the request
      await deleteOrder(orderId);

      // Assert - If we got here without an error, the test passed
      // deleteOrder doesn't return any data to assert against
      expect(true).toBe(true);
    });
  });
});
