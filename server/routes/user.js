const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// Get User Profile (including cart and wishlist)
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate('cart.product')
            .populate('wishlist');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            cart: user.cart,
            wishlist: user.wishlist
        });
    } catch (error) {
        console.error('Fetch Profile Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update Cart
router.post('/cart', verifyToken, async (req, res) => {
    try {
        const { cart } = req.body; // Expecting array of { product: productId, quantity: number }
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.cart = cart;
        await user.save();

        const updatedUser = await User.findById(req.userId).populate('cart.product');
        res.json(updatedUser.cart);
    } catch (error) {
        console.error('Update Cart Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update Wishlist
router.post('/wishlist', verifyToken, async (req, res) => {
    try {
        const { wishlist } = req.body; // Expecting array of productIds
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.wishlist = wishlist;
        await user.save();

        const updatedUser = await User.findById(req.userId).populate('wishlist');
        res.json(updatedUser.wishlist);
    } catch (error) {
        console.error('Update Wishlist Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update Profile (Password only as per request)
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { password, name, email } = req.body;
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Note: name and email are excluded from updates as per user request, 
        // but we'll accept them in the body just for protocol.

        if (password) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
