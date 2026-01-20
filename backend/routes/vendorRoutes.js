const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { auth, authorize } = require('../middlewares/auth');

router.post('/', auth, authorize('admin'), vendorController.createVendor);
router.get('/', vendorController.getVendors);
router.get('/:id', vendorController.getVendorById);
router.put('/:id', auth, authorize('vendor', 'admin'), vendorController.updateVendor);
router.delete('/:id', auth, authorize('admin'), vendorController.deleteVendor);

module.exports = router;
