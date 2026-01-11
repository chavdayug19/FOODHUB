const mongoose = require('mongoose');

const HubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  qrCode: { type: String, unique: true, required: true }, // Identifier string for the QR
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hub', HubSchema);
