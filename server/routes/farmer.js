const express = require('express');
const router = express.Router();
const FarmerProfile = require('../models/FarmerProfile');
const User = require('../models/User');

// Submit Farmer Registration
router.post('/register', async (req, res) => {
    try {
        const { email } = req.body;
        console.log(`Farmer Register Request for: ${email}`);

        const normalizedEmail = email.toLowerCase();

        // Find if profile exists for this email
        let profile = await FarmerProfile.findOne({ email: normalizedEmail });

        if (profile) {
            console.log(`Updating existing profile for: ${normalizedEmail}`);
            profile = await FarmerProfile.findOneAndUpdate(
                { email: normalizedEmail },
                { ...req.body, email: normalizedEmail },
                { new: true }
            );
        } else {
            console.log(`Creating new profile for: ${normalizedEmail}`);
            profile = new FarmerProfile({
                ...req.body,
                email: normalizedEmail,
                status: 'pending'
            });
            await profile.save();
        }

        console.log('Farmer Profile saved successfully');
        res.status(200).json({ message: 'Documents submitted successfully', data: profile });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update status (for dashboard)
router.get('/status/:email', async (req, res) => {
    try {
        const profile = await FarmerProfile.findOne({ email: req.params.email });
        res.json({
            status: profile ? profile.status : 'pending',
            rejectionReason: profile ? profile.rejectionReason : null
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
