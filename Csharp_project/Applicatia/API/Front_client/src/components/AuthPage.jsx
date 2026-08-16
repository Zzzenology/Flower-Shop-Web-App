import React, { useState } from "react";
import "./AuthPage.css";
import { registerUser } from '../services/authServices';
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const AuthPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("cumparator");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = {
      username: formData.name,
      email: formData.email,
      password: formData.password,
      role: role,
      id: ""
    };

    try {
      const result = await registerUser(userData);
      console.log("Utilizator Inregistrat:", result);
      navigate("/login");
    } catch (error) {
      console.error("Eroare:", error.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page-wrapper">
        <div className="register-intro-section">
          <div className="register-container">
            <div className="auth-container">
              <h2>Register</h2>

              <div className="role-select">
                <label htmlFor="role">Alege rolul:</label>
                <select 
                  id="role" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="role-select-input"
                >
                  <option value="cumparator">Cumpărător</option>
                  <option value="vanzator">Vânzător</option>
                </select>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Nume"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Parolă"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">
                  Înregistrează-te
                </button>
              </form>

              <p className="switch-text">
                Ai deja cont?
                <button onClick={() => navigate("/login")} className="switch-btn">
                  Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;