const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const authenticateToken = require('../middleware/auth');

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id })
                            .populate('items.product');

        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [] });
            await cart.save();
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        console.log(req.body);

        // Validate product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check stock availability
        if (product.stockQuantity < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        let cart = await Cart.findOne({ userId: req.user.id });

        // Create new cart if doesn't exist
        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [] });
        }

        // Check if product already in cart
        const existingItem = cart.items.find(item => 
            item.product.toString() === productId
        );

        if (existingItem) {
            // Update quantity if product exists
            existingItem.quantity += quantity;
        } else {
            // Add new item if product doesn't exist in cart
            cart.items.push({ product: productId, quantity });
        }

        // Calculate total price
        cart.totalPrice = cart.items.reduce((total, item) => {
            return total + (item.quantity * product.price);
        }, 0);

        await cart.save();
        
        // Populate product details before sending response
        const populatedCart = await Cart.findById(cart._id)
                                      .populate('items.product');

        res.status(200).json(populatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update cart item quantity
router.put('/update/:productId', authenticateToken, async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        // Validate quantity
        if (quantity < 1) {
            return res.status(400).json({ message: 'Invalid quantity' });
        }

        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Find item in cart
        const itemIndex = cart.items.findIndex(item => 
            item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Check stock availability
        const product = await Product.findById(productId);
        if (product.stockQuantity < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        // Update quantity
        cart.items[itemIndex].quantity = quantity;

        // Recalculate total price
        cart.totalPrice = cart.items.reduce((total, item) => {
            return total + (item.quantity * product.price);
        }, 0);

        await cart.save();
        
        const updatedCart = await Cart.findById(cart._id)
                                    .populate('items.product');

        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remove item from cart
router.delete('/remove/:productId', authenticateToken, async (req, res) => {
    try {
        const { productId } = req.params;
        
        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Remove item
        cart.items = cart.items.filter(item => 
            item.product.toString() !== productId
        );

        // Recalculate total price
        const products = await Product.find({
            '_id': { $in: cart.items.map(item => item.product) }
        });

        cart.totalPrice = cart.items.reduce((total, item) => {
            const product = products.find(p => p._id.toString() === item.product.toString());
            return total + (item.quantity * product.price);
        }, 0);

        await cart.save();

        const updatedCart = await Cart.findById(cart._id)
                                    .populate('items.product');

        res.json(updatedCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Clear cart
router.delete('/clear', authenticateToken, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;