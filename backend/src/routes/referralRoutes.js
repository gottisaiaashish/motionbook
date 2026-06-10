import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMyReferral, claimReferralReward } from '../controllers/referralController.js';

const router = express.Router();

router.get('/my', protect, getMyReferral);
router.post('/claim-reward', protect, claimReferralReward);

export default router;
