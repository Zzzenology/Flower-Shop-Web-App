
import React, { useState } from "react";
import "./LoginPage.css"; 
import { loginUser } from '../services/authServices';
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar"; 

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const result = await loginUser({
            email: formData.email,
            password: formData.password
        });
        
     
        localStorage.setItem("token", result.token);
        

        
        navigate("/"); 
    } catch (error) {
        console.error("Eroare:", error.message);
    }
};
    

    return (
        <div>
            <Navbar />
            <div className="page-wrapper">
                <div className="login-intro-section">
                    <h1>Bun venit înapoi!</h1>
                    <p>Conectează-te pentru a accesa contul tău</p>
                </div>

                <div className="login-container">
                    <div className="auth-container">
                        <h2>Login</h2>
                        <form onSubmit={handleSubmit}>
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
                                Login
                            </button>
                        </form>
                        <p className="switch-text">
                            Nu ai cont?
                            <button onClick={() => navigate("/register")} className="switch-btn">
                                Înregistrează-te
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;