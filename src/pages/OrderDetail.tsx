import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderStore } from '../stores/StoreContext';
import { formatCurrency, formatDateLong } from '../utils/formatters';
import { LoadingState, ErrorMessage, StatusBadge } from '../components';
import './OrderDetail.css';

/**
 * OrderDetail component that displays a single order's details
 */
export const OrderDetail = observer(() => {
  const { id } = useParams<{ id: string }>();
  const orderStore = useOrderStore();

  useEffect(() => {
    // Load order when component mounts or id changes
    if (id) {
      orderStore.loadOrder(Number(id));
    }

    // Reset store when component unmounts
    return () => {
      orderStore.reset();
    };
  }, [id, orderStore]);

  if (orderStore.loading) {
    return <LoadingState message="Loading order details..." />;
  }

  if (orderStore.error) {
    return <ErrorMessage message={orderStore.error} />;
  }

  if (!orderStore.currentOrder) {
    return <ErrorMessage message="Order not found" />;
  }

  const order = orderStore.currentOrder;

  return (
    <div className="order-detail-page">
      <div className="order-detail-header">
        <div>
          <h1>Order #{order.id}</h1>
          {order.orderReference && (
            <p className="order-reference">Reference: {order.orderReference}</p>
          )}
        </div>
        <div className="order-actions">
          <Link to="/orders" className="btn btn-secondary">
            Back to Orders
          </Link>
        </div>
      </div>

      <div className="order-detail-grid">
        <div className="order-detail-card">
          <h2>Order Details</h2>
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <StatusBadge status={order.status} />
          </div>
          <div className="detail-row">
            <span className="detail-label">Order Date:</span>
            <span>{formatDateLong(order.orderDate)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Customer ID:</span>
            <span>{order.customerId}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Total Amount:</span>
            <span className="total-amount">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
          {order.notes && (
            <div className="detail-row">
              <span className="detail-label">Notes:</span>
              <span>{order.notes}</span>
            </div>
          )}
        </div>

        {order.shippingAddress && (
          <div className="order-detail-card">
            <h2>Shipping Information</h2>
            <div className="detail-row">
              <span className="detail-label">Address:</span>
              <span>{order.shippingAddress}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">City:</span>
              <span>{order.shippingCity}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">State:</span>
              <span>{order.shippingState}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Zip Code:</span>
              <span>{order.shippingZipCode}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Country:</span>
              <span>{order.shippingCountry}</span>
            </div>
          </div>
        )}
      </div>

      <div className="order-items-section">
        <h2>Order Items</h2>
        <div className="order-items-table-container">
          <table className="order-items-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.productId}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.price)}</td>
                  <td>{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="total-label">
                  Total:
                </td>
                <td className="total-value">
                  {formatCurrency(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
});
