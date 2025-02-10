import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import styles from '../styles/Cart.module.css';

const Cart = () => {
    const navigate = useNavigate();
    const { isAuthenticated, token } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchCartItems();
    }, [isAuthenticated, navigate]);

    const fetchCartItems = async () => {
        
              try {
            setIsLoading(true);
            const response = await axios.get('http://localhost:5004/api/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
           // console.log(JSON.stringify(response.data)+"tets");

            // Ensure we're working with an array
            /*const items = Array.isArray(response.data) ? response.data : 
                         Array.isArray(response.data.items) ? response.data.items : [];
            
            console.log('Cart items received:', items);*/
             // Debug log

             console.log('Cart items received:', response.data);  // Inspect the response structure

        // Assuming response.data contains an 'items' key that holds the cart items
        const items = response.data.items || [];  // Safe default to empty array if 'items' doesn't exist
 //console.log("products"+JSON.stringify(items));
            setCartItems(items);
           /// console.log("items"+JSON.stringify(items));
        } catch (err) {
            setError('Failed to fetch cart items');
        } finally {
            setIsLoading(false);
        }
    };
    const getImageUrl = (filename) => {
        if (!filename) return null;
        return `http://localhost:5004/uploads/${filename}`;
      };

    const updateQuantity = async (productId, quantity) => {
        try {
            await axios.put(`http://localhost:5004/api/cart/update/${productId}`, 
                { quantity }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchCartItems();
        } catch (err) {
            setError('Failed to update quantity');
        }
    };

    const removeFromCart = async (productId) => {
        try {
            await axios.delete(`http://localhost:5004/api/cart/remove/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCartItems();
        } catch (err) {
            setError('Failed to remove item');
        }
    };

    const checkout = async () => {
        try {
            const response = await axios.post(
                'http://localhost:5004/api/orders/checkout', 
                { items: cartItems }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            console.log('Checkout Response:', response.data); // Log success response
            navigate('/orders'); // Redirect after successful checkout
    
        } catch (err) {
            console.error('Checkout error:', err.response?.data || err.message); // Log backend error
            setError(err.response?.data?.message || 'Checkout failed');
        }
    };
    
   /* const checkout = async () => {
        try {
            const response = await axios.post(
                'http://localhost:5004/api/orders/checkout', 
                {cartItems},  // No need to send cartItems since backend fetches from DB
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            console.log('Order response:', response.data);
            navigate('/orders');  // Redirect to order history page
        } catch (err) {
            console.error('Checkout error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Checkout failed');
        }
    };*/

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => 
            total + (item.product.price * item.quantity), 0
        ).toFixed(2);
    };

    if (isLoading) return <div className={styles.loading}>Loading cart...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.cartContainer}>
            <h1>Your Cart</h1>
            {cartItems.length === 0 ? (
                <p className={styles.emptyCart}>Your cart is empty</p>
            ) : (
                <>
                    <div className={styles.cartItems}>
                        {console.log(JSON.stringify(cartItems))}
                        {cartItems.map(item => (
                            <div key={item.product._id} className={styles.cartItem}>
                                <img 
                                    src={getImageUrl(item.product.image)} 
                                    alt={item.product.name} 
                                    className={styles.productImage}
                                />
                                <div className={styles.productDetails}>
                                    <h3>{item.product.name}</h3>
                                    <p>${item.product.price}</p>
                                    <div className={styles.quantityControl}>
                                        <button 
                                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => removeFromCart(item.product._id)}
                                    className={styles.removeButton}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className={styles.cartSummary}>
                        <h2>Total: ${calculateTotal()}</h2>
                        <button 
                            onClick={checkout}
                            className={styles.checkoutButton}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;