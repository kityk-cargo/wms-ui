import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OrderDetail } from './OrderDetail';
import { renderWithProviders, mockSingleOrder } from '../test/test-utils';
import { useOrderStore } from '../stores/StoreContext';
import { useParams } from 'react-router-dom';
import { Order } from '../types';
import { ReactNode } from 'react';

// Mock the store and router hooks
vi.mock('../stores/StoreContext', () => ({
  useOrderStore: vi.fn(),
  StoreProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid={`link-to-${to}`}>
      {children}
    </a>
  ),
  MemoryRouter: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe('OrderDetail', () => {
  // Create mock store for testing with appropriate types
  const mockOrderStore = {
    currentOrder: null as Order | null,
    loading: false,
    error: null as string | null,
    loadOrder: vi.fn(),
    reset: vi.fn(),
  };

  // Default params
  const mockParams = { id: '3' };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock store and params
    (useOrderStore as any).mockReturnValue(mockOrderStore);
    (useParams as any).mockReturnValue(mockParams);
  });

  it('should render loading state when loading order', () => {
    // Arrange: Set loading to true
    mockOrderStore.loading = true;

    // Act: Render component
    renderWithProviders(<OrderDetail />);

    // Assert: Check loading message is displayed
    expect(screen.getByText('Loading order details...')).toBeInTheDocument();
  });

  it('should render error message when there is an error', () => {
    // Arrange: Set error message
    mockOrderStore.loading = false;
    mockOrderStore.error = 'Failed to load order';

    // Act: Render component
    renderWithProviders(<OrderDetail />);

    // Assert: Check error message is displayed
    expect(screen.getByText('Failed to load order')).toBeInTheDocument();
  });

  it('should render "Order not found" when order is null', () => {
    // Arrange: Set null order
    mockOrderStore.loading = false;
    mockOrderStore.error = null;
    mockOrderStore.currentOrder = null;

    // Act: Render component
    renderWithProviders(<OrderDetail />);

    // Assert: Check not found message is displayed
    expect(screen.getByText('Order not found')).toBeInTheDocument();
  });

  it('should render order details when order is available', () => {
    // Arrange: Set mock order data
    mockOrderStore.loading = false;
    mockOrderStore.error = null;
    mockOrderStore.currentOrder = {
      ...mockSingleOrder,
      notes: 'Test order notes',
      shippingAddress: '123 Test St',
      shippingCity: 'Test City',
      shippingState: 'TS',
      shippingZipCode: '12345',
      shippingCountry: 'Test Country',
    };

    // Act: Render component
    renderWithProviders(<OrderDetail />);

    // Assert: Check order details are displayed
    expect(
      screen.getByText(`Order #${mockSingleOrder.id}`),
    ).toBeInTheDocument();
    expect(screen.getByText('Back to Orders')).toBeInTheDocument();

    // Check order details section
    expect(screen.getByText('Order Details')).toBeInTheDocument();
    expect(screen.getByText('Status:')).toBeInTheDocument();
    expect(screen.getByText(mockSingleOrder.status)).toBeInTheDocument();
    expect(screen.getByText('Order Date:')).toBeInTheDocument();
    expect(screen.getByText('Customer ID:')).toBeInTheDocument();
    expect(
      screen.getByText(mockSingleOrder.customerId.toString()),
    ).toBeInTheDocument();
    expect(screen.getByText('Total Amount:')).toBeInTheDocument();
    expect(screen.getByText('Notes:')).toBeInTheDocument();
    expect(screen.getByText('Test order notes')).toBeInTheDocument();

    // Check shipping information section
    expect(screen.getByText('Shipping Information')).toBeInTheDocument();
    expect(screen.getByText('Address:')).toBeInTheDocument();
    expect(screen.getByText('123 Test St')).toBeInTheDocument();
    expect(screen.getByText('City:')).toBeInTheDocument();
    expect(screen.getByText('Test City')).toBeInTheDocument();
    expect(screen.getByText('State:')).toBeInTheDocument();
    expect(screen.getByText('TS')).toBeInTheDocument();
    expect(screen.getByText('Zip Code:')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByText('Country:')).toBeInTheDocument();
    expect(screen.getByText('Test Country')).toBeInTheDocument();

    // Check order items section
    expect(screen.getByText('Order Items')).toBeInTheDocument();
    expect(screen.getByText('Product ID')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();

    // Check order items are rendered
    mockSingleOrder.items.forEach((item) => {
      expect(screen.getByText(item.productId.toString())).toBeInTheDocument();
      expect(screen.getByText(item.quantity.toString())).toBeInTheDocument();
    });

    // Check total
    expect(screen.getByText('Total:')).toBeInTheDocument();
  });

  it('should not render shipping section when no shipping address', () => {
    // Arrange: Set mock order data without shipping info
    mockOrderStore.loading = false;
    mockOrderStore.error = null;
    mockOrderStore.currentOrder = {
      ...mockSingleOrder,
      shippingAddress: undefined, // Using undefined to match the Order type's optional field
    };

    // Act: Render component
    renderWithProviders(<OrderDetail />);

    // Assert: Should not find shipping information
    expect(screen.queryByText('Shipping Information')).not.toBeInTheDocument();
  });

  it('should call loadOrder with correct id on component mount', () => {
    // Arrange & Act: Render component
    renderWithProviders(<OrderDetail />);

    // Assert: loadOrder should be called with the ID from params
    expect(mockOrderStore.loadOrder).toHaveBeenCalledTimes(1);
    expect(mockOrderStore.loadOrder).toHaveBeenCalledWith(3);
  });

  it('should call reset when component unmounts', () => {
    // Arrange: Render component
    const { unmount } = renderWithProviders(<OrderDetail />);

    // Act: Unmount component
    unmount();

    // Assert: reset should be called
    expect(mockOrderStore.reset).toHaveBeenCalledTimes(1);
  });
});
