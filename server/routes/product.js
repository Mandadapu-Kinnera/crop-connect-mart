const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/auth');

// GET: All products (Marketplace)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error('Fetch All Products Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET: My products (For Farmer)
router.get('/my-products', verifyToken, async (req, res) => {
    if (req.userRole !== 'farmer') {
        return res.status(403).json({ message: 'Access restricted to farmers' });
    }
    try {
        const products = await Product.find({ farmerId: req.userId }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error('Fetch My Products Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// POST: Add new product
router.post('/', verifyToken, async (req, res) => {
    console.log('Add Product Request received');
    console.log('User Role:', req.userRole);
    console.log('User ID:', req.userId);

    if (req.userRole !== 'farmer') {
        return res.status(403).json({ message: 'Only farmers can add products' });
    }

    try {
        if (!mongoose.Types.ObjectId.isValid(req.userId)) {
            console.log('Invalid User ID format:', req.userId);
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        const farmer = await User.findById(req.userId);
        if (!farmer) {
            console.log('Farmer not found in DB with ID:', req.userId);
            return res.status(404).json({ message: 'Farmer account not found' });
        }

        const requiredFields = ['name', 'description', 'category', 'price', 'unit', 'quantityAvailable', 'image', 'location', 'coordinates'];
        for (const field of requiredFields) {
            if (!req.body[field] && req.body[field] !== 0) {
                console.log('Missing/Empty field:', field);
                return res.status(400).json({ message: `Field "${field}" is required` });
            }
        }

        console.log('Saving product for farmer:', farmer.name);
        const product = new Product({
            ...req.body,
            farmerId: req.userId,
            farmerName: farmer.name
        });

        const savedProduct = await product.save();
        console.log('Product saved successfully:', savedProduct.name);
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error('Add Product Error details:', error);
        res.status(400).json({
            message: error.message,
            errors: error.errors // Mongoose validation errors
        });
    }
});

// PUT: Update product
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (product.farmerId.toString() !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        Object.assign(product, req.body);
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        console.error('Update Product Error:', error);
        res.status(400).json({ message: error.message });
    }
});

// DELETE: Remove product
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (product.farmerId.toString() !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Delete Product Error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
