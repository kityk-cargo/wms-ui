import { useState, useEffect } from 'react';
import { fetchProducts } from '../services/api';
import { Product } from '../types';
import { formatDate } from '../utils/formatters';
import './ProductList.css';

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch products. Please try again later.');
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
    return <div className="error">{error}</div>;
  }

  return (
    <div className="product-list-page">
      <div className="product-list-header">
        <h1>Products</h1>
      </div>

      {products.length === 0 ? (
        <div className="no-products">No products found.</div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-header">
                <h3>{product.name}</h3>
                <span className="product-sku">SKU: {product.sku}</span>
              </div>
              <div className="product-category">{product.category}</div>
              {product.description && (
                <div className="product-description">{product.description}</div>
              )}
              <div className="product-meta">
                <div className="product-date">
                  <span>Created: </span>
                  {formatDate(product.created_at)}
                </div>
                <div className="product-date">
                  <span>Updated: </span>
                  {formatDate(product.updated_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 