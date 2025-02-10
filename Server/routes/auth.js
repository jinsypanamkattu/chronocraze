
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authenticateToken = require('../middleware/auth');
const User = require('../models/User');
//const { errorHandler } = require('../middleware/error');


const router = express.Router();
// Authentication Routes
router.post('/register', async (req, res) => {
    try {
        //const user = new User(req.body);

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username:req.body.username,
            email: req.body.email,
            password: hashedPassword,
            role: "admin"
        });



        await user.save();
        const token = jwt.sign({ id: user._id, isAdmin: user.role }, process.env.JWT_SECRET);
        res.status(201).json({ token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
       /* const user = await User.findOne({ username: req.body.username });
        if (!user || user.password !== req.body.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }*/

        const user = await User.findOne({ email: req.body.email });

        //console.log(req.body.email,req.body.password);
        if (!user) return res.status(400).json({ message: 'Admin not found' });
    
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET,{ expiresIn: '1h' });

        

        res.json({ token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Verify Token
router.get('/verify', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    //console.log(token);
    if (!token) return res.status(401).json({ error: 'No token provided' });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.status(200).json({ valid: true, userId: decoded.id });
    } catch {
      res.status(401).json({ error: 'Invalid token' });
    }
  });


  router.get('/protected', authenticateToken, (req, res) => {
   // console.log(req.headers['x-auth-token']);
    res.status(200).json({ message: 'You have accessed a protected route!', user: req.user });
  });
  


module.exports = router;