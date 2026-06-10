import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  coverImageUrl: {
    type: String,
  },
  type: {
    type: String,
    enum: ['personal', 'wedding', 'client'],
    default: 'personal',
  },
  isShared: {
    type: Boolean,
    default: false,
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Album = mongoose.model('Album', albumSchema);
