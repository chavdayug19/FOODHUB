const Hub = require('../models/Hub');

exports.createHub = async (req, res) => {
  try {
    const hub = new Hub(req.body);
    await hub.save();
    res.status(201).json(hub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHubs = async (req, res) => {
  try {
    const hubs = await Hub.find();
    res.json(hubs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHubByQr = async (req, res) => {
  try {
    const hub = await Hub.findOne({ qrCode: req.params.qrCode });
    if (!hub) return res.status(404).json({ message: 'Hub not found' });
    res.json(hub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHubById = async (req, res) => {
  try {
    const hub = await Hub.findById(req.params.id);
    if (!hub) return res.status(404).json({ message: 'Hub not found' });
    res.json(hub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
