module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join room for a specific vendor
    socket.on('join:vendor', (vendorId) => {
      socket.join(`vendor:${vendorId}`);
      console.log(`Socket ${socket.id} joined vendor:${vendorId}`);
    });

    // Join room for a specific customer (for order updates)
    // Actually we can just use socket.id, but maybe we want a dedicated room
    socket.on('join:order', (orderId) => {
        socket.join(`order:${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
