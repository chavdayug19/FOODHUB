require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const socketHandler = require('./sockets');

const authRoutes = require('./routes/authRoutes');
const hubRoutes = require('./routes/hubRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hubs', hubRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/menu-items', menuRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/staff', require('./routes/staffRoutes'));

// Socket.io
socketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
