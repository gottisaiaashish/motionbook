import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  planKey: {
    type: String,
    required: true,
    unique: true,
    // e.g. 'demo', 'spark', 'memories', 'forever', 'creator', 'pro_studio', 'elite_studio', 'mini_referral'
  },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['user', 'photographer', 'demo', 'referral'],
    required: true,
  },
  price: { type: Number, required: true, default: 0 },   // INR
  maxAlbums: { type: Number, required: true },
  maxPhotos: { type: Number, required: true },            // total across all albums
  maxStorageBytes: { type: Number, required: true },      // bytes
  maxVideoSizeMB: { type: Number, default: 0 },           // 0 = no limit per video
  validityDays: { type: Number, required: true },         // 7 demo, 30 referral, 3650 paid
  features: [String],                                     // display bullets
  hasFamilySharing: { type: Boolean, default: false },
  hasAnalytics: { type: Boolean, default: false },
  hasPhotographerDashboard: { type: Boolean, default: false },
  hasPrioritySupport: { type: Boolean, default: false },
  hasWatermark: { type: Boolean, default: false },        // true for referral plan only
  icon: { type: String, default: '📦' },
  badge: { type: String, default: '' },                   // 'Popular', 'Best Value', 'Enterprise'
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

export const Plan = mongoose.model('Plan', planSchema);

// ── Default plan seed data (used by server.js auto-seed) ─────────────────────
export const DEFAULT_PLANS = [
  {
    planKey: 'demo',
    name: 'Free Demo',
    type: 'demo',
    price: 0,
    maxAlbums: 1,
    maxPhotos: 1,
    maxStorageBytes: 200 * 1024 * 1024,         // 200 MB
    maxVideoSizeMB: 0,
    validityDays: 7,
    features: ['1 Demo Album', '1 Photo Upload', '1 Video Upload', '7 Days Access', 'AR Scan Enabled'],
    icon: '🎁', badge: '', sortOrder: 0,
  },
  {
    planKey: 'mini_referral',
    name: 'MotionBook Mini',
    type: 'referral',
    price: 499,
    maxAlbums: 1,
    maxPhotos: 10,
    maxStorageBytes: 500 * 1024 * 1024,          // 500 MB
    maxVideoSizeMB: 50,
    validityDays: 30,
    hasWatermark: true,
    features: ['1 Album', '10 Photos', '10 Videos', 'Max 50 MB Per Video', '30 Days Access', 'MotionBook Watermark'],
    icon: '🎁', badge: 'Referral Reward', sortOrder: 1,
  },
  // ── User Plans ──
  {
    planKey: 'spark',
    name: 'MotionBook Spark',
    type: 'user',
    price: 999,
    maxAlbums: 1,
    maxPhotos: 100,
    maxStorageBytes: 5 * 1024 * 1024 * 1024,     // 5 GB
    validityDays: 3650,
    features: ['1 Album', '100 Photos', '5 GB Storage', 'AR Scan Enabled', '10 Years Access'],
    icon: '⚡', badge: '', sortOrder: 2,
  },
  {
    planKey: 'memories',
    name: 'MotionBook Memories',
    type: 'user',
    price: 2499,
    maxAlbums: 2,
    maxPhotos: 300,
    maxStorageBytes: 15 * 1024 * 1024 * 1024,    // 15 GB
    validityDays: 3650,
    features: ['2 Albums', '300 Photos', '15 GB Storage', 'AR Scan Enabled', '10 Years Access'],
    icon: '📖', badge: 'Popular', sortOrder: 3,
  },
  {
    planKey: 'forever',
    name: 'MotionBook Forever',
    type: 'user',
    price: 4999,
    maxAlbums: 1,
    maxPhotos: 500,
    maxStorageBytes: 50 * 1024 * 1024 * 1024,    // 50 GB
    hasFamilySharing: true,
    validityDays: 3650,
    features: ['1 Wedding Album', '500 Photos', '50 GB Storage', 'Family Sharing', 'AR Scan Enabled', '10 Years Access'],
    icon: '💎', badge: 'Best Value', sortOrder: 4,
  },
  // ── Photographer Plans ──
  {
    planKey: 'creator',
    name: 'MotionBook Creator',
    type: 'photographer',
    price: 7999,
    maxAlbums: 5,
    maxPhotos: 500,
    maxStorageBytes: 50 * 1024 * 1024 * 1024,    // 50 GB
    hasPhotographerDashboard: true,
    validityDays: 3650,
    features: ['5 Client Albums', '50 GB Total Storage', 'Photographer Dashboard', 'AR Scan Enabled', '10 Years Access'],
    icon: '🎥', badge: '', sortOrder: 5,
  },
  {
    planKey: 'pro_studio',
    name: 'MotionBook Pro Studio',
    type: 'photographer',
    price: 24999,
    maxAlbums: 20,
    maxPhotos: 5000,
    maxStorageBytes: 250 * 1024 * 1024 * 1024,   // 250 GB
    hasAnalytics: true,
    hasPhotographerDashboard: true,
    validityDays: 3650,
    features: ['20 Client Albums', '250 GB Total Storage', 'Analytics Dashboard', 'Photographer Dashboard', 'AR Scan Enabled', '10 Years Access'],
    icon: '🚀', badge: 'Popular', sortOrder: 6,
  },
  {
    planKey: 'elite_studio',
    name: 'MotionBook Elite Studio',
    type: 'photographer',
    price: 79999,
    maxAlbums: 100,
    maxPhotos: 100000,
    maxStorageBytes: 1024 * 1024 * 1024 * 1024,  // 1 TB
    hasAnalytics: true,
    hasPhotographerDashboard: true,
    hasPrioritySupport: true,
    validityDays: 3650,
    features: ['100 Client Albums', '1 TB Total Storage', 'Advanced Analytics', 'Priority Support', 'Photographer Dashboard', 'AR Scan Enabled', '10 Years Access'],
    icon: '👑', badge: 'Enterprise', sortOrder: 7,
  },
];
