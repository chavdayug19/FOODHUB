const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    position: { type: String, default: 'Staff' },
    shift: { type: String },
    joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Staff', StaffSchema);
