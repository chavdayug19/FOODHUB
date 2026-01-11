const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Hub = require('./models/Hub');
const Vendor = require('./models/Vendor');
const MenuItem = require('./models/MenuItem');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/qr_food_app')
  .then(() => console.log('MongoDB Connected for Seed'))
  .catch(err => console.log(err));

const seedData = async () => {
  try {
    // Clear existing data
    await Hub.deleteMany({});
    await Vendor.deleteMany({});
    await MenuItem.deleteMany({});
    await User.deleteMany({});

    // Create Hub
    const hub = await Hub.create({
      name: 'Downtown Food Court',
      location: '123 Main St',
      qrCode: 'hub-001'
    });
    console.log('Hub Created');

    // Create Vendors
    const vendor1 = await Vendor.create({ name: 'Burger King', hubId: hub._id });
    const vendor2 = await Vendor.create({ name: 'Pizza Hut', hubId: hub._id });
    const vendor3 = await Vendor.create({ name: 'Starbucks', hubId: hub._id });
    console.log('Vendors Created');

    // Create Menu Items
    const menuItems = [
      { vendorId: vendor1._id, name: 'Whopper', price: 5.99, category: 'Main', description: 'Flame-grilled beef patty' },
      { vendorId: vendor1._id, name: 'Fries', price: 2.99, category: 'Side', description: 'Crispy salted fries' },
      { vendorId: vendor2._id, name: 'Pepperoni Pizza', price: 12.99, category: 'Main', description: 'Classic pepperoni' },
      { vendorId: vendor3._id, name: 'Latte', price: 4.50, category: 'Drink', description: 'Espresso with steamed milk' },
      { vendorId: vendor3._id, name: 'Croissant', price: 3.50, category: 'Food', description: 'Buttery pastry' },
    ];
    await MenuItem.insertMany(menuItems);
    console.log('Menu Items Created');

    // Create Admin User
    await User.create({
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      name: 'Super Admin'
    });

    // Create Vendor Users
    await User.create({
      email: 'burger@example.com',
      password: 'password123',
      role: 'vendor',
      vendorId: vendor1._id,
      name: 'Burger King Manager'
    });

    console.log('Users Created');
    console.log('Database Seeded Successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
