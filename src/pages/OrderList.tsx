import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrders } from '../services/api';
import { Order } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { LoadingState, ErrorMessage, StatusBadge } from '../components';
import './OrderList.css';

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchOrders();
        setOrders(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch orders. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, []);

  if (loading) {
    return <LoadingState message="Loading orders..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="order-list-page">
      <div className="order-list-header">
        <h1>Orders</h1>
        <Link to="/orders/create" className="btn btn-primary">
          Create Order
        </Link>
      </div>

      {orders.length === 0 ? (
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
              {orders.map((order) => (
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
}
