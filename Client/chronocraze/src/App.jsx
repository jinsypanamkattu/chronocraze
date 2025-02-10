// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Products from './components/Products';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import { useAuth } from './context/AuthContext';
import Orders from './components/Orders';
import  UserProfile  from './components/UserProfile';
import {Elements} from '@stripe/react-stripe-js';

import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './components/CheckoutButton';
import CheckoutSuccess from './components/CheckoutSuccess';

const stripePromise = loadStripe('PUBLISHED_KEY_STRIPE');

const App = () => {
  const { isAuthenticated, user } = useAuth();

  const ProtectedRoute = ({ children, adminOnly }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    if (adminOnly && user.role !== 'admin') {
      return <Navigate to="/UserProfile" />;
    }
    return children;
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={
          <ProtectedRoute>
            <Cart />
            
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
          <Orders />
          </ProtectedRoute>
          } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        } />

<Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
            
          </ProtectedRoute>
        } />
 {/* Stripe Checkout Route - Wrap it with Elements */}
 <Route path="/checkout" element={
          <ProtectedRoute>
            <Elements stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          </ProtectedRoute>
        } />
         <Route path="/checkout/success" element={<CheckoutSuccess />} />
   
      </Routes>
     
    </Router>
    
  );
};
export default App;