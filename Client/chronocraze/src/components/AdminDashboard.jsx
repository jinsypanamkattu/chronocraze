import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userRole, setUserRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stockQuantity: '',
    featured: false,
    image: ''
  });

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
        setIsAuthorized(decoded.role === 'admin');
      } catch (error) {
        console.error('Error decoding token:', error);
        setIsAuthorized(false);
      }
    }
  }, [token]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5004/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    if (isAuthorized) {
      fetchProducts();
    }
  }, [isAuthorized, token]);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        price: editingProduct.price || '',
        category: editingProduct.category || '',
        stockQuantity: editingProduct.stockQuantity || '',
        featured: editingProduct.featured || false,
        image: editingProduct.image || ''
      });
      if (editingProduct.image) {
        setImagePreview(`http://localhost:5004/uploads/${editingProduct.image}`);
      }
    }
  }, [editingProduct]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Selected file:', file); // Debug log
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Don't set formData.image here as we'll handle it after upload
    }
  };
  const uploadImage = async () => {
    if (!imageFile) {
      console.log('No image file to upload');
      return null;
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    // Debug log to check FormData contents
    for (let pair of formData.entries()) {
      console.log('FormData contents:', pair[0], pair[1]);
    }

    try {
      setUploadStatus('Uploading...');
      console.log('Sending upload request...');
      console.log('Sending upload request to:', 'http://localhost:5004/api/products/upload-image');
      const response = await axios.post(
        'http://localhost:5004/api/products/upload-image',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Upload response:', response.data);
      setUploadStatus('Upload successful!');
      return response.data.filename; // Changed from imageUrl to filename
    } catch (error) {
      console.error('Upload error:', error.response || error);
      setUploadStatus('Upload failed: ' + (error.response?.data?.message || error.message));
      return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getImageUrl = (filename) => {
    if (!filename) return null;
    return `http://localhost:5004/uploads/${filename}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   // let imageUrl = formData.image;

   console.log('Form submission started');
    console.log('Current form data:', formData);
    console.log('Image file:', imageFile);

    let finalImageName = formData.image;

    if (imageFile) {
      console.log('Attempting to upload image...');
      const uploadedImageName = await uploadImage();
      if (uploadedImageName) {
        console.log('Image uploaded successfully:', uploadedImageName);
        finalImageName = uploadedImageName;
      } else {
        console.error('Image upload failed');
        return;
      }
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity),
      image: finalImageName
    };

    console.log('Final product data to be saved:', productData);

    try {
      let response;
      if (editingProduct) {
        response = await axios.put(
          `http://localhost:5004/api/products/${editingProduct._id}`,
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await axios.post(
          'http://localhost:5004/api/products/add',
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const savedProduct = response.data;
      setProducts(prev => 
        editingProduct
          ? prev.map(p => (p._id === editingProduct._id ? savedProduct : p))
          : [...prev, savedProduct]
      );

      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stockQuantity: '',
      featured: false,
      image: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setUploadStatus('');
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:5004/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter(p => p._id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-red-500">
          Access Denied: Admin Privileges Required
        </h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <button
        onClick={() => {
          resetForm();
          setShowAddForm(true);
        }}
        className="submit-button"
      >
        Add New Product
      </button>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Product Name"
            className="input-field"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Product Description"
            className="input-field"
            required
          />
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Price"
            className="input-field"
            required
            step="0.01"
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="input-field"
            required
          >
            <option value="">Select Category</option>
            <option value="Kids">Kids</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
          </select>
          <input
            type="number"
            name="stockQuantity"
            value={formData.stockQuantity}
            onChange={handleInputChange}
            placeholder="Stock Quantity"
            className="input-field"
            required
          />
          <div className="checkbox-group">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="checkbox"
            />
            <label>Featured Product</label>
          </div>
          <div className="upload-section">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="image-preview" />
            )}
            {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
          </div>
        </div>
        <div className="button-group">
          <button type="submit" className="submit-button">
            {editingProduct ? "Update" : "Add"} Product
          </button>
          <button type="button" onClick={resetForm} className="cancel-button">
            Cancel
          </button>
        </div>
      </form>
      )}

<div className="grid-container">
      {products.map((product) => (
        <div key={product._id} className="product-card">
          <div className="content">
            {product.image && (
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="product-image"
              />
            )}
            <h3 className="product-name">{product.name}</h3>
            <p className="product-price">${product.price.toFixed(2)}</p>
            <p className="product-stock">Stock: {product.stockQuantity}</p>
            <div className="button-group">
              <button
                onClick={() => {
                  setEditingProduct(product);
                  setShowAddForm(true);
                }}
                className="edit-button"
              >
                Edit
              </button>
              <button
                onClick={() => deleteProduct(product._id)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
    </div>
  );
};

export default AdminDashboard;