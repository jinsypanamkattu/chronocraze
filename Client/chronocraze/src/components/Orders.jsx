import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Orders.module.css';
//import {loadStripe} from '@stripe/stripe-js';
//const stripePromise = loadStripe(import.meta.env.PUBLISHED_KEY_STRIPE);
import CheckoutButton from './CheckoutButton';



const Orders = () => {


    const { token } = useAuth();
    const [orders, setOrders] = useState([]);  // Initialize with empty array
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.post(
                    'http://localhost:5004/api/orders/checkout',
                    {}, // Request body
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                // The orders are directly in response.data.orders
                const ordersData = response.data.orders;
                console.log('Orders data:', ordersData);

                if (Array.isArray(ordersData)) {
                    setOrders(ordersData);
                } else {
                    console.error('Orders data is not an array:', ordersData);
                    setOrders([]);
                }

            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to fetch orders');
            }
        };

        fetchOrders();
    }, [token]);


    useEffect(() => {
        console.log('Orders state updated:', orders);
    }, [orders]);

    /*const makePayment = async () => {
            const body = {
                products:orders
            }

            const response = await axios.post('http://localhost:5004/api/payment', body)
    }*/

    return (


        <div className={styles.ordersContainer}>
            <h1>Your Orders</h1>
            {error && <p className={styles.error}>{error}</p>}
            {orders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                orders.map(order => (
                    <div key={order._id} className={styles.orderCard}>
                        <h3>Order ID: {order._id}</h3>
                        <p>Total: ${order.totalPrice.toFixed(2)}</p>
                        <p>Status: {order.status}</p>
                        <p>Payment Status: {order.paymentStatus}</p>
                        <p>Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        <ul>
                            {order.items.map(item => (
                                <li key={item._id}>
                                    {item.product.name} - {item.quantity} pcs
                                </li>
                            ))}
                        </ul>
                        <div><CheckoutButton cartItems={orders} /></div>
                    </div>
                    
                ))
            )}
        </div>
    );





};

export default Orders;
