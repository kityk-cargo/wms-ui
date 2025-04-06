import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrderStore } from '../stores/StoreContext';
import { formatCurrency, formatDate } from '../utils';
import { LoadingState, ErrorMessage, StatusBadge } from '../components';
import './OrderList.css';

/**
 * OrderList component that displays all orders
 */
export const OrderList = observer(() => {
  const orderStore = useOrderStore();
  
  useEffect(() => {
    // Load orders when component mounts
    orderStore.loadOrders();
    
    // Reset store when component unmounts
    return () => {
      orderStore.reset();
    };
  }, [orderStore]);

  if (orderStore.loading) {
    return <LoadingState message="Loading orders..." />;
  }

  if (orderStore.error) {
    return <ErrorMessage message={orderStore.error} />;
  }

  return (
    <div className="order-list-page">
      <div className="order-list-header">
        <h1>Orders</h1>
        <Link to="/orders/create" className="btn btn-primary">
          Create Order
        </Link>
      </div>

      {orderStore.orders.length === 0 ? (
        <div className="no-orders">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="order-table-container">
          <table className="order-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Reference</th>
                <th>Customer ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orderStore.orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.orderReference || '-'}</td>
                  <td>{order.customerId}</td>
                  <td>{formatDate(order.orderDate)}</td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                  <td>
                    <Link to={`/orders/${order.id}`} className="btn-icon">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});
