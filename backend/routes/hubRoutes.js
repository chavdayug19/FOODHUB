const express = require('express');
const router = express.Router();
const hubController = require('../controllers/hubController');
const { auth, authorize } = require('../middlewares/auth');

router.post('/', auth, authorize('admin'), hubController.createHub);
router.get('/', hubController.getHubs);
router.get('/qr/:qrCode', hubController.getHubByQr);
router.get('/:id', hubController.getHubById);

module.exports = router;
