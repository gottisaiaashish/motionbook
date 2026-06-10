import express from 'express';
import { getPlans, getPlanByKey, updatePlan } from '../controllers/planController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

router.get('/', getPlans);
router.get('/:key', getPlanByKey);
router.put('/:id', adminAuth, updatePlan);

export default router;
