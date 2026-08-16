import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './CatalogPage.css';

const CatalogPage = () => {
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000";
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState([]);

  // Fetch pt toate produsele
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${BASE_URL}/product/all`);
        if (response.ok) {
          const data = await response.json();
          console.log('Raw API response for catalog:', data);
          console.log('First product from API:', data[0]);
          setAllProducts(data);
          setFilteredProducts(data);
          
          // Extragere categorii din produse
          const categories = new Set();
          data.forEach(product => {
            if (product.categorie && Array.isArray(product.categorie)) {
              product.categorie.forEach(cat => categories.add(cat));
            }
          });
          setAllCategories(Array.from(categories));
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

  // convertire din forma din DB in forma pt site
  const convertProduct = (dbProduct) => ({
    id: dbProduct.id,
    nume: dbProduct.nume,
    imagine: BASE_URL + dbProduct.pozaURL,
    pret: `${dbProduct.price} RON`,
    price: dbProduct.price,
    culoare: dbProduct.culoare,
    categorii: dbProduct.categorie,
    pozaURL: dbProduct.pozaURL,
    stock: dbProduct.stock || 0,
    descriere: dbProduct.descriere || dbProduct.Descriere
  });

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const applyFilters = () => {
    if (selectedCategories.length === 0) {
      setFilteredProducts(allProducts);
      return;
    }
    
    const filtered = allProducts.filter(product =>
      product.categorie && product.categorie.some(cat => selectedCategories.includes(cat))
    );
    
    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="catalog-intro-section">
          <h1>Explorează catalogul nostru</h1>
          <p>Se încarcă produsele...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navbar />
      
      {/* Sectiune intro similara cu Home */}
      <div className="catalog-intro-section">
        <h1>Explorează catalogul nostru</h1>
        <p>Filtrează după preferințe sau descoperă toate produsele</p>
      </div>

      <div className="filter-page-content">
        {/* Sectiunea de filtre */}
        <div className="filters-section">
          <h2 style={{color: '#2c3e50', textAlign: 'center'}}>Filtrează după categorii</h2>
          <div className="categories-container">
            {allCategories.map(category => (
              <div 
                key={category} 
                className={`category-chip ${selectedCategories.includes(category) ? 'selected' : ''}`}
                onClick={() => handleCategoryToggle(category)}
              >
                {category}
              </div>
            ))}
          </div>
          
          <button 
            className="apply-filters-btn" 
            onClick={applyFilters}
          >
            Aplică filtrele
          </button>
        </div>
        
        {/* Sectiunea de afisare produse */}
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px'}}>
              <p style={{color: '#2c3e50', fontSize: '1.2rem'}}>
                Nu s-au găsit produse pentru filtrele selectate.
              </p>
            </div>
          ) : (
            filteredProducts.map(dbProduct => {
              const product = convertProduct(dbProduct);
              return (
                <div key={product.id} className="product-card">
                  <img 
                    src={product.imagine} 
                    alt={product.nume}
                    onError={(e) => {
                      console.log('Image failed to load:', product.imagine);
                      e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                    }}
                  />
                  <h3>{product.nume}</h3>
                  <p className="price">{product.pret}</p>
                  <p className="stock-info">
                    Stock: <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                      {product.stock > 0 ? `${product.stock} disponibile` : 'Stoc epuizat'}
                    </span>
                  </p>
                  <button 
                    className="view-product-btn"
                    onClick={() => {
                      console.log('Original dbProduct before conversion:', dbProduct);
                      console.log('Converted product for navigation:', product);
                      navigate('/product', { state: { product } });
                    }}
                  >
                    Vezi produsul
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;