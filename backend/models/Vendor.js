const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub', required: true },
  description: { type: String },
  logo: { type: String },
  tables: [{
    tableNo: { type: String, required: true },
    qrCode: { type: String } // Optional: Store the generated URL string
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vendor', VendorSchema);
