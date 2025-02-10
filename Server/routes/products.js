const express = require('express');


const authenticateToken = require('../middleware/auth');
//const isAdmin = require('../middleware/admin');


const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const Product = require('../models/Product');




// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});


// File upload route - Move this BEFORE the product routes
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  res.json({
    message: 'File uploaded successfully',
    filename: req.file.filename
  });
});



// Product Routes
router.get('/', async (req, res) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  // Product Routes
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({featured: true});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


  
  router.post('/add', authenticateToken, async (req, res) => {
    try {
        if (!req.user.role) {
            return res.status(403).json({ message: 'Forbidden: Admin access required' });
        }

        const newProduct = new Product(req.body);
        await newProduct.save();

        console.log("Product Added:", newProduct); // Log new product in backend
        res.status(201).json(newProduct); // ✅ Always return JSON response
    } catch (error) {
        console.error("Error saving product:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
  

  router.get('/:id', async (req, res) => {
    try {
      const products = await Product.findById(req.params.id);
      res.json(products);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  
 /* router.post('/add', authenticateToken, isAdmin, async (req, res) => {
    const product = new Product(req.body);
    try {
      const newProduct = await product.save();
      
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(400).json({ message: err.message });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   res.status(400).json({ message: err.message });
    }
  });*/


  router.put('/:id', authenticateToken, async (req, res) => {
    try {

      if (!req.user.role) {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(product);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.user.role) {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
    } 
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  module.exports = router;