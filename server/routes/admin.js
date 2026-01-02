const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const jwt = require('jsonwebtoken');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied, admin only' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Get all farmers with their profile status
router.get('/farmers', isAdmin, async (req, res) => {
    try {
        // Find all profiles
        const profiles = await FarmerProfile.find().sort({ submittedAt: -1 });
        const farmerUsers = await User.find({ role: 'farmer' }).select('-password');

        console.log(`Debug Admin Farmers: Found ${profiles.length} profiles and ${farmerUsers.length} farmer users`);

        let allFarmers = profiles.map(p => p.toObject());
        const profileEmails = new Set(profiles.map(p => p.email.toLowerCase()));

        farmerUsers.forEach(user => {
            if (!profileEmails.has(user.email.toLowerCase())) {
                allFarmers.push({
                    _id: 'no-profile-' + user._id,
                    userId: user._id,
                    name: user.name,
                    email: user.email,
                    status: 'incomplete',
                    submittedAt: user.createdAt,
                    incomplete: true
                });
            }
        });

        console.log(`Debug Admin Farmers: Returning ${allFarmers.length} total farmers:`, JSON.stringify(allFarmers));
        res.json(allFarmers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/farmers/:id/status', isAdmin, async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updateData = { status };
        if (rejectionReason) updateData.rejectionReason = rejectionReason;

        let farmerId = req.params.id;
        let profile;

        if (farmerId.startsWith('no-profile-')) {
            const userId = farmerId.replace('no-profile-', '');
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: 'User not found' });

            // Create a basic skeleton profile to store the status
            profile = new FarmerProfile({
                userId: user._id,
                email: user.email,
                name: user.name,
                phone: 'N/A',
                address: 'N/A',
                state: 'N/A',
                district: 'N/A',
                farmSize: 'N/A',
                crops: 'N/A',
                experience: '0',
                ...updateData
            });
            await profile.save();
        } else {
            profile = await FarmerProfile.findByIdAndUpdate(
                farmerId,
                updateData,
                { new: true }
            );
        }

        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Get all orders
router.get('/orders', isAdmin, async (req, res) => {
    try {
        const Order = require('../models/Order');
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product')
            .populate('items.farmer', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error('Admin Orders Fetch Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
