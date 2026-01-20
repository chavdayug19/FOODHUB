const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Staff = require('../models/Staff');

exports.register = async (req, res) => {
  try {
    const { email, password, role, vendorId, name, phone, hubId, vendorName } = req.body;

    // Log for debugging
    console.log('Registering user:', { email, role, vendorId, name, phone, hubId, vendorName });

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create Base User
    user = new User({ email, password, role, name, phone, isActive: true });

    // Vendor Registration Logic
    if (role === 'vendor') {
      if (!hubId || !vendorName) {
        return res.status(400).json({ message: 'Hub and Vendor Name are required for Vendor registration' });
      }
      // Create the Vendor Entity
      const newVendor = new Vendor({
        name: vendorName,
        hubId: hubId,
        // ownerId: user._id // Assuming Vendor model might need ownerId, or we link via user.vendorId
      });
      await newVendor.save();
      user.vendorId = newVendor._id;
    }
    // Staff Registration Logic
    else if (role === 'staff') {
      if (!vendorId) {
        return res.status(400).json({ message: 'Vendor is required for Staff registration' });
      }
      user.vendorId = vendorId; // Link User to Vendor
    }
    // Customer Logic (default)

    await user.save();

    // specific post-creation logic (like creating Staff document)
    if (role === 'staff') {
      try {
        await Staff.create({
          user: user._id,
          vendor: vendorId,
          position: 'Staff'
        });
      } catch (staffErr) {
        console.error('Error creating Staff profile:', staffErr);
        // Continue, as User is created. Ideally should use transaction.
      }
    }

    const payload = {
      userId: user._id,
      role: user.role,
      vendorId: user.vendorId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user._id, email, role, name, vendorId: user.vendorId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email });
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
    }

    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      userId: user._id,
      role: user.role,
      vendorId: user.vendorId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, email, role: user.role, vendorId: user.vendorId, name: user.name } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
