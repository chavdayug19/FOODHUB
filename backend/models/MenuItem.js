const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  availability: { type: Boolean, default: true },
  imageUrl: { type: String },
  category: { type: String }, // e.g., 'Main', 'Drink', 'Dessert'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
