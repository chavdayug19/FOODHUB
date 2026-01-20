const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { auth, authorize } = require('../middlewares/auth');

// Apply auth middleware to all routes
router.use(auth);

// Only Vendor (Owner) or Admin can manage staff
// Assuming 'vendor' role implies Owner privileges for now, or we check specifically
router.get('/', authorize('vendor', 'admin'), staffController.getStaffByVendor);
router.post('/', authorize('vendor', 'admin'), staffController.createStaff);

module.exports = router;
