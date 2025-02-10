
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5004/api/products/featured');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchFeaturedProducts();
  }, []);
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Chronocraze</h1>
        <p>Discover Amazing Products at Great Prices</p>
        <div className="hero-buttons">
          <Link to="/products" className="btn btn-primary">Shop Now</Link>
          <Link to="/products" className="btn btn-secondary">View Categories</Link>
        </div>
      </div>

      <section className="featured-products">
        <h1>Featured Products</h1>
       <div className="container">
             
             <div className="products-grid">
               {products.map(product => (
                 <div key={product._id} className="product-card">
                   <img 
                     src="./assets/images/watch1.jpg" 
                     alt={product.name} 
                     className="product-image" 
                   />
                   <h2 className="product-title">{product.name}</h2>
                   <p className="product-price">${product.price}</p>
                   <Link 
                     to={`/products/${product._id}`} 
                     className="view-details"
                   >
                     View Details
                   </Link>
                 </div>
               ))}
             </div>
           </div>

      </section>
    </div>
  );
};

export default Home;