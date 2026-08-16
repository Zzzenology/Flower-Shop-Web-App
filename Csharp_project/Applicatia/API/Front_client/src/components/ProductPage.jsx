import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ProductPage.css';
import { useCart } from './CartContext';
import Navbar from './Navbar';

const ProductPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product } = location.state || {};
  const { addToCart } = useCart();

  console.log('ProductPage received product:', product);

  const handleBuy = () => {
    if (product) {
      addToCart(product);
      navigate('/cart');
    }
  };

  if (!product) {
    return (
      <div>
        <Navbar />
        <div className="page-wrapper">
          <div className="product-intro-section">
            <h1>Produsul tău</h1>
            <p>Descoperă detalii despre produs</p>
          </div>
          <div className="product-not-found">
            Produsul nu a fost găsit.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="page-wrapper">
        <div className="product-intro-section">
          <h1>{product.nume}</h1>
          <p>Descoperă toate detaliile despre acest produs</p>
        </div>
        
        <div className="product-container">
          <div className="product-page-container">
            <div className="product-image-container">
              <img src={product.imagine} alt={product.nume} className="product-image" />
            </div>
            <div className="product-details">
              <h1 className="product-title">{product.nume}</h1>
              <p className="product-price">{product.pret}</p>
              <p className="product-stock">
                Stock: <span className={product.stock > 0 ? 'stock-available' : 'stock-empty'}>
                  {product.stock > 0 ? `${product.stock} disponibile` : 'Stoc epuizat'}
                </span>
              </p>
              <p className="product-description">
                {product.descriere}
              </p>
              <button 
                className="buy-button" 
                onClick={handleBuy}
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? 'Adaugă în coș' : 'Stoc epuizat'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;