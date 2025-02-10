const mongoose = require('mongoose');
// Product Model
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  image: String,
  category: String,
  stockQuantity: { type: Number, required: true },
  featured: { type: Boolean, default: false } 
  
});

module.exports = mongoose.model('Product', productSchema);
