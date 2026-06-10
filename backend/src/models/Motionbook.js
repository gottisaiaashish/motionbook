import mongoose from 'mongoose';

const motionbookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  imagePublicId: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  videoPublicId: {
    type: String,
    required: true,
  },
  // Perceptual hash (dHash) of the trigger image — used for camera recognition
  pHash: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
    index: true,
  },
  // Storage tracking — image bytes + video bytes from Cloudinary
  fileSizeBytes: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Motionbook = mongoose.model('Motionbook', motionbookSchema);
