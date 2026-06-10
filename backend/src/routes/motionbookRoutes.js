import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import { checkSubscriptionLimits } from '../middleware/checkSubscription.js';
import {
  uploadMotionbook,
  scanImage,
  getUserMotionbooks,
  deleteMotionbook,
} from '../controllers/motionbookController.js';

const router = express.Router();

// Multer — memory storage (buffers go to Cloudinary directly)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max per file
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files allowed for the trigger photo'));
      }
    }
    if (file.fieldname === 'video') {
      if (!file.mimetype.startsWith('video/')) {
        return cb(new Error('Only video files allowed'));
      }
    }
    cb(null, true);
  },
});

// Upload a photo + video pair (auth + subscription limits enforced)
router.post(
  '/upload',
  protect,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ]),
  checkSubscriptionLimits,
  uploadMotionbook
);

// Scan a camera frame and find a match (public)
router.post('/scan', scanImage);

// Get all of the current user's motionbooks (auth required)
router.get('/my', protect, getUserMotionbooks);

// Delete a motionbook by ID (auth required)
router.delete('/:id', protect, deleteMotionbook);

export default router;
