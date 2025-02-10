const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const authenticateToken = require('../middleware/auth'); // Import authentication middleware
router.post('/checkout', authenticateToken, async (req, res) => {
  try {
      console.log('Order entered');

      // Find the cart for the user by userId
      const cart = await Cart.findOne({ userId: req.user.id }).populate('items.product');

      // Check if the cart exists and has items
      if (!cart || cart.items.length === 0) {
          return res.status(400).json({ message: 'Cart is empty' });
      }

      // Log the populated cart for debugging
      console.log('Cart before checkout:', cart);

      // Calculate total price manually if it's not set
      const totalPrice = cart.items.reduce((total, item) => {
          return total + (item.product.price * item.quantity);
      }, 0);

      // Create an order using the cart items
      const order = new Order({
          userId: req.user.id,
          items: cart.items,  // Create order based on cart items
          totalPrice: totalPrice,  // Set the calculated total price
          status: 'pending',  // Order status
      });

      await order.save();  // Save the order to the database

      console.log('Order Created:', order);

      // Optionally, you can clear the cart after checkout, but only if necessary
      // cart.items = [];
      // await cart.save();

      // Send success response with order details
      res.json({
          message: 'Checkout successful',
          orders: [order] // Return an array instead of a single object
      });

  } catch (err) {
      res.status(500).json({ message: 'Error during checkout', error: err.message });
  }
});


// Get all orders for a user (Protected Route)
router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        // Ensure that the user is accessing their own orders
        if (req.user.id !== userId) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        const orders = await Order.find({ userId }).populate('items.product');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Get order details by order ID (Protected Route)
router.get('/:orderId', authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId).populate('items.product');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Ensure the order belongs to the authenticated user
        if (req.user.id !== order.userId.toString()) {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Update order status (Admin Only)
router.put('/:orderId/status', authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // Only allow specific statuses
        const validStatuses = ['pending', 'processing', 'Sshipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid order status" });
        }

        // Ensure the user is an admin before updating order status
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized action" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order status updated", order: updatedOrder });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Delete an order (Admin Only)
router.delete('/:orderId', authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;

        // Ensure the user is an admin before deleting an order
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized action" });
        }

        const deletedOrder = await Order.findByIdAndDelete(orderId);

        if (!deletedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;
