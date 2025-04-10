import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OrderList } from './OrderList';
import { renderWithProviders, mockOrders } from '../test/test-utils';
import { useOrderStore } from '../stores/StoreContext';
import { ReactNode } from 'react';

// Mock the store
vi.mock('../stores/StoreContext', () => ({
  useOrderStore: vi.fn(),
  StoreProvider: ({ children }: { children: ReactNode }) => children
}));

describe('OrderList', () => {
  // Create mock store for testing with proper typing
  const mockOrderStore = {
    orders: [] as typeof mockOrders,
    loading: false,
    error: null as string | null,
    loadOrders: vi.fn(),
    reset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock store
    (useOrderStore as any).mockReturnValue(mockOrderStore);
  });

  it('should render loading state when loading orders', () => {
    // Arrange: Set loading to true
    mockOrderStore.loading = true;
    
    // Act: Render component
    renderWithProviders(<OrderList />);
    
    // Assert: Check loading message is displayed
    expect(screen.getByText('Loading orders...')).toBeInTheDocument();
  });

  it('should render error message when there is an error', () => {
    // Arrange: Set error message
    mockOrderStore.loading = false;
    mockOrderStore.error = 'Failed to load orders';
    
    // Act: Render component
    renderWithProviders(<OrderList />);
    
    // Assert: Check error message is displayed
    expect(screen.getByText('Failed to load orders')).toBeInTheDocument();
  });

  it('should render "No orders found" when orders array is empty', () => {
    // Arrange: Set empty orders array
    mockOrderStore.loading = false;
    mockOrderStore.error = null;
    mockOrderStore.orders = [];
    
    // Act: Render component
    renderWithProviders(<OrderList />);
    
    // Assert: Check no orders message is displayed
    expect(screen.getByText('No orders found.')).toBeInTheDocument();
  });

  it('should render orders table with data when orders are available', () => {
    // Arrange: Set mock orders data
    mockOrderStore.loading = false;
    mockOrderStore.error = null;
    mockOrderStore.orders = mockOrders;
    
    // Act: Render component
    renderWithProviders(<OrderList />);
    
    // Assert: Check table and order data is displayed
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Create Order')).toBeInTheDocument();
    
    // Check table headers
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Reference')).toBeInTheDocument();
    expect(screen.getByText('Customer ID')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    
    // Check order data is rendered
    mockOrders.forEach(order => {
      expect(screen.getByText(order.id.toString())).toBeInTheDocument();
      expect(screen.getByText(order.customerId.toString())).toBeInTheDocument();
      // Check status badge is rendered (assuming test-utils includes the needed test IDs)
      expect(screen.getByText(order.status)).toBeInTheDocument();
    });
    
    // Check all View links are rendered
    const viewLinks = screen.getAllByText('View');
    expect(viewLinks).toHaveLength(mockOrders.length);
  });

  it('should call loadOrders on component mount', () => {
    // Arrange & Act: Render component
    renderWithProviders(<OrderList />);
    
    // Assert: loadOrders should be called
    expect(mockOrderStore.loadOrders).toHaveBeenCalledTimes(1);
  });

  it('should call reset when component unmounts', async () => {
    // Arrange: Render component
    const { unmount } = renderWithProviders(<OrderList />);
    
    // Act: Unmount component
    unmount();
    
    // Assert: reset should be called
    expect(mockOrderStore.reset).toHaveBeenCalledTimes(1);
  });
}); 