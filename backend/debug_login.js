const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Test JWT
require('dotenv').config();

const run = async () => {
    try {
        await connectDB();
        console.log('DB Connected');

        const users = await User.find({});
        if (users.length > 0) {
            const u = users[users.length - 1];

            // Test JWT signing
            const payload = {
                userId: u._id,
                role: u.role,
                vendorId: u.vendorId
            };
            console.log('Testing JWT sign with payload:', payload);

            try {
                const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
                console.log('JWT Generated successfully:', token.substring(0, 20) + '...');
            } catch (jwtErr) {
                console.error('JWT Signing Failed:', jwtErr);
            }
        }
    } catch (e) {
        console.error('Debug Error:', e);
    }
    process.exit();
};

run();
