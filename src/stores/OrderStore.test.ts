import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OrderStore } from './OrderStore';
import { RootStore } from './RootStore';
import * as apiService from '../services/api';
import {
  mockOrders,
  mockSingleOrder,
  createResolvablePromise,
  OrderStatus,
} from '../test/test-utils';

/**
 * Tests for the OrderStore
 *
 * These tests verify that the OrderStore correctly:
 * - Manages order data and state
 * - Handles API operations (load, create, update, delete)
 * - Manages loading and error states
 */
describe('OrderStore', () => {
  // Setup variables
  let rootStore: RootStore;
  let orderStore: OrderStore;

  // Setup before each test
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Create new instances for each test
    rootStore = new RootStore();
    orderStore = new OrderStore(rootStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test initial state of the OrderStore
   */
  it('should initialize with default values', () => {
    // Assert
    expect(orderStore.orders).toEqual([]);
    expect(orderStore.currentOrder).toBeNull();
    expect(orderStore.loading).toBe(false);
    expect(orderStore.error).toBeNull();
  });

  /**
   * Test order loading operations
   */
  describe('order loading operations', () => {
    it('should load all orders successfully', async () => {
      // Arrange
      vi.spyOn(apiService, 'fetchOrders').mockResolvedValue(mockOrders);

      // Act
      await orderStore.loadOrders();

      // Assert
      expect(orderStore.orders).toEqual(mockOrders);
      expect(orderStore.loading).toBe(false);
      expect(orderStore.error).toBeNull();
    });

    it('should handle errors when loading orders fails', async () => {
      // Arrange
      vi.spyOn(apiService, 'fetchOrders').mockRejectedValue(
        new Error('Network error'),
      );

      // Act
      await orderStore.loadOrders();

      // Assert
      expect(orderStore.orders).toEqual([]);
      expect(orderStore.loading).toBe(false);
      expect(orderStore.error).toBe(
        'Failed to fetch orders. Please try again later.',
      );
    });

    it('should load a single order by ID', async () => {
      // Arrange
      const orderId = 3;
      vi.spyOn(apiService, 'fetchOrder').mockResolvedValue(mockSingleOrder);

      // Act
      await orderStore.loadOrder(orderId);

      // Assert
      expect(apiService.fetchOrder).toHaveBeenCalledWith(orderId);
      expect(orderStore.currentOrder).toEqual(mockSingleOrder);
      expect(orderStore.loading).toBe(false);
      expect(orderStore.error).toBeNull();
    });

    it('should handle errors when loading a single order fails', async () => {
      // Arrange
      const orderId = 3;
      vi.spyOn(apiService, 'fetchOrder').mockRejectedValue(
        new Error('Network error'),
      );

      // Act
      await orderStore.loadOrder(orderId);

      // Assert
      expect(orderStore.currentOrder).toBeNull();
      expect(orderStore.loading).toBe(false);
      expect(orderStore.error).toBe(
        `Failed to fetch order with ID ${orderId}. Please try again later.`,
      );
    });
  });

  /**
   * Test order creation, update, and deletion
   */
  describe('order modification operations', () => {
    it('should create a new order successfully', async () => {
      // Arrange
      vi.spyOn(apiService, 'createOrder').mockResolvedValue(mockSingleOrder);
      const newOrderData = {
        customerId: 13579,
        items: [{ productId: 103, quantity: 3 }],
      };

      // Act
      const result = await orderStore.createNewOrder(newOrderData);

      // Assert
      expect(result).toEqual(mockSingleOrder);
      expect(orderStore.currentOrder).toEqual(mockSingleOrder);
      expect(orderStore.orders).toContainEqual(mockSingleOrder);
    });

    it('should handle errors when creating an order fails', async () => {
      // Arrange
      vi.spyOn(apiService, 'createOrder').mockRejectedValue(
        new Error('Network error'),
      );
      const newOrderData = {
        customerId: 13579,
        items: [{ productId: 103, quantity: 3 }],
      };

      // Act
      const result = await orderStore.createNewOrder(newOrderData);

      // Assert
      expect(result).toBeNull();
      expect(orderStore.error).toBe(
        'Failed to create order. Please try again later.',
      );
    });

    it('should update an existing order successfully', async () => {
      // Arrange
      const orderId = 3;
      const updatedOrder = {
        ...mockSingleOrder,
        status: 'Processing' as OrderStatus,
      };

      vi.spyOn(apiService, 'updateOrder').mockResolvedValue(updatedOrder);
      vi.spyOn(apiService, 'fetchOrders').mockResolvedValue(mockOrders);
      await orderStore.loadOrders();

      // Act
      const result = await orderStore.updateExistingOrder(
        orderId,
        mockSingleOrder,
      );

      // Assert
      expect(result).toEqual(updatedOrder);
      expect(orderStore.loading).toBe(false);
      expect(orderStore.error).toBeNull();
    });

    it('should handle errors when updating an order fails', async () => {
      // Arrange
      const orderId = 3;
      vi.spyOn(apiService, 'updateOrder').mockRejectedValue(
        new Error('Network error'),
      );

      // Act
      const result = await orderStore.updateExistingOrder(
        orderId,
        mockSingleOrder,
      );

      // Assert
      expect(result).toBeNull();
      expect(orderStore.error).toBe(
        `Failed to update order with ID ${orderId}. Please try again later.`,
      );
    });

    it('should delete an order successfully', async () => {
      // Arrange
      const orderId = 1;
      vi.spyOn(apiService, 'deleteOrder').mockResolvedValue(undefined);
      vi.spyOn(apiService, 'fetchOrders').mockResolvedValue(mockOrders);

      // First load orders to populate the orders array
      await orderStore.loadOrders();
      orderStore.currentOrder = mockOrders[0];

      // Act
      const result = await orderStore.deleteExistingOrder(orderId);

      // Assert
      expect(result).toBe(true);
      expect(orderStore.orders).not.toContainEqual(mockOrders[0]);
      expect(orderStore.currentOrder).toBeNull();
    });

    it('should handle errors when deleting an order fails', async () => {
      // Arrange
      const orderId = 1;
      vi.spyOn(apiService, 'deleteOrder').mockRejectedValue(
        new Error('Network error'),
      );

      // Act
      const result = await orderStore.deleteExistingOrder(orderId);

      // Assert
      expect(result).toBe(false);
      expect(orderStore.error).toBe(
        `Failed to delete order with ID ${orderId}. Please try again later.`,
      );
    });
  });

  /**
   * Test store management functions
   */
  describe('store management functions', () => {
    it('should set error state correctly', () => {
      // Arrange
      const errorMessage = 'Test error message';

      // Act
      orderStore.setError(errorMessage);

      // Assert
      expect(orderStore.error).toBe(errorMessage);

      // Act again - clear error
      orderStore.setError(null);

      // Assert again
      expect(orderStore.error).toBeNull();
    });

    it('should reset the store to its initial state', async () => {
      // Arrange - populate the store
      vi.spyOn(apiService, 'fetchOrders').mockResolvedValue(mockOrders);
      vi.spyOn(apiService, 'fetchOrder').mockResolvedValue(mockSingleOrder);

      await orderStore.loadOrders();
      await orderStore.loadOrder(3);
      orderStore.setError('Some error');

      // Verify store has data
      expect(orderStore.orders).toHaveLength(2);
      expect(orderStore.currentOrder).not.toBeNull();
      expect(orderStore.error).not.toBeNull();

      // Act
      orderStore.reset();

      // Assert
      expect(orderStore.orders).toEqual([]);
      expect(orderStore.currentOrder).toBeNull();
      expect(orderStore.loading).toBe(false);
      expect(orderStore.error).toBeNull();
    });

    it('should manage loading state during API calls', async () => {
      // Arrange
      const [promise, resolve] = createResolvablePromise<typeof mockOrders>();
      vi.spyOn(apiService, 'fetchOrders').mockReturnValueOnce(promise);

      // Act - Start the API call but don't await it yet
      const loadPromise = orderStore.loadOrders();

      // Assert - loading state should be true during call
      expect(orderStore.loading).toBe(true);

      // Resolve the API call
      resolve(mockOrders);

      // Wait for the loadOrders promise to complete
      await loadPromise;

      // Assert - loading state should be false after completion
      expect(orderStore.loading).toBe(false);
      expect(orderStore.orders).toEqual(mockOrders);
    });
  });
});
