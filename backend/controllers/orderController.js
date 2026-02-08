const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Vendor = require('../models/Vendor');

exports.createOrder = async (req, res) => {
  try {
    const { hubId, vendorOrders, customerName, tableInfo } = req.body;

    if (!hubId) return res.status(400).json({ message: 'Hub ID is required' });
    if (!vendorOrders || vendorOrders.length === 0) return res.status(400).json({ message: 'No vendor orders provided' });

    // 1. Verify and recalculate totals from DB
    // We expect vendorOrders to contain: [{ vendorId, items: [{ menuItemId, quantity }] }]

    let recalculatedVendorOrders = [];
    let grandTotal = 0;

    for (const vo of vendorOrders) {
      let vendorTotal = 0;
      let recalculatedItems = [];

      // Fetch vendor name
      const vendor = await Vendor.findById(vo.vendorId);
      const vendorName = vendor ? vendor.name : 'Unknown Vendor';

      for (const item of vo.items) {
        const dbItem = await MenuItem.findById(item.menuItemId);
        if (!dbItem) {
          return res.status(400).json({ message: `Menu item not found: ${item.menuItemId}` });
        }

        // Ensure price matches DB
        const itemTotal = dbItem.price * item.quantity;
        vendorTotal += itemTotal;

        recalculatedItems.push({
          menuItemId: dbItem._id,
          name: dbItem.name,
          price: dbItem.price,
          quantity: item.quantity
        });
      }

      grandTotal += vendorTotal;
      recalculatedVendorOrders.push({
        vendorId: vo.vendorId,
        vendorName: vendorName, // Add vendor name
        items: recalculatedItems,
        subtotal: vendorTotal, // Changed from totalAmount to subtotal
        status: 'pending'
      });
    }

    const order = new Order({
      hubId,
      vendorOrders: recalculatedVendorOrders,
      totalAmount: grandTotal,
      customerName,
      tableInfo,
      status: 'pending'
    });

    await order.save();

    // Notify vendors via Socket.IO
    const io = req.app.get('io');
    order.vendorOrders.forEach(vo => {
      io.to(`vendor:${vo.vendorId}`).emit('order:new', {
        orderId: order._id,
        vendorOrder: vo,
        customerName: order.customerName,
        tableInfo: order.tableInfo
      });
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const filter = {};
    // If vendor, only show orders containing their items
    if (req.user.role === 'vendor' && req.user.vendorId) {
      // This query is a bit complex because we need to filter the sub-array in the response or query level.
      // For simplicity, we find orders where 'vendorOrders.vendorId' matches.
      filter['vendorOrders.vendorId'] = req.user.vendorId;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    // Convert to plain objects so we can modify them
    const ordersObj = orders.map(order => order.toObject());

    // Populate vendor names if missing (for backward compatibility)
    for (let order of ordersObj) {
      for (let vendorOrder of order.vendorOrders) {
        if (!vendorOrder.vendorName) {
          const vendor = await Vendor.findById(vendorOrder.vendorId);
          vendorOrder.vendorName = vendor ? vendor.name : 'Unknown Vendor';
        }
        // Ensure subtotal is set
        if (!vendorOrder.subtotal && vendorOrder.totalAmount) {
          vendorOrder.subtotal = vendorOrder.totalAmount;
        }
      }
    }

    res.json(ordersObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, vendorId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Update the specific vendor sub-order
    const vendorOrder = order.vendorOrders.find(vo => vo.vendorId.toString() === vendorId);
    if (!vendorOrder) return res.status(404).json({ message: 'Vendor order not found in this order' });

    vendorOrder.status = status;

    // Check if we need to update the main order status
    const allCompleted = order.vendorOrders.every(vo => vo.status === 'completed');
    if (allCompleted) order.status = 'completed';
    else if (status === 'preparing' || status === 'ready') order.status = 'in-progress';

    await order.save();

    // Notify customer
    const io = req.app.get('io');
    io.to(`order:${order._id}`).emit('order:status_change', {
      orderId: order._id,
      vendorId,
      status
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Convert to plain object so we can modify it
    const orderObj = order.toObject();

    // Populate vendor names if missing (for backward compatibility with old orders)
    for (let vendorOrder of orderObj.vendorOrders) {
      if (!vendorOrder.vendorName) {
        const vendor = await Vendor.findById(vendorOrder.vendorId);
        vendorOrder.vendorName = vendor ? vendor.name : 'Unknown Vendor';
      }
      // Ensure subtotal is set (for backward compatibility)
      if (!vendorOrder.subtotal && vendorOrder.totalAmount) {
        vendorOrder.subtotal = vendorOrder.totalAmount;
      }
    }

    res.json(orderObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
