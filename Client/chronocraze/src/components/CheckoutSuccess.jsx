import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const CheckoutSuccess = ({ setCartItems, userId }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const sessionId = new URLSearchParams(location.search).get("session_id");

    useEffect(() => {
        const clearCart = async () => {
            try {
                console.log("Clearing cart for user:", userId);
                await axios.post("http://localhost:5004/api/checkout/success", {
                    sessionId,
                    userId, // Send the user ID to backend
                });

                // ✅ Clear cart from state
                setCartItems([]);

                console.log("Cart cleared successfully!");
            } catch (error) {
                console.error("Error clearing cart:", error.response?.data || error.message);
            }
        };

        if (sessionId && userId) {
            clearCart();
        }

        // Redirect after 3 seconds
        setTimeout(() => navigate("/"), 3000);
    }, [navigate, sessionId, userId, setCartItems]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <h1 className="text-3xl font-bold text-green-600">Payment Successful!</h1>
            <p className="text-lg text-gray-700 mt-2">Your order has been placed.</p>
            <p className="text-gray-500">Redirecting to home...</p>
        </div>
    );
};

export default CheckoutSuccess;
