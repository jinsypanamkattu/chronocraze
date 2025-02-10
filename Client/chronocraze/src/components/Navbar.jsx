import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
        <h1 className="chronocraze">
    <span className="capital">C</span>hrono<span className="capital">C</span>raze
  </h1>
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          {isMenuOpen ? '✕' : '☰'}
        </div>

        <ul className={isMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/products" className="nav-link" onClick={toggleMenu}>
              Products
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/cart" className="nav-link" onClick={toggleMenu}>
              Cart
            </Link>
          </li>

          {!user ? (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link" onClick={toggleMenu}>
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link" onClick={toggleMenu}>
                  Register
                </Link>
              </li>
            </>
          ) : (
            <>
              {user.role === 'admin' && (
                <li className="nav-item">
                  <Link to="/admin" className="nav-link" onClick={toggleMenu}>
                    Admin
                  </Link>
                </li>
              )}
              <li className="nav-item">
                <Link to="/profile" className="nav-link" onClick={toggleMenu}>
                  {user.username}
                </Link>
              </li>
              <li className="nav-item">
                <button 
                  onClick={() => {
                    logout();
                    toggleMenu();
                  }} 
                  className="nav-link logout-btn"
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;