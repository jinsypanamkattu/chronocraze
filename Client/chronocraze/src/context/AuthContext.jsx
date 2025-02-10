import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Set up axios defaults when token changes
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Initialize auth state
    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');

            if (storedToken) {
                try {
                    // Make sure to use the same port as your login endpoint
                    const response = await axios.get('http://localhost:5004/api/users', {
                        headers: {
                            Authorization: `Bearer ${storedToken}`
                        }
                    });

                    if (response.data) {
                        setUser(response.data);
                        setToken(storedToken);
                        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                    } else {
                        throw new Error('No user data received');
                    }
                } catch (error) {
                    console.error('Auth initialization error:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    delete axios.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:5004/api/users/login', {
                email,
                password
            });

            console.log('Login response received:', response.data); // Debug log

            const { token: newToken, user: userData } = response.data;



            if (!newToken || !userData) {
                throw new Error('Invalid response from server');
            }

            // Store token and user data
            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(userData);
            setError(null);



            // Set default authorization header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;



            console.log('Auth state after login:', {
                token: !!newToken,
                user: !!userData,
                isAuthenticated: !!(newToken && userData)

            });

            return { success: true };
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'An error occurred during login');
            return { success: false, error: err.response?.data?.message };
        }
    };

    // Register function
    const register = async (username, email, password) => {
        try {
            const response = await axios.post('http://localhost:5004/api/users/register', {
                username,
                email,
                password
            });
            console.log('Registration response:', response.data);
            if (response.data) {
                return { success: true, data: response.data };
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (err) {

            console.error('Full registration error:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error message:', err.message);
            console.error('Error status:', err.response?.status);

            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'An error occurred during registration');
            return { success: false, error: err.response?.data?.message };
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    // Update user profile
    /*const updateProfile = async (userData) => {
        try {
            const response = await axios.put('http://localhost:5004/api/users/profile', userData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUser(response.data);
            return { success: true };
        } catch (err) {
            console.error('Profile update error:', err);
            setError(err.response?.data?.message || 'An error occurred updating profile');
            return { success: false, error: err.response?.data?.message };
        }
    };*/

    // Check if user is authenticated
    const isAuthenticated = Boolean(token && user);

    // Check if user is admin
    const isAdmin = user?.role === 'admin';

    // Clear any error
    const clearError = () => setError(null);

    const value = {
        user,
        token,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;