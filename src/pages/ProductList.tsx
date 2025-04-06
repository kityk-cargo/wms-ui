import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useProductStore } from '../stores/StoreContext';
import { formatDate } from '../utils/formatters';
import { LoadingState, ErrorMessage } from '../components';
import './ProductList.css';

/**
 * ProductList component that displays all products
 */
export const ProductList = observer(() => {
  const productStore = useProductStore();
  
  useEffect(() => {
    // Load products when component mounts
    productStore.loadProducts();
    
    // Reset store when component unmounts
    return () => {
      productStore.reset();
    };
  }, [productStore]);

  if (productStore.loading) {
    return <LoadingState message="Loading products..." />;
  }

  if (productStore.error) {
    return <ErrorMessage message={productStore.error} />;
  }

  return (
    <div className="product-list-page">
      <div className="product-list-header">
        <h1>Products</h1>
      </div>

      {productStore.products.length === 0 ? (
        <div className="no-products">No products found.</div>
      ) : (
        <div className="product-grid">
          {productStore.products.map((product) => (
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
});
