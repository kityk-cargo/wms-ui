import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components';
import './MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="main-layout">
      <header className="app-header">
        <div className="logo">
          <h1>WMS</h1>
        </div>
        <nav className="main-nav">
          <ul>
            <li>
              <Link to="/ui">Home</Link>
            </li>
            <li>
              <Link to="/ui/orders">Orders</Link>
            </li>
            <li>
              <Link to="/ui/products">Products</Link>
            </li>
          </ul>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
        </div>
      </header>
      <main className="app-content">{children}</main>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Warehouse Management System</p>
      </footer>
    </div>
  );
}
