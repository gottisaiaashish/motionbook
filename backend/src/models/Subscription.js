import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true,
  },
  status: {
    type: String,
    enum: ['demo', 'active', 'expired', 'referral_reward', 'cancelled'],
    default: 'demo',
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  // Storage & usage tracking
  storageUsedBytes: { type: Number, default: 0 },
  photosUploaded: { type: Number, default: 0 },
  // Payment reference (for paid plans)
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null,
  },
}, { timestamps: true });

// Virtual: days remaining
subscriptionSchema.virtual('daysRemaining').get(function () {
  const now = new Date();
  const diff = this.endDate - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// Virtual: isExpired
subscriptionSchema.virtual('isExpired').get(function () {
  return new Date() > this.endDate;
});

subscriptionSchema.set('toJSON', { virtuals: true });
subscriptionSchema.set('toObject', { virtuals: true });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
