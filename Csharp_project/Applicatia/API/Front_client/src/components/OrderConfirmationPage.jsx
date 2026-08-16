import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './OrderConfirmationPage.css';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = location.state || {};

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/profile');
  };

  return (
    <div>
      <Navbar />
      <div className="page-wrapper">
        <div className="confirmation-intro-section">
          <h1>Comandă confirmată!</h1>
          <p>Mulțumim pentru comanda ta</p>
        </div>
        
        <div className="confirmation-container">
          <div className="confirmation-content">
            <div className="success-icon">
              ✅
            </div>
            
            <h2>Comanda ta a fost plasată cu succes!</h2>
            
            {orderId && (
              <div className="order-details">
                <p><strong>Numărul comenzii:</strong> {orderId}</p>
              </div>
            )}
            
            <div className="confirmation-message">
              <p>
                Comanda ta este în procesare și vei primi un email de confirmare în scurt timp.
                Produsele vor fi pregătite și livrate conform adresei specificate.
              </p>
              
              <p>
                <strong>Timp estimat de livrare:</strong> 2-5 zile lucrătoare
              </p>
            </div>
            
            <div className="action-buttons">
              <button 
                className="continue-shopping-btn"
                onClick={handleContinueShopping}
              >
                Continuă cumpărăturile
              </button>
              
              <button 
                className="view-orders-btn"
                onClick={handleViewOrders}
              >
                Vezi comenzile mele
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage; 