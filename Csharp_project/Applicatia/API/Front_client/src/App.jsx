import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./components/HomePage";
import AuthPage from "./components/AuthPage";
import Navbar from "./components/Navbar";
import LoginPage from "./components/LoginPage";
import ProfilePage from "./components/ProfilePage";
import CatalogPage from "./components/CatalogPage";
import CartPage from "./components/CartPage";
import ProductPage from "./components/ProductPage";
import CheckoutPage from "./components/CheckoutPage";
import OrderConfirmationPage from "./components/OrderConfirmationPage";
import OrdersPage from "./components/OrdersPage";
import { CartProvider } from './components/CartContext';
import './App.css';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <React.StrictMode> {/* Adaugă StrictMode pentru debugging */}
      <CartProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } 
            />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route 
              path="/checkout" 
              element={
                <PrivateRoute>
                  <CheckoutPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/order-confirmation" 
              element={
                <PrivateRoute>
                  <OrderConfirmationPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <PrivateRoute>
                  <OrdersPage />
                </PrivateRoute>
              } 
            />
          </Routes>
        </Router>
      </CartProvider>
    </React.StrictMode>
  );
}

export default App;