import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { Order } from '../models/Order.js';
import { Plan } from '../models/Plan.js';
import { Referral } from '../models/Referral.js';
import { Motionbook } from '../models/Motionbook.js';
import { activateSubscription } from './subscriptionController.js';

const adminToken = (email) =>
  jwt.sign({ admin: true, email }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '7d',
  });

/** POST /api/admin/login */
export const adminLogin = (req, res) => {
  const { email, password } = req.body;
  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }
  res.json({ token: adminToken(email), email });
};

/** GET /api/admin/stats */
export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalMotionbooks, activeSubscriptions, pendingOrders] =
      await Promise.all([
        User.countDocuments({ role: { $ne: 'admin' } }),
        Motionbook.countDocuments(),
        Subscription.countDocuments({ status: { $in: ['active', 'demo', 'referral_reward'] } }),
        Order.countDocuments({ status: 'pending_payment' }),
      ]);

    // Total revenue from approved orders
    const revenueAgg = await Order.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Order.aggregate([
      { $match: { status: 'approved', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$amount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Plan distribution
    const planDistribution = await Subscription.aggregate([
      { $match: { status: { $in: ['active', 'demo', 'referral_reward'] } } },
      { $group: { _id: '$planId', count: { $sum: 1 } } },
      { $lookup: { from: 'plans', localField: '_id', foreignField: '_id', as: 'plan' } },
      { $unwind: '$plan' },
      { $project: { planName: '$plan.name', planKey: '$plan.planKey', count: 1 } },
    ]);

    // New users last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      role: { $ne: 'admin' },
    });

    res.json({
      totalUsers,
      totalMotionbooks,
      activeSubscriptions,
      pendingOrders,
      totalRevenue,
      newUsersThisMonth,
      monthlyRevenue,
      planDistribution,
    });
  } catch (error) {
    console.error('admin getStats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

/** GET /api/admin/users?search=&plan=&page=&limit= */
export const getUsers = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const query = { role: { $ne: 'admin' } };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    // Attach subscription info to each user
    const userIds = users.map((u) => u._id);
    const subscriptions = await Subscription.find({
      userId: { $in: userIds },
      status: { $in: ['demo', 'active', 'referral_reward'] },
    }).populate('planId', 'name planKey icon');

    const subMap = {};
    subscriptions.forEach((s) => {
      subMap[s.userId.toString()] = s;
    });

    const enriched = users.map((u) => ({
      ...u.toObject(),
      subscription: subMap[u._id.toString()] || null,
    }));

    res.json({ users: enriched, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

/** PUT /api/admin/users/:id/block */
export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`, isBlocked: user.isBlocked });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user' });
  }
};

/** PUT /api/admin/users/:id/assign-plan */
export const assignPlan = async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId) return res.status(400).json({ message: 'planId is required' });
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    const subscription = await activateSubscription(req.params.id, planId, null, 'active');
    res.json({ message: `Plan "${plan.name}" assigned successfully`, subscription });
  } catch (error) {
    res.status(500).json({ message: 'Failed to assign plan', error: error.message });
  }
};

/** GET /api/admin/orders?status= */
export const getOrders = async (req, res) => {
  try {
    const { status = 'pending_payment', page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'name email')
        .populate('planId', 'name planKey price icon')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

/** PUT /api/admin/orders/:id/approve */
export const approveOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('planId');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'pending_payment') {
      return res.status(400).json({ message: `Order is already ${order.status}` });
    }

    // Activate subscription
    await activateSubscription(order.userId, order.planId._id, order._id, 'active');

    // Update order
    await Order.updateOne(
      { _id: order._id },
      { status: 'approved', approvedBy: req.admin.email, processedAt: new Date() }
    );

    res.json({ message: `Order approved. ${order.planId.name} activated for user.` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve order', error: error.message });
  }
};

/** PUT /api/admin/orders/:id/reject */
export const rejectOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await Order.updateOne(
      { _id: order._id },
      {
        status: 'rejected',
        rejectedReason: reason || 'Rejected by admin',
        approvedBy: req.admin.email,
        processedAt: new Date(),
      }
    );
    res.json({ message: 'Order rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject order' });
  }
};

/** GET /api/admin/plans */
export const getAdminPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ sortOrder: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plans' });
  }
};

/** GET /api/admin/referrals */
export const getReferrals = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const [referrals, total] = await Promise.all([
      Referral.find()
        .populate('referrerId', 'name email')
        .populate('referreeId', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Referral.countDocuments(),
    ]);
    const totalCompleted = await Referral.countDocuments({ status: 'completed' });
    const rewardsGiven = await Referral.countDocuments({ rewardGiven: true });
    res.json({ referrals, total, totalCompleted, rewardsGiven, page: Number(page) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch referrals' });
  }
};
