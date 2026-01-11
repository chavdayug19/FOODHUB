const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { auth, authorize } = require('../middlewares/auth');

router.post('/', auth, authorize('vendor', 'admin'), menuController.createMenuItem);
router.get('/', menuController.getMenuItems);

module.exports = router;
