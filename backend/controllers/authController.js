const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { email, password, role, vendorId, name } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ email, password, role, vendorId, name, isActive: true });
    await user.save();

    const payload = {
      userId: user._id,
      role: user.role,
      vendorId: user.vendorId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user._id, email, role, name } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      userId: user._id,
      role: user.role,
      vendorId: user.vendorId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, email, role, vendorId: user.vendorId, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
