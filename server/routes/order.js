const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');
const { verifyToken } = require('../middleware/auth');

const Notification = require('../models/Notification');
const Product = require('../models/Product');

// Create a new order
router.post('/', verifyToken, async (req, res) => {
    try {
        const { items, shippingAddress, subtotal, shippingCharges, totalAmount } = req.body;

        const order = new Order({
            user: req.userId,
            items,
            shippingAddress,
            subtotal,
            shippingCharges,
            totalAmount
        });

        await order.save();

        // Clear user's cart after order placement
        await User.findByIdAndUpdate(req.userId, { cart: [] });

        // Notify and Log Activity for Farmers
        // Ensure farmerIds are strings for Set uniqueness, then use them
        const uniqueFarmerIds = [...new Set(items.map(item => String(item.farmer)))];
        console.log('Order created. Items:', items);
        console.log('Notifying unique farmers:', uniqueFarmerIds);

        for (const farmerId of uniqueFarmerIds) {
            try {
                // 1. Message Box Notification
                console.log(`Creating Order notification for farmer: ${String(farmerId)}`);
                const notification = new Notification({
                    recipient: farmerId,
                    message: `New Order Received (${order._id.slice(-8)}). Details available in Orders tab.`,
                    type: 'Order',
                    orderId: order._id
                });
                await notification.save();
                console.log(`Order notification saved for ${farmerId}`);

                // 2. Activity History Log
                console.log(`Creating Activity notification for farmer: ${farmerId}`);
                const historyEntry = new Notification({
                    recipient: farmerId,
                    message: `Order #${order._id.slice(-8)} placed by ${shippingAddress.name}. Please pack and handover to delivery agent within 24-48 hrs.`,
                    type: 'Activity',
                    orderId: order._id
                });
                await historyEntry.save();
                console.log(`Activity notification saved for ${farmerId}`);

            } catch (err) {
                console.error('Error notifying farmer:', farmerId, err);
            }
        }

        res.status(201).json(order);
    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update order status
router.put('/:id/status', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Update status
        const oldStatus = order.status;
        order.status = status;
        await order.save();

        // Notify User
        let userMessage = `Your order ${order._id.slice(-8)} status has been updated to ${status}.`;
        if (status === 'Packed') {
            userMessage = `Great news! Your order ${order._id.slice(-8)} has been packed and sent to the delivery agent.`;
        }

        const userNotification = new Notification({
            recipient: order.user,
            message: userMessage,
            type: status === 'Packed' ? 'Packing' : 'Order',
            orderId: order._id
        });
        await userNotification.save();

        // Log Activity for Farmers
        const uniqueFarmerIds = [...new Set(order.items.map(item => item.farmer.toString()))];
        for (const farmerId of uniqueFarmerIds) {
            try {
                const historyEntry = new Notification({
                    recipient: farmerId,
                    message: `Order #${order._id.slice(-8)}: Status changed from ${oldStatus} to ${status}.`,
                    type: 'Activity',
                    orderId: order._id
                });
                await historyEntry.save();
            } catch (err) {
                console.error('Error logging activity for farmer:', farmerId, err);
            }
        }

        res.json(order);
    } catch (error) {
        console.error('Update Order Status Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get notifications for logged-in user
router.get('/notifications', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole ? req.userRole.toLowerCase() : '';

        // Initial fetch
        let notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(50);

        // Advanced Self-Healing Sync for Farmers
        if (userRole === 'farmer') {
            console.log(`Starting Self-Healing Sync for Farmer: ${userId}`);

            // 1. Find all products belonging to this farmer
            const myProducts = await Product.find({ farmerId: userId }).select('_id');
            const myProductIds = myProducts.map(p => p._id.toString());

            if (myProductIds.length > 0) {
                // 2. Find ALL orders that contain these products
                // This effectively finds orders even if 'items.farmer' is currently wrong
                const relevantOrders = await Order.find({
                    'items.product': { $in: myProductIds }
                });

                console.log(`Found ${relevantOrders.length} potential orders for this farmer.`);

                let syncNeeded = false;

                for (const order of relevantOrders) {
                    // 3. REPAIR ORDER DATA if needed
                    let orderModified = false;
                    order.items.forEach(item => {
                        if (item.product && myProductIds.includes(item.product.toString())) {
                            // Check if farmer ID is correct
                            if (item.farmer.toString() !== userId) {
                                console.log(`Repairing Order ${order._id}: Item ${item.product} had farmer ${item.farmer}, setting to ${userId}`);
                                item.farmer = userId;
                                orderModified = true;
                            }
                        }
                    });

                    if (orderModified) {
                        await order.save();
                        console.log(`Order ${order._id} repaired and saved.`);
                    }

                    // 4. Generate Missing Notifications
                    // Check for Activity entry
                    const existingActivity = await Notification.findOne({
                        recipient: userId,
                        orderId: order._id,
                        type: 'Activity'
                    });

                    if (!existingActivity) {
                        await new Notification({
                            recipient: userId,
                            message: `System History: Order #${order._id.slice(-8)} found (Status: ${order.status}).`,
                            type: 'Activity',
                            orderId: order._id,
                            createdAt: order.createdAt
                        }).save();
                        syncNeeded = true;
                        console.log(`Created missing Activity for Order ${order._id}`);
                    }

                    // Check for Message entry
                    const existingMessage = await Notification.findOne({
                        recipient: userId,
                        orderId: order._id,
                        type: 'Order'
                    });

                    if (!existingMessage) {
                        await new Notification({
                            recipient: userId,
                            message: `Order Notification: You have an order (${order._id.slice(-8)}) from ${order.shippingAddress.name}.`,
                            type: 'Order',
                            orderId: order._id,
                            createdAt: order.createdAt
                        }).save();
                        syncNeeded = true;
                        console.log(`Created missing Message for Order ${order._id}`);
                    }
                }

                if (syncNeeded) {
                    // Refetch notifications if we created new ones
                    notifications = await Notification.find({ recipient: userId })
                        .sort({ createdAt: -1 })
                        .limit(50);
                }
            }
        }

        res.json(notifications);
    } catch (error) {
        console.error('Fetch Notifications Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Mark notification as read
router.put('/notifications/:id/read', verifyToken, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get orders for logged-in user
router.get('/my-orders', verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.userId })
            .populate('items.product')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Fetch User Orders Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get orders for logged-in farmer
router.get('/farmer-orders', verifyToken, async (req, res) => {
    try {
        // Find orders where at least one item belongs to this farmer
        const orders = await Order.find({ 'items.farmer': req.userId })
            .populate('items.product')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        // Filter items in each order to only show those belonging to the farmer
        const filteredOrders = orders.map(order => {
            const orderObj = order.toObject();
            orderObj.items = orderObj.items.filter(item => item.farmer.toString() === req.userId);
            return orderObj;
        });

        res.json(filteredOrders);
    } catch (error) {
        console.error('Fetch Farmer Orders Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all orders (Admin)
router.get('/all', verifyToken, async (req, res) => {
    try {
        // Basic check for admin role (could be improved)
        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product')
            .populate('items.farmer', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Fetch All Orders Error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
