const mongoose = require('mongoose');

const FarmerProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    farmSize: { type: String, required: true },
    crops: { type: String, required: true },
    experience: { type: String, required: true },
    description: { type: String },
    aadhaarProof: { type: String }, // Base64 or URL
    landDocProof: { type: String }, // Base64 or URL
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String },
    submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FarmerProfile', FarmerProfileSchema);
