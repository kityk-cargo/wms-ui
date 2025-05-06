import { useState, useEffect } from 'react';
import { fetchProducts, Product, ApiError } from '../services/api';
import { ErrorMessage } from '../components/ErrorMessage';
import './ProductList.css';

// Simple product card component
function ProductCard({ product }: { product: Product }) {
  // Format date to match the screenshot (MM/DD/YYYY, HH:MM:SS AM/PM)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      }) +
      ', ' +
      date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    );
  };

  return (
    <div className="product-card">
      <div className="product-header">
        <h3 className="product-name">{product.name}</h3>
        <span className="product-sku">SKU: {product.sku}</span>
      </div>
      <div className="product-category">{product.category}</div>
      {product.description && (
        <div className="product-description">{product.description}</div>
      )}
      <div className="product-dates">
        <div className="date-item">
          <span className="date-label">Created:</span>
          <span className="date-value">{formatDate(product.created_at)}</span>
        </div>
        <div className="date-item">
          <span className="date-label">Updated:</span>
          <span className="date-value">{formatDate(product.updated_at)}</span>
        </div>
      </div>
    </div>
  );
}

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err
            : new ApiError('Failed to fetch products', 500, {
                criticality: 'critical',
                id: '', // NEVER generate IDs in UI - leave empty for client errors
                detail: 'Failed to fetch products. Please try again later.',
              }),
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return (
      <ErrorMessage
        message={
          error.errorData || {
            criticality: 'critical',
            id: '', // NEVER generate IDs in UI - leave empty for client errors
            detail: error.message,
          }
        }
      />
    );
  }

  return (
    <div className="product-list">
      <h2>Products</h2>
      {products.length === 0 ? (
        <div className="no-products">No products found</div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
