import React, { useState, useEffect } from "react";
import "./HomePage.css";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useCart } from './CartContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const BASE_URL = "http://localhost:5000";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch pt toate produsele
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${BASE_URL}/product/newest?count=10`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched newest products:', data);
          setProducts(data);
        } else {
          console.error('Error fetching products:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Conversie
  const convertProduct = (dbProduct) => ({
    id: dbProduct.id,
    nume: dbProduct.nume,
    imagine: BASE_URL + dbProduct.pozaURL,
    pret: `${dbProduct.price} RON`,
    price: dbProduct.price,
    culoare: dbProduct.culoare,
    categorie: dbProduct.categorie,
    pozaURL: dbProduct.pozaURL,
    stock: dbProduct.stock || 0,
    descriere: dbProduct.descriere || dbProduct.Descriere
  });
  
  return (
    <div>
      <Navbar />
      <div className="page-wrapper">
        <div className="intro-section">
          <h1>Bun venit la FlowerShop!</h1>
          <p>Mai jos puteți vedea cele mai noi 10 buchete adăugate pe site :)</p>
        </div>

        <div className="product-section">
          <h2 style={{ textAlign: "center" }}>Produsele noastre cele mai noi</h2>
          
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p>Se încarcă produsele...</p>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p>Nu sunt produse disponibile momentan.</p>
            </div>
          ) : (
            <div className="produse-container">
              {products.map((dbProduct) => {
                const product = convertProduct(dbProduct);
                return (
                  <div className="produs-card" key={product.id}>
                    <img 
                      src={product.imagine} 
                      alt={product.nume}
                      onError={(e) => {
                        console.log('Image failed to load:', product.imagine);
                        e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                      }}
                    />
                    <div className="produs-info">
                      <h3>{product.nume}</h3>
                      <p className="pret">{product.pret}</p>
                      <p className="stock-info">
                        Stock: <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                          {product.stock > 0 ? `${product.stock} disponibile` : 'Stoc epuizat'}
                        </span>
                      </p>
                      <div className="button-group">
                        <button 
                          className="view-product-btn"
                          onClick={() => navigate('/product', { state: { product } })}
                        >
                          Vezi produsul
                        </button>
                        <button 
                          className="buy-button"
                          onClick={() => addToCart(product)}
                          disabled={product.stock === 0}
                        >
                          {product.stock > 0 ? 'Cumpără' : 'Stoc epuizat'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="catalog-button-wrapper">
            <Link to="/catalog">
              <button className="catalog-button">Vezi catalog</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;