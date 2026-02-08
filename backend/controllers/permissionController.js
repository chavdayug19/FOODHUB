const RolePermission = require('../models/RolePermission');
const User = require('../models/User');

// Get all role permissions (for Admin)
exports.getRolePermissions = async (req, res) => {
    try {
        const permissions = await RolePermission.find();
        res.json(permissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update global role permissions (Admin only)
exports.updateRolePermissions = async (req, res) => {
    try {
        const { role, permissions } = req.body;
        let rolePerm = await RolePermission.findOne({ role });

        if (rolePerm) {
            rolePerm.permissions = { ...rolePerm.permissions, ...permissions };
            rolePerm.updatedBy = req.user.id;
            rolePerm.updatedAt = Date.now();
            await rolePerm.save();
        } else {
            rolePerm = new RolePermission({
                role,
                permissions,
                updatedBy: req.user.id
            });
            await rolePerm.save();
        }

        res.json(rolePerm);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update specific user permissions (Vendor for Staff, or Admin)
exports.updateUserPermissions = async (req, res) => {
    try {
        const { userId, permissions } = req.body;
        const userToUpdate = await User.findById(userId);

        if (!userToUpdate) return res.status(404).json({ message: 'User not found' });

        // Authorization check: 
        // Admin can update anyone. 
        // Vendor can only update staff belonging to their vendorId.
        if (req.user.role === 'vendor') {
            if (userToUpdate.vendorId.toString() !== req.user.vendorId.toString()) {
                return res.status(403).json({ message: 'Unauthorized to update this user' });
            }
        }

        userToUpdate.permissions = { ...userToUpdate.permissions, ...permissions };
        await userToUpdate.save();

        res.json(userToUpdate);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
