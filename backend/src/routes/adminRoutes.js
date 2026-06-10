import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import {
  adminLogin,
  getStats,
  getUsers,
  toggleBlockUser,
  assignPlan,
  getOrders,
  approveOrder,
  rejectOrder,
  getAdminPlans,
  getReferrals,
} from '../controllers/adminController.js';

const router = express.Router();

// Public
router.post('/login', adminLogin);

// Protected (admin JWT required)
router.get('/stats', adminAuth, getStats);
router.get('/users', adminAuth, getUsers);
router.put('/users/:id/block', adminAuth, toggleBlockUser);
router.put('/users/:id/assign-plan', adminAuth, assignPlan);
router.get('/orders', adminAuth, getOrders);
router.put('/orders/:id/approve', adminAuth, approveOrder);
router.put('/orders/:id/reject', adminAuth, rejectOrder);
router.get('/plans', adminAuth, getAdminPlans);
router.get('/referrals', adminAuth, getReferrals);

export default router;
