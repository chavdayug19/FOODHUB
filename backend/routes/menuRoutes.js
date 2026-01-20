const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { auth, authorize } = require('../middlewares/auth');

router.post('/', auth, authorize('vendor', 'admin'), menuController.createMenuItem);
router.get('/', menuController.getMenuItems);
router.put('/:id', auth, authorize('vendor', 'admin'), menuController.updateMenuItem);
router.delete('/:id', auth, authorize('vendor', 'admin'), menuController.deleteMenuItem);

module.exports = router;
