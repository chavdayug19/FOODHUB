const mongoose = require('mongoose');

const RolePermissionSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['vendor', 'staff'],
        required: true,
        unique: true
    },
    permissions: {
        view_dashboard: { type: Boolean, default: false },
        manage_menu: { type: Boolean, default: false },
        manage_staff: { type: Boolean, default: false },
        view_orders: { type: Boolean, default: true },
        update_order_status: { type: Boolean, default: true },
        view_analytics: { type: Boolean, default: false },
        manage_qr_codes: { type: Boolean, default: false }
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RolePermission', RolePermissionSchema);
