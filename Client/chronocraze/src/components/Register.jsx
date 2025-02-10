import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Register.css';

const Register = () => {
    const navigate = useNavigate();
    const { register, isAuthenticated, error: authError, clearError } = useAuth();
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
        clearError();
    }, [isAuthenticated, navigate, clearError]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.username) newErrors.username = 'Username is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            try {
                const response = await register(formData.username, formData.email, formData.password);
                if (response.success) {
                    navigate('/login', { state: { message: 'Registration successful! Please login.' } });
                }
            } catch (error) {
                setErrors(prev => ({ ...prev, submit: error.message || 'Registration failed. Please try again.' }));
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="container">
            <div className="formWrapper">
                <h1 className="title">Create Account</h1>
                {authError && <div className="errorMessage">{authError}</div>}
                <form onSubmit={handleSubmit} className="form">
                    <div className="formGroup">
                        <label htmlFor="username" className="label">Username</label>
                        <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} className={`input ${errors.username ? 'errorInput' : ''}`} />
                        {errors.username && <span className="errorText">{errors.username}</span>}
                    </div>
                    <div className="formGroup">
                        <label htmlFor="email" className="label">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={`input ${errors.email ? 'errorInput' : ''}`} />
                        {errors.email && <span className="errorText">{errors.email}</span>}
                    </div>
                    <div className="formGroup">
                        <label htmlFor="password" className="label">Password</label>
                        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className={`input ${errors.password ? 'errorInput' : ''}`} />
                        {errors.password && <span className="errorText">{errors.password}</span>}
                    </div>
                    <div className="formGroup">
                        <label htmlFor="confirmPassword" className="label">Confirm Password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`input ${errors.confirmPassword ? 'errorInput' : ''}`} />
                        {errors.confirmPassword && <span className="errorText">{errors.confirmPassword}</span>}
                    </div>
                    <button type="submit" className="submitButton" disabled={isSubmitting}>{isSubmitting ? 'Creating Account...' : 'Register'}</button>
                </form>
                <p className="loginLink">Already have an account? <Link to="/login">Login here</Link></p>
            </div>
        </div>
    );
};

export default Register;
