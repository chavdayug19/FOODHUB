const MenuItem = require('../models/MenuItem');

exports.createMenuItem = async (req, res) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMenuItems = async (req, res) => {
  try {
    const filter = {};
    if (req.query.vendorId) filter.vendorId = req.query.vendorId;

    const menuItems = await MenuItem.find(filter);
    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
