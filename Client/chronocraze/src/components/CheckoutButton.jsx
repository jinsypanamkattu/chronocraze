import React from 'react';
import axios from 'axios';

const CheckoutButton = ({ cartItems }) => {
    const handleCheckout = async () => {
        try {
            console.log('Cart Items:', cartItems);
            // Ensure each item has a quantity
            const itemsWithQuantity = cartItems.flatMap(cart => 
                cart.items.map(item => ({
                    name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity || 1, // ✅ Default to 1 if missing
                }))
            );
            console.log('Items with Quantity:', itemsWithQuantity);
            const response = await axios.post('http://localhost:5004/api/checkout/payment', 
                { items: itemsWithQuantity }, // Send corrected items
                { headers: { 'Content-Type': 'application/json' } }
            );
            
            if (response.data.url) {
                window.location.href = response.data.url; // Redirect to Stripe
                console.log('Checkout Response:', response.data);
            }
        } catch (error) {
            console.error('Checkout Error:', error.response?.data || error.message);
            alert('Payment failed. Please try again.');

            
        }
    };

    return (
        <button 
            onClick={handleCheckout} 
            className="bg-blue-500 text-white p-2 rounded"
        >
            Checkout with Stripe
        </button>
    );
};

export default CheckoutButton;
