const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { auth, authorize } = require('../middlewares/auth');

// Global role routes (Admin only)
router.get('/roles', auth, authorize('admin'), permissionController.getRolePermissions);
router.post('/roles', auth, authorize('admin'), permissionController.updateRolePermissions);

// Individual user routes (Admin or Vendor for their staff)
router.post('/user', auth, authorize('admin', 'vendor'), permissionController.updateUserPermissions);

module.exports = router;
