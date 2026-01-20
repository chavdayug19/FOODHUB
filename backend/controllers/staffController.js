const User = require('../models/User');
const Staff = require('../models/Staff');
const bcrypt = require('bcryptjs');

exports.getStaffByVendor = async (req, res) => {
    try {
        // req.user.vendorId is set by the auth middleware
        const staffMembers = await Staff.find({ vendor: req.user.vendorId })
            .populate('user', '-password') // Exclude password
            .sort({ joinedAt: -1 });

        res.json(staffMembers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createStaff = async (req, res) => {
    try {
        const { name, email, password, phone, position, shift } = req.body;
        const vendorId = req.user.vendorId;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create User (Plain text password enabled in User model as per previous steps, but we can hash if needed. 
        // The User model pre-save hook handles hashing if we set it, or we rely on the manual check.
        // Based on previous interaction, the user wanted to see passwords, so we store plain text or let the model handle it.
        // The previous edit to User.js disabled hashing in pre-save. So we store raw password for now.)

        // Note: In a real app, we should hash. But following user request to "see passwords".

        user = new User({
            name,
            email,
            password, // Stored as plain text per user request
            phone,
            role: 'staff',
            vendorId: vendorId,
            isActive: true
        });

        await user.save();

        // Create Staff Profile
        const staff = new Staff({
            user: user._id,
            vendor: vendorId,
            position: position || 'Staff',
            shift: shift || 'Morning'
        });

        await staff.save();

        res.status(201).json({ message: 'Staff member created successfully', staff });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
