import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/ProductDetail.module.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, token } = useAuth();
    
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5004/api/products/${id}`);
                if (!response.data) {
                    throw new Error('Product not found');
                }
                setProduct(response.data);
            } catch (err) {
                setError(err.message || 'Failed to fetch product details');
            } finally {
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [id]);

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            // Store the current location to redirect back after login
            sessionStorage.setItem('redirectAfterLogin', `/product/${id}`);
            navigate('/login');
            return;
        }

        try {
            
            const response = await axios.post(
                'http://localhost:5004/api/cart/add',
                { 
                    productId: product._id, 
                    quantity 
                },
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );

            console.log('Cart response:', response.data); // Debug log

            if (response.status === 200 || response.status === 201) {
                navigate('/cart');
            } else {
                throw new Error('Failed to add to cart');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add product to cart');
        }
    };

    const updateQuantity = (action) => {
        setQuantity(prev => {
            if (action === 'increase') {
                return prev + 1;
            }
            if (action === 'decrease' && prev > 1) {
                return prev - 1;
            }
            return prev;
        });
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.error}>{error}</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.error}>Product not found</div>
            </div>
        );
    }

    return (
        <div className={styles.detailContainer}>
            <div className={styles.productGrid}>
                <div className={styles.imageContainer}>
                    <img 
                        src={product.imageUrl || "/assets/images/watch1.jpg"}
                        alt={product.name} 
                        className={styles.productImage}
                        onError={(e) => {
                            e.target.src = "/assets/images/watch1.jpg";
                        }}
                    />
                </div>
                <div className={styles.productInfo}>
                    <h1 className={styles.productTitle}>{product.name}</h1>
                    <p className={styles.productPrice}>
                        ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                    </p>
                    <p className={styles.productDescription}>
                        {product.description}
                    </p>
                    <div className={styles.quantityControl}>
                        <button 
                            onClick={() => updateQuantity('decrease')}
                            disabled={quantity <= 1}
                            className={styles.quantityButton}
                            aria-label="Decrease quantity"
                        >
                            -
                        </button>
                        <span className="quantity">{quantity}</span>
                        <button 
                            onClick={() => updateQuantity('increase')}
                            className={styles.quantityButton}
                            aria-label="Increase quantity"
                        >
                            +
                        </button>
                    </div>
                    <button 
                        className={styles.addToCartButton}
                        onClick={handleAddToCart}
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;