import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CartPage.css";
import { useCart } from './CartContext';
import Navbar from './Navbar';

const CartPage = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    cartTotal 
  } = useCart();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div>
      <Navbar />
      <div className="page-wrapper">
        <div className="cart-intro-section">
          <h1>Coșul tău</h1>
          <p>Revizuiește și finalizează comanda</p>
        </div>
        
        <div className="cart-container">
          <div className="cart-page">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>Coșul tău este gol</p>
                <Link to="/" className="continue-shopping">
                  Continuă cumpărăturile
                </Link>
              </div>
            ) : (
              <div className="cart-content">
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <img src={item.imagine} alt={item.nume} />
                      <div className="item-details">
                        <h3>{item.nume}</h3>
                        <p>{item.price} RON</p>
                        <div className="quantity-controls">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            +
                          </button>
                        </div>
                        <button 
                          className="remove-item" 
                          onClick={() => removeFromCart(item.id)}
                        >
                          Șterge
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="cart-summary">
                  <h3>Sumar comandă</h3>
                  <p>Total produse: {cart.reduce((total, item) => total + item.quantity, 0)}</p>
                  <p>Total plată: {cartTotal.toFixed(2)} RON</p>
                  <button className="checkout-btn" onClick={handleCheckout}>
                    Finalizează comanda
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;