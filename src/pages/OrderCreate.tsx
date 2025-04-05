import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, createOrder } from '../services/api';
import { Product, OrderItemCreate, OrderCreate as OrderCreateType } from '../types';
import './OrderCreate.css';

// Step enum to track the current step in the order creation flow
enum OrderCreationStep {
  ProductSelection,
  OrderReview,
  OrderConfirmation,
}

export function OrderCreate() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OrderCreationStep>(
    OrderCreationStep.ProductSelection
  );
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Order data state
  const [selectedProducts, setSelectedProducts] = useState<Map<number, OrderItemCreate>>(
    new Map()
  );
  const [customerId, setCustomerId] = useState<number>(1); // Default customer ID
  const [submitting, setSubmitting] = useState(false);
  const [orderResponse, setOrderResponse] = useState<any>(null);

  // Load products on component mount
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

  // Handle adding a product to the order
  const handleAddProduct = (product: Product, quantity: number) => {
    if (quantity <= 0) return;
    
    setSelectedProducts((prevSelected) => {
      const newSelected = new Map(prevSelected);
      newSelected.set(product.id, {
        productId: product.id,
        quantity,
      });
      return newSelected;
    });
  };

  // Handle removing a product from the order
  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts((prevSelected) => {
      const newSelected = new Map(prevSelected);
      newSelected.delete(productId);
      return newSelected;
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Handle submitting the order
  const handleSubmitOrder = async () => {
    try {
      setSubmitting(true);
      
      // Convert selectedProducts Map to array for API
      const items = Array.from(selectedProducts.values());
      
      // Check if there are any items
      if (items.length === 0) {
        setError('Your order must contain at least one product.');
        setSubmitting(false);
        return;
      }
      
      const orderData: OrderCreateType = {
        customerId,
        items,
      };
      
      // Call API to create order
      const response = await createOrder(orderData);
      setOrderResponse(response);
      
      // Move to confirmation step
      setCurrentStep(OrderCreationStep.OrderConfirmation);
      setError(null);
    } catch (err) {
      setError('Failed to create order. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Render product selection step
  const renderProductSelection = () => {
    if (loading) {
      return <div className="loading">Loading products...</div>;
    }

    if (error) {
      return <div className="error">{error}</div>;
    }

    if (products.length === 0) {
      return <div className="no-products">No products available.</div>;
    }

    return (
      <div className="product-selection">
        <h2>Select Products for Your Order</h2>
        
        <div className="selected-count">
          {selectedProducts.size > 0 ? (
            <div>
              <span>{selectedProducts.size} product(s) selected</span>
              <button 
                className="btn btn-primary proceed-btn"
                onClick={() => setCurrentStep(OrderCreationStep.OrderReview)}
              >
                Review Order
              </button>
            </div>
          ) : (
            <span>No products selected yet</span>
          )}
        </div>
        
        <div className="product-grid">
          {products.map((product) => {
            const selectedItem = selectedProducts.get(product.id);
            const isSelected = !!selectedItem;
            const quantity = selectedItem?.quantity || 0;
            
            return (
              <div 
                key={product.id} 
                className={`product-card ${isSelected ? 'selected' : ''}`}
              >
                <div className="product-header">
                  <h3>{product.name}</h3>
                  <span className="product-sku">SKU: {product.sku}</span>
                </div>
                <div className="product-category">{product.category}</div>
                {product.description && (
                  <div className="product-description">{product.description}</div>
                )}
                
                <div className="product-controls">
                  <div className="quantity-control">
                    <label htmlFor={`qty-${product.id}`}>Quantity:</label>
                    <input 
                      id={`qty-${product.id}`}
                      type="number" 
                      min="1"
                      value={quantity || 1}
                      onChange={(e) => {
                        const newQty = parseInt(e.target.value, 10) || 1;
                        if (newQty > 0) {
                          handleAddProduct(product, newQty);
                        }
                      }}
                    />
                  </div>
                  
                  {isSelected ? (
                    <div className="action-buttons">
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleAddProduct(product, quantity)}
                      >
                        Update
                      </button>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleRemoveProduct(product.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleAddProduct(product, 1)}
                    >
                      Add to Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render order review step
  const renderOrderReview = () => {
    if (selectedProducts.size === 0) {
      return (
        <div className="empty-order">
          <p>Your order is empty. Please add some products.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setCurrentStep(OrderCreationStep.ProductSelection)}
          >
            Back to Products
          </button>
        </div>
      );
    }

    // Calculate total
    let totalAmount = 0;
    
    return (
      <div className="order-review">
        <h2>Review Your Order</h2>
        
        <div className="order-metadata">
          <div className="metadata-field">
            <label htmlFor="customer-id">Customer ID:</label>
            <input 
              id="customer-id"
              type="number" 
              min="1"
              value={customerId}
              onChange={(e) => setCustomerId(parseInt(e.target.value, 10) || 1)}
            />
          </div>
          
          {/* Additional metadata fields could be added here */}
        </div>
        
        <div className="order-items">
          <h3>Order Items</h3>
          <div className="order-items-table-container">
            <table className="order-items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(selectedProducts.entries()).map(([productId, item]) => {
                  const product = products.find(p => p.id === productId);
                  if (!product) return null;
                  
                  return (
                    <tr key={productId}>
                      <td>
                        <div className="product-info">
                          <span className="product-name">{product.name}</span>
                          <span className="product-sku">SKU: {product.sku}</span>
                        </div>
                      </td>
                      <td>
                        <div className="quantity-control inline">
                          <input 
                            type="number" 
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value, 10) || 1;
                              if (newQty > 0) {
                                handleAddProduct(product, newQty);
                              }
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <button 
                          className="btn-icon danger"
                          onClick={() => handleRemoveProduct(productId)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="order-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setCurrentStep(OrderCreationStep.ProductSelection)}
          >
            Back to Products
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSubmitOrder}
            disabled={submitting}
          >
            {submitting ? 'Saving Order...' : 'Save Order'}
          </button>
        </div>
        
        {error && <div className="error">{error}</div>}
      </div>
    );
  };

  // Render order confirmation step
  const renderOrderConfirmation = () => {
    if (!orderResponse) {
      return <div className="error">No order information available.</div>;
    }

    return (
      <div className="order-confirmation">
        <div className="confirmation-icon">✓</div>
        <h2>Order Created Successfully!</h2>
        <p>Your order has been saved with the following details:</p>
        
        <div className="confirmation-details">
          <div className="detail-row">
            <span className="detail-label">Order ID:</span>
            <span>{orderResponse.id}</span>
          </div>
          {orderResponse.orderReference && (
            <div className="detail-row">
              <span className="detail-label">Reference:</span>
              <span>{orderResponse.orderReference}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className={`status-badge status-${orderResponse.status.toLowerCase()}`}>
              {orderResponse.status}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Total Amount:</span>
            <span className="total-amount">{formatCurrency(orderResponse.totalAmount)}</span>
          </div>
        </div>
        
        <div className="confirmation-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/orders')}
          >
            View All Orders
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/orders/${orderResponse.id}`)}
          >
            View Order Details
          </button>
        </div>
      </div>
    );
  };

  // Render the current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case OrderCreationStep.ProductSelection:
        return renderProductSelection();
      case OrderCreationStep.OrderReview:
        return renderOrderReview();
      case OrderCreationStep.OrderConfirmation:
        return renderOrderConfirmation();
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="order-create-page">
      <div className="order-create-header">
        <h1>Create New Order</h1>
      </div>
      
      <div className="order-steps">
        <div 
          className={`step ${currentStep === OrderCreationStep.ProductSelection ? 'active' : ''} 
                     ${currentStep > OrderCreationStep.ProductSelection ? 'completed' : ''}`}
          onClick={() => {
            if (currentStep > OrderCreationStep.ProductSelection) {
              setCurrentStep(OrderCreationStep.ProductSelection);
            }
          }}
        >
          <div className="step-number">1</div>
          <div className="step-label">Product Selection</div>
        </div>
        <div className="step-connector"></div>
        <div 
          className={`step ${currentStep === OrderCreationStep.OrderReview ? 'active' : ''} 
                     ${currentStep > OrderCreationStep.OrderReview ? 'completed' : ''}`}
          onClick={() => {
            if (currentStep > OrderCreationStep.OrderReview) {
              setCurrentStep(OrderCreationStep.OrderReview);
            } else if (selectedProducts.size > 0 && currentStep === OrderCreationStep.ProductSelection) {
              setCurrentStep(OrderCreationStep.OrderReview);
            }
          }}
        >
          <div className="step-number">2</div>
          <div className="step-label">Review Order</div>
        </div>
        <div className="step-connector"></div>
        <div 
          className={`step ${currentStep === OrderCreationStep.OrderConfirmation ? 'active' : ''}`}
        >
          <div className="step-number">3</div>
          <div className="step-label">Order Confirmation</div>
        </div>
      </div>
      
      <div className="order-create-content">
        {renderCurrentStep()}
      </div>
    </div>
  );
} 