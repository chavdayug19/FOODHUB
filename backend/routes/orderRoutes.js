const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { z } = require('zod');

const createOrderSchema = z.object({
  hubId: z.string(),
  vendorOrders: z.array(z.object({
    vendorId: z.string(),
    items: z.array(z.object({
      menuItemId: z.string(),
      quantity: z.number().min(1)
    }))
  })),
  customerName: z.string().min(1),
  tableInfo: z.string().min(1)
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'preparing', 'ready', 'completed', 'cancelled'])
});

router.post('/', validate(createOrderSchema), orderController.createOrder); // Public (Customers)
router.get('/', auth, authorize('vendor', 'admin'), orderController.getOrders);
router.get('/:id', orderController.getOrderById); // Public for tracking (or secured if using session)
router.put('/:orderId/vendor/:vendorId/status', auth, authorize('vendor'), validate(updateStatusSchema), orderController.updateOrderStatus);

module.exports = router;
