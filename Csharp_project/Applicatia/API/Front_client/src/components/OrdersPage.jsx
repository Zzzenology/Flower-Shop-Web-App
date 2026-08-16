import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrdersPage.css';

const BASE_URL = "http://localhost:5000";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/order/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const ordersData = await response.json();
        setOrders(ordersData);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Error fetching orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = async (productId) => {
    try {
      const response = await fetch(`${BASE_URL}/product/all`);
      if (response.ok) {
        const products = await response.json();
        const product = products.find(p => p.id === productId || p._id === productId);
        
        if (product) {
          // Conversie
          const transformedProduct = {
            id: product.id || product._id,
            nume: product.nume || product.name,
            pret: product.pret || product.price,
            descriere: product.descriere || product.description,
            imagine: product.imagine ? `${BASE_URL}${product.imagine}` : product.pozaURL ? `${BASE_URL}${product.pozaURL}` : ''
          };
          
          navigate('/product', { state: { product: transformedProduct } });
        } else {
          console.error('Product not found');
        }
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading">Loading your orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1>My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>You haven't placed any orders yet.</p>
            <a href="/catalog" className="browse-products-btn">Browse Products</a>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-id">Order #{order.id?.substring(0, 8)}</div>
                  <div className={`order-status ${getStatusClass(order.orderStatus)}`}>
                    {order.orderStatus}
                  </div>
                </div>
                
                <div className="order-details">
                  <div className="order-date">
                    <strong>Date:</strong> {formatDate(order.createdAt)}
                  </div>
                  <div className="order-total">
                    <strong>Total:</strong> ${order.totalAmount?.toFixed(2)}
                  </div>
                </div>

                <div className="delivery-address">
                  <strong>Delivery Address:</strong>
                  <p>
                    {order.deliveryAddress?.fullName}<br />
                    {order.deliveryAddress?.street}<br />
                    {order.deliveryAddress?.city}, {order.deliveryAddress?.postalCode}<br />
                    {order.deliveryAddress?.country}
                  </p>
                  {order.deliveryAddress?.phoneNumber && (
                    <p><strong>Phone:</strong> {order.deliveryAddress.phoneNumber}</p>
                  )}
                </div>

                <div className="order-items">
                  <strong>Items:</strong>
                  <div className="items-list">
                    {order.products?.map((item, index) => (
                      <div key={index} className="order-item">
                        <span 
                          className="item-name clickable-item-name" 
                          onClick={() => handleProductClick(item.productId || item.ProductId)}
                        >
                          {item.productName || item.ProductName || 'Unknown Product'}
                        </span>
                        <span className="item-quantity">Qty: {item.quantity || item.Quantity}</span>
                        <span className="item-price">${(item.price || item.Price)?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage; 