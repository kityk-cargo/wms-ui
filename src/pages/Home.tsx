import { Link } from 'react-router-dom';
import './Home.css';

export function Home() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to the Warehouse Management System</h1>
        <p>
          Manage your inventory, orders, and warehouse operations efficiently
        </p>
        <div className="action-buttons">
          <Link to="/orders/create" className="btn btn-primary">
            Create Order
          </Link>
          <Link to="/orders" className="btn btn-secondary">
            View Orders
          </Link>
        </div>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <h3>Order Management</h3>
          <p>Create, track, and manage customer orders with ease</p>
        </div>
        <div className="feature-card">
          <h3>Inventory Control</h3>
          <p>Keep track of your products and stock levels</p>
        </div>
        <div className="feature-card">
          <h3>Warehouse Operations</h3>
          <p>Optimize picking, packing, and shipping processes</p>
        </div>
      </div>
    </div>
  );
}
