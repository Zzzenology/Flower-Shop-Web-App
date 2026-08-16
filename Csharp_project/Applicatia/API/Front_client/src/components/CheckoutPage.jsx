import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import Navbar from './Navbar';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const BASE_URL = "http://localhost:5000";
  
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Romania',
    phoneNumber: '',
    additionalInfo: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!deliveryAddress.fullName.trim()) {
      newErrors.fullName = 'Numele complet este obligatoriu';
    }
    
    if (!deliveryAddress.street.trim()) {
      newErrors.street = 'Adresa este obligatorie';
    }
    
    if (!deliveryAddress.city.trim()) {
      newErrors.city = 'Orașul este obligatoriu';
    }
    
    if (!deliveryAddress.postalCode.trim()) {
      newErrors.postalCode = 'Codul poștal este obligatoriu';
    }
    
    if (!deliveryAddress.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Numărul de telefon este obligatoriu';
    } else if (!/^[0-9+\-\s()]+$/.test(deliveryAddress.phoneNumber)) {
      newErrors.phoneNumber = 'Numărul de telefon nu este valid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (cart.length === 0) {
      alert('Coșul tău este gol');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert('Trebuie să fii autentificat pentru a plasa o comandă');
        navigate('/login');
        return;
      }
      
      
      const orderData = {
        products: cart.map(item => ({
          productId: item.id,
          productName: item.nume,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: cartTotal,
        deliveryAddress: deliveryAddress
      };
      
      const response = await fetch(`${BASE_URL}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
      
      if (response.ok) {
        const result = await response.json();
        alert('Comanda a fost plasată cu succes!');
        clearCart();
        navigate('/order-confirmation', { state: { orderId: result.orderId } });
      } else {
        const errorData = await response.text();
        console.error('Error placing order:', errorData);
        alert('Eroare la plasarea comenzii. Vă rugăm să încercați din nou.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Eroare la plasarea comenzii. Vă rugăm să încercați din nou.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="page-wrapper">
          <div className="checkout-intro-section">
            <h1>Finalizare comandă</h1>
            <p>Coșul tău este gol</p>
          </div>
          <div className="checkout-container">
            <div className="empty-cart-message">
              <p>Nu poți finaliza comanda cu un coș gol.</p>
              <button onClick={() => navigate('/')} className="continue-shopping-btn">
                Continuă cumpărăturile
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="page-wrapper">
        <div className="checkout-intro-section">
          <h1>Finalizare comandă</h1>
          <p>Completează adresa de livrare pentru a finaliza comanda</p>
        </div>
        
        <div className="checkout-container">
          <div className="checkout-content">
            <div className="checkout-form-section">
              <h2>Adresa de livrare</h2>
              <form onSubmit={handleSubmit} className="checkout-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fullName">Nume complet *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={deliveryAddress.fullName}
                      onChange={handleInputChange}
                      className={errors.fullName ? 'error' : ''}
                      placeholder="Introduceți numele complet"
                    />
                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="street">Adresa *</label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      value={deliveryAddress.street}
                      onChange={handleInputChange}
                      className={errors.street ? 'error' : ''}
                      placeholder="Strada, numărul, bloc, ap."
                    />
                    {errors.street && <span className="error-message">{errors.street}</span>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">Oraș *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={deliveryAddress.city}
                      onChange={handleInputChange}
                      className={errors.city ? 'error' : ''}
                      placeholder="Introduceți orașul"
                    />
                    {errors.city && <span className="error-message">{errors.city}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="postalCode">Cod poștal *</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={deliveryAddress.postalCode}
                      onChange={handleInputChange}
                      className={errors.postalCode ? 'error' : ''}
                      placeholder="123456"
                    />
                    {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="country">Țara</label>
                    <select
                      id="country"
                      name="country"
                      value={deliveryAddress.country}
                      onChange={handleInputChange}
                    >
                      <option value="Romania">România</option>
                      <option value="Moldova">Moldova</option>
                      <option value="Hungary">Ungaria</option>
                      <option value="Bulgaria">Bulgaria</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phoneNumber">Telefon *</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={deliveryAddress.phoneNumber}
                      onChange={handleInputChange}
                      className={errors.phoneNumber ? 'error' : ''}
                      placeholder="+40 123 456 789"
                    />
                    {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="additionalInfo">Informații suplimentare</label>
                    <textarea
                      id="additionalInfo"
                      name="additionalInfo"
                      value={deliveryAddress.additionalInfo}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Informații suplimentare pentru livrare (optional)"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="place-order-btn"
                  disabled={loading}
                >
                  {loading ? 'Se procesează...' : `Plasează comanda - ${cartTotal.toFixed(2)} RON`}
                </button>
              </form>
            </div>
            
            <div className="order-summary-section">
              <h2>Sumar comandă</h2>
              <div className="order-items">
                {cart.map(item => (
                  <div key={item.id} className="order-item">
                    <img src={item.imagine} alt={item.nume} />
                    <div className="item-info">
                      <h4>{item.nume}</h4>
                      <p>Cantitate: {item.quantity}</p>
                      <p className="item-price">{item.price} RON x {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="order-total">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>{cartTotal.toFixed(2)} RON</span>
                </div>
                <div className="total-row">
                  <span>Livrare:</span>
                  <span>Gratuit</span>
                </div>
                <div className="total-row final-total">
                  <span>Total:</span>
                  <span>{cartTotal.toFixed(2)} RON</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 