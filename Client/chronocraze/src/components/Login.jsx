// src/components/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, user, error: authError, clearError } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            navigate('/admin');
        } else if (isAuthenticated) {
            navigate('/');
        } else {
            navigate('/login', { 
                state: { from: '/admin' },
                replace: true 
            });
        }
    }, [isAuthenticated, user, navigate, clearError]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            setIsSubmitting(true);
            
            try {
                const response = await login(formData.email, formData.password);
                if (response.success) {
                    navigate('/products');
                }
            } catch (error) {
                setErrors(prev => ({
                    ...prev,
                    submit: error.message || 'Login failed'
                }));
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="container">
            <div className="formWrapper">
                <h1 className="title">Welcome Back</h1>
                
                {authError && (
                    <div className="errorMessage">
                        {authError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="form">
                    <div className="formGroup">
                        <label htmlFor="email" className="label">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`input ${errors.email ? 'errorInput' : ''}`}
                        />
                        {errors.email && (
                            <span className="errorText">{errors.email}</span>
                        )}
                    </div>

                    <div className="formGroup">
                        <label htmlFor="password" className="label">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`input ${errors.password ? 'errorInput' : ''}`}
                        />
                        {errors.password && (
                            <span className="errorText">{errors.password}</span>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className="submitButton"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Logging In...' : 'Login'}
                    </button>
                </form>

                <p className="registerLink">
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
