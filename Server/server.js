// Backend Setup (server.js)
const express = require('express');
const mongoose = require('mongoose');

const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();



const app = express();
const path = require('path');


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//app.use('/uploads', express.static('uploads'));
/*app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));*/



// Configure CORS with specific origins
app.use(cors({
  origin: 'http://localhost:5173', // or whatever your frontend URL is
  credentials: true
}));

// Add CSP headers middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: blob: http://localhost:5004; media-src 'self'"
  );
  next();
});




// Middleware
//app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB  connection error:', err));

// Routes


const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);

const orderRoutes = require('./routes/orders');
app.use('/api/orders', orderRoutes);

const cartRoutes = require('./routes/cart');
app.use('/api/cart', cartRoutes);

const checkoutRoutes = require('./routes/checkout');
app.use('/api/checkout', checkoutRoutes);



const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));