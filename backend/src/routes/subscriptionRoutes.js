import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getMySubscription,
  requestUpgrade,
  submitPaymentReference,
} from '../controllers/subscriptionController.js';

const router = express.Router();

router.get('/my', protect, getMySubscription);
router.post('/request-upgrade', protect, requestUpgrade);
router.post('/submit-payment', protect, submitPaymentReference);

export default router;
