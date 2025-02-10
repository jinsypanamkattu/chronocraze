const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
const Order = require("../models/Order"); // Import your Order
const Cart = require("../models/Cart"); // Import your Order

const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Ensure the secret key is loaded

router.post('/payment', async (req, res) => {
    try {
        const { items } = req.body; // Ensure items are correctly received

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items in cart' });
        }

        // Map items to Stripe format
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity || 1,
        }));

        // Create a Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/checkout/success`,
            cancel_url: `${process.env.CLIENT_URL}/cart`,
            metadata: {
                orderId: req.body._id, // ✅ Store Order ID in Stripe metadata
                userId: req.body.userId,   // Optional: Store User ID if needed
            },
        });

        res.json({url: session.url,sessionId:session.id }); // Send back Stripe URL
    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({ error: error.message });
    }
});




router.post("/checkout/success", async (req, res) => {
    try {
        const { sessionId } = req.body;

        // ✅ Retrieve session details from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // ✅ Extract order ID from metadata
        const orderId = session.metadata.orderId;
        const userId = session.metadata.userId;

        if (!orderId) {
            return res.status(400).json({ message: "Order ID not found in metadata!" });
        }


        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { stripeSessionId: sessionId, status: "Paid" }, // Mark order as Paid
            { new: true }
          );
  
          if (!updatedOrder) {
            console.error("Order not found");
            return res.status(404).send("Order not found");
          }

        // ✅ Find the user's cart and create an order (if needed)
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(400).json({ message: "Cart not found!" });
        }else{

        // ✅ Clear the cart from the database
        await Cart.findOneAndDelete({ user: userId });
        }

        res.json({ message: "Payment successful!", orderId });
    } catch (error) {
        console.error("Checkout Success Error:", error);
        res.status(500).json({ message: "Server error!" });
    }
});




router.post("/checkout/success", async (req, res) => {
    try {
        const { sessionId, userId } = req.body; // Get sessionId & userId

        console.log("Stripe Session Success:", sessionId);

        // ✅ Find the user's cart and create an order (if needed)
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(400).json({ message: "Cart not found!" });
        }

        // ✅ Update an order with the stripe session id (Optional: if you save orders)
      
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { stripeSessionId: sessionId, status: "Paid" }, // Mark order as Paid
          { new: true }
        );

        if (!updatedOrder) {
          console.error("Order not found");
          return res.status(404).send("Order not found");
        }else{

        }


        /*const order = await Order.findOne({ userId: userId });
        const order = new Order({
            user: userId,
            items: cart.items,
            totalPrice: cart.totalPrice,
            paymentStatus: "paid",
            stripeSessionId: sessionId,
        });
        await order.save();*/

        // ✅ Clear the cart from DB
        await Cart.findOneAndDelete({ user: userId });

        res.json({ message: "Payment successful! Cart cleared." });
    } catch (error) {
        console.error("Checkout Success Error:", error);
        res.status(500).json({ message: "Server error!" });
    }
});

module.exports = router;
