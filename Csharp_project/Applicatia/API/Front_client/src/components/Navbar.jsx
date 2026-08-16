import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "./CartContext";
import "./Navbar.css";

const Navbar = () => {
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation(); 
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

 
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, [location]); 

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="navbar-logo">🌸 FlowerShop</div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/profile">Profile</Link>
        {isAuthenticated && (
          <Link to="/orders">My Orders</Link>
        )}
        {isAuthenticated ? (
        <a 
          href="#" 
          onClick={handleLogout} 
          className="navbar-link" 
        >
          Logout
        </a>
      ) : (
        <Link to="/login" className="navbar-link">
          Login
        </Link>
      )}
        <Link to="/cart" className="cart-icon">
          <FaShoppingCart />
          <span className="cart-count">{totalItems}</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;