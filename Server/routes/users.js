const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Route to get current user data
router.get('/', authenticateToken, async (req, res) => {
  try {
      res.json(req.user);
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
});

// User Routes
router.post('/register', async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        role: "user"
      });
      await user.save();
      res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
  /*router.post('/login', async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) return res.status(400).json({ message: 'User not found' });
  
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) return res.status(400).json({ message: 'Invalid password' });
  
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      res.json({ token });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });*/




  router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        console.log(req.body.email,req.body.password);
        if (!user) return res.status(400).json({ message: 'User not found' });
    
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid password' });
    
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Create a user object without the password
        const userResponse = {
            _id: user._id,
            username:user.username,
            email: user.email,
            role: user.role
            // Add any other user fields you want to send to the frontend
        };

        // Send both token and user data
        res.json({ 
            token,
            user: userResponse 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Get a user by ID (GET)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user by ID (PUT)
router.put('/:id', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, password },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

  module.exports = router;