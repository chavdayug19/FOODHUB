const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  hubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub', required: true },

  // Array of sub-orders per vendor
  vendorOrders: [{
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    items: [{
      menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
      name: { type: String, required: true }, // Snapshot of name
      price: { type: Number, required: true }, // Snapshot of price
      quantity: { type: Number, required: true, default: 1 }
    }],
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
      default: 'pending'
    },
    totalAmount: { type: Number, required: true }
  }],

  totalAmount: { type: Number, required: true },
  customerSocketId: { type: String }, // For realtime updates back to the specific customer session
  customerName: { type: String },
  tableInfo: { type: String }, // Optional table/seat number

  // Overall status (aggregated)
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
