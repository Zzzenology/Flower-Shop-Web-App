import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserData } from '@services/authServices';
import Navbar from './Navbar';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000";
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProducts, setUserProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingStock, setEditingStock] = useState({});
  const [updatingStock, setUpdatingStock] = useState(new Set());
  const [product, setProduct] = useState({
    nume: '',
    culoare: [],
    poza: null,
    categorii: [],
    price: '',
    stock: 0,
    descriere: ''
  });

  const availableColors = [
    'Negru',
    'Rosu',
    'Albastru',
    'Galben',
    "Roz",
    'Alb',
    'Verde',
    'Portocaliu',
    'Mov',
    'Gri'
  ]

  const availableCategories = [
    'Buchete',
    'Plante în ghiveci',
    'Aranjamente',
    'Plante de exterior',
    'Plante aromatice',
    'Orhidee',
    'Trandafiri',
    'Plante suculente'
  ];

  // Fetch pt produse
  const fetchUserProducts = async () => {
    if (user?.role !== 'vanzator') return;
    
    setLoadingProducts(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(BASE_URL + '/product/my-products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const products = await response.json();
        console.log('Fetched products:', products);
        console.log('First product:', products[0]);
        setUserProducts(products);
      } else {
        console.error("Error fetching products:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userData = await getUserData(token);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Fetch pt atunci cand datele de user sunt introduse
  useEffect(() => {
    if (user) {
      fetchUserProducts();
    }
  }, [user]);

  const handleInputChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value
    });
  };

  const handleCategorySelect = (e) => {
    const options = [...e.target.selectedOptions];
    const values = options.map(option => option.value);
    setProduct({
      ...product,
      categorii: values
    });
  };

  const handleColourSelect = (e) => {
    const options = [...e.target.selectedOptions];
    const values = options.map(option => option.value);
    setProduct({
      ...product,
      culoare: values
    });
  };

  const handleFileChange = (e) => {
    setProduct({
      ...product,
      poza: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product.poza) {
      alert('Vă rugăm să selectați o imagine');
      return;
    }

    if (product.categorii.length === 0) {
      alert('Vă rugăm să selectați cel puțin o categorie');
      return;
    }

    if (product.culoare.length === 0) {
      alert('Vă rugăm să selectați cel puțin o culoare');
      return;
    }

    if (!product.price || product.price <= 0) {
      alert('Vă rugăm să introduceți un preț valid');
      return;
    }

    const formData = new FormData();
    formData.append('nume', product.nume);
    formData.append('culoare', product.culoare.join(','));
    product.categorii.forEach(cat => formData.append('categorie', cat));
    formData.append('poza', product.poza);
    formData.append('price', product.price);
    formData.append('stock', product.stock);
    formData.append('descriere', product.descriere);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(BASE_URL + '/product', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Eroare la încărcare produs');

      alert('Produs adăugat cu succes!');
      setProduct({
        nume: '',
        culoare: [],
        poza: null,
        categorii: [],
        price: '',
        stock: 0,
        descriere: ''
      });
      
      // Refresh the products list
      fetchUserProducts();

    } catch (error) {
      console.error("Eroare:", error);
      alert(error.message || 'Eroare la trimitere produs');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Sigur doriți să ștergeți acest produs? Această acțiune nu poate fi anulată.')) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/product/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Produs șters cu succes!');

        fetchUserProducts();
      } else {
        const errorData = await response.text();
        console.error("Error deleting product:", errorData);
        alert('Eroare la ștergerea produsului. Vă rugăm să încercați din nou.');
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert('Eroare la ștergerea produsului. Vă rugăm să încercați din nou.');
    }
  };

  const handleDeleteProfile = async () => {
    const confirmMessage = user.role === 'vanzator' 
      ? 'ATENȚIE: Această acțiune va șterge definitiv contul dvs., toate produsele adăugate și comenzile asociate. Această acțiune nu poate fi anulată. Sunteți sigur că doriți să continuați?'
      : 'ATENȚIE: Această acțiune va șterge definitiv contul dvs. și toate comenzile asociate. Această acțiune nu poate fi anulată. Sunteți sigur că doriți să continuați?';

    if (!window.confirm(confirmMessage)) {
      return;
    }


    if (!window.confirm('Ultima confirmare: Chiar doriți să ștergeți contul dvs.? Toate datele vor fi pierdute permanent!')) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/register/profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Contul dvs. a fost șters cu succes. Veți fi redirecționat către pagina principală.');
        localStorage.removeItem("token");
        navigate('/');
      } else {
        const errorData = await response.text();
        console.error("Error deleting profile:", errorData);
        alert('Eroare la ștergerea contului. Vă rugăm să încercați din nou.');
      }
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert('Eroare la ștergerea contului. Vă rugăm să încercați din nou.');
    }
  };

  // pt update la stock
  const handleStockUpdate = async (productId, newStock) => {
    if (newStock < 0) {
      alert('Stocul nu poate fi negativ');
      return;
    }

    setUpdatingStock(prev => new Set([...prev, productId]));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/product/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stock: newStock })
      });

      if (response.ok) {
        const result = await response.json();
        
  
        setUserProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === productId 
              ? { ...product, stock: newStock }
              : product
          )
        );


        setEditingStock(prev => {
          const newState = { ...prev };
          delete newState[productId];
          return newState;
        });

        alert('Stocul a fost actualizat cu succes!');
      } else {
        const errorData = await response.text();
        console.error("Error updating stock:", errorData);
        alert('Eroare la actualizarea stocului. Vă rugăm să încercați din nou.');
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      alert('Eroare la actualizarea stocului. Vă rugăm să încercați din nou.');
    } finally {
      setUpdatingStock(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };


  const handleStockInputChange = (productId, value) => {
    setEditingStock(prev => ({
      ...prev,
      [productId]: parseInt(value) || 0
    }));
  };

  //pt editare stock
  const startEditingStock = (productId, currentStock) => {
    setEditingStock(prev => ({
      ...prev,
      [productId]: currentStock
    }));
  };

  // pt a anula editarea
  const cancelStockEdit = (productId) => {
    setEditingStock(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
  };

  if (loading) return (
    <div className="profile-page-wrapper">
      <Navbar />
      <div className="profile-intro-section">
        <h1>Profilul meu</h1>
        <p>Gestionează-ți contul și produsele</p>
      </div>
      <div className="profile-content-container">
        <div className="loading">Se încarcă...</div>
      </div>
    </div>
  );
  
  if (!user) return (
    <div className="profile-page-wrapper">
      <Navbar />
      <div className="profile-intro-section">
        <h1>Profilul meu</h1>
        <p>Gestionează-ți contul și produsele</p>
      </div>
      <div className="profile-content-container">
        <div>Eroare la încărcarea profilului.</div>
      </div>
    </div>
  );

  return (
    <div className="profile-page-wrapper">
      <Navbar />
      <div className="profile-intro-section">
        <h1>Profilul meu</h1>
        <p>Gestionează-ți contul și produsele</p>
      </div>
      <div className="profile-content-container">
        <div className="profile-container">
          <div className="profile-card">
            <h2>Profilul meu</h2>

            <div className="profile-info">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Rol:</strong> {user.role}</p>
              {user.createdAt && <p><strong>Membru din:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>}
            </div>

            <div className="profile-actions">
              <button 
                onClick={handleDeleteProfile}
                className="delete-profile-btn"
              >
                Șterge contul
              </button>
            </div>

            {user.role === 'vanzator' && (
              <>
                {/* My Products Section */}
                <div className="my-products-section">
                  <h3>Produsele mele ({userProducts.length})</h3>
                  {loadingProducts ? (
                    <p>Se încarcă produsele...</p>
                  ) : userProducts.length === 0 ? (
                    <p className="no-products">Nu aveți produse adăugate încă.</p>
                  ) : (
                    <div className="products-grid">
                      {userProducts.map((product) => (
                        <div key={product.id} className="product-card-small">
                          <img 
                            src={BASE_URL + (product.pozaURL || product.PozaURL || product.poza)} 
                            alt={product.nume} 
                            className="product-image-small"
                            onError={(e) => {
                              const possiblePaths = [
                                BASE_URL + (product.pozaURL || ''),
                                BASE_URL + (product.PozaURL || ''),
                                BASE_URL + (product.poza || '')
                              ];
                              console.log('Image failed to load. Tried paths:', possiblePaths);
                              console.log('Product object:', product);
                              e.target.src = 'https://via.placeholder.com/150x150?text=No+Image';
                            }}
                          />
                          <div className="product-info-small">
                            <h4>{product.nume}</h4>
                            <p className="product-price-small">{product.price} RON</p>
                            
                            {/* Description section */}
                            {product.descriere && (
                              <p className="product-description">
                                <strong>Descriere:</strong> {product.descriere}
                              </p>
                            )}
                            
                            {/* Enhanced stock management section */}
                            <div className="stock-management">
                              {editingStock[product.id] !== undefined ? (
                                // Editare stock
                                <div className="stock-edit-section">
                                  <div className="stock-input-group">
                                    <label htmlFor={`stock-${product.id}`}>Stock:</label>
                                    <input
                                      id={`stock-${product.id}`}
                                      type="number"
                                      min="0"
                                      value={editingStock[product.id]}
                                      onChange={(e) => handleStockInputChange(product.id, e.target.value)}
                                      className="stock-input"
                                      disabled={updatingStock.has(product.id)}
                                    />
                                  </div>
                                  <div className="stock-buttons">
                                    <button
                                      onClick={() => handleStockUpdate(product.id, editingStock[product.id])}
                                      className="stock-save-btn"
                                      disabled={updatingStock.has(product.id)}
                                    >
                                      {updatingStock.has(product.id) ? 'Se salvează...' : 'Salvează'}
                                    </button>
                                    <button
                                      onClick={() => cancelStockEdit(product.id)}
                                      className="stock-cancel-btn"
                                      disabled={updatingStock.has(product.id)}
                                    >
                                      Anulează
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                // Afisare stock
                                <div className="stock-display-section">
                                  <p className="product-stock">
                                    Stock: <span className={product.stock > 0 ? 'stock-available' : 'stock-empty'}>
                                      {product.stock || 0} disponibile
                                    </span>
                                  </p>
                                  <button
                                    onClick={() => startEditingStock(product.id, product.stock || 0)}
                                    className="edit-stock-btn"
                                  >
                                    Editează stock
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            <p className="product-colors">Culori: {product.culoare}</p>
                            <p className="product-categories">Categorii: {product.categorie?.join(', ') || 'N/A'}</p>
                            <p className="product-date">Adăugat: {new Date(product.createdAt).toLocaleDateString()}</p>
                          </div>
                          <button onClick={() => handleDeleteProduct(product.id)} className="delete-btn">Șterge</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add New Product Section */}
                <div className="seller-section">
                  <h3>Adaugă produs nou</h3>
                  <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-group">
                      <label>Nume produs:</label>
                      <input
                        type="text"
                        name="nume"
                        value={product.nume}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Descriere:</label>
                      <textarea
                        name="descriere"
                        value={product.descriere}
                        onChange={handleInputChange}
                        placeholder="Descrieți produsul dvs. (opțional)"
                        rows="4"
                        className="description-textarea"
                      />
                    </div>

                    <div className="form-group">
                      <label>Culoare:</label>
                      <select
                        multiple
                        size="5"
                        value={product.culoare}
                        onChange={handleColourSelect}
                        className="multi-select"
                        required
                      >
                        {availableColors.map((category, index) => (
                          <option key={index} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Categorii:</label>
                      <select
                        multiple
                        size="6"
                        value={product.categorii}
                        onChange={handleCategorySelect}
                        className="multi-select"
                        required
                      >
                        {availableCategories.map((category, index) => (
                          <option key={index} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Preț (RON):</label>
                      <input
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Stock:</label>
                      <input
                        type="number"
                        name="stock"
                        value={product.stock}
                        onChange={handleInputChange}
                        min="0"
                        step="1"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Imagine:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                      />
                    </div>

                    <button type="submit" className="submit-btn">
                      Adaugă produs
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;