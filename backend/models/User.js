const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'vendor', 'customer', 'staff'], required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }, // Required if role is vendor
  name: { type: String },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// UserSchema.pre('save', async function () {
//   if (!this.isModified('password')) return;
//   this.password = await bcrypt.hash(this.password, 10);
// });

UserSchema.methods.comparePassword = async function (candidatePassword) {
  // Allow plain text comparison first (for "seen" passwords)
  if (this.password === candidatePassword) {
    return true;
  }
  // Fallback to bcrypt for existing hashed passwords
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    // If it's not a valid bcrypt hash, and the direct comparison failed, it's a mismatch
    return false;
  }
};

module.exports = mongoose.model('User', UserSchema);
