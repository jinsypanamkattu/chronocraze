// Products.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/Product.css';

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5004/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <>
      <div className="title-wrapper">
        <h1 className="page-title">Products</h1>
      </div>
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
    </>
  );
};

export default Products;