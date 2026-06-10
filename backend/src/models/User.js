import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'photographer', 'admin'],
    default: 'user',
  },
  // Referral system
  referralCode: { type: String, unique: true, sparse: true }, // auto-generated on signup
  referredBy: { type: String, default: null },                 // referral code used at signup
  // Profile extras
  phone: { type: String, default: null },
  phoneVerified: { type: Boolean, default: false },
  // Admin controls
  isBlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model('User', userSchema);
