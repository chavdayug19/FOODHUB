const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { auth, authorize } = require('../middlewares/auth');

router.post('/', auth, authorize('admin'), vendorController.createVendor);
router.get('/', vendorController.getVendors);
router.get('/:id', vendorController.getVendorById);

module.exports = router;
