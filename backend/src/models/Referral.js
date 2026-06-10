import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  referreeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,  // each user can only be referred once
  },
  referralCode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  rewardGiven: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

export const Referral = mongoose.model('Referral', referralSchema);
