import { Subscription } from '../models/Subscription.js';
import { Plan } from '../models/Plan.js';
import { Order } from '../models/Order.js';
import crypto from 'crypto';
import { razorpayInstance } from '../utils/razorpay.js';

/**
 * GET /api/subscription/my  (protected)
 * Returns the user's current active subscription with plan details and usage stats.
 */
export const getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: { $in: ['demo', 'active', 'referral_reward'] },
    })
      .sort({ createdAt: -1 })
      .populate('planId');

    if (!subscription) {
      return res.json({ subscription: null, message: 'No active subscription' });
    }

    const plan = subscription.planId;
    const storageUsedGB = (subscription.storageUsedBytes / (1024 ** 3)).toFixed(3);
    const storageTotalGB = (plan.maxStorageBytes / (1024 ** 3)).toFixed(1);
    const storagePercent = Math.round((subscription.storageUsedBytes / plan.maxStorageBytes) * 100);

    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((subscription.endDate - now) / (1000 * 60 * 60 * 24)));
    const isExpired = now > subscription.endDate;

    // Auto-expire if needed
    if (isExpired && subscription.status !== 'expired') {
      await Subscription.updateOne({ _id: subscription._id }, { status: 'expired' });
      subscription.status = 'expired';
    }

    res.json({
      subscription: {
        _id: subscription._id,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        daysRemaining,
        isExpired,
      },
      plan: {
        _id: plan._id,
        planKey: plan.planKey,
        name: plan.name,
        type: plan.type,
        icon: plan.icon,
        badge: plan.badge,
        maxAlbums: plan.maxAlbums,
        maxPhotos: plan.maxPhotos,
        maxStorageBytes: plan.maxStorageBytes,
        hasFamilySharing: plan.hasFamilySharing,
        hasAnalytics: plan.hasAnalytics,
        hasPhotographerDashboard: plan.hasPhotographerDashboard,
        features: plan.features,
      },
      usage: {
        photosUploaded: subscription.photosUploaded,
        photosTotal: plan.maxPhotos,
        photosPercent: Math.round((subscription.photosUploaded / plan.maxPhotos) * 100),
        storageUsedBytes: subscription.storageUsedBytes,
        storageUsedGB,
        storageTotalGB,
        storagePercent: Math.min(100, storagePercent),
      },
    });
  } catch (error) {
    console.error('getMySubscription error:', error);
    res.status(500).json({ message: 'Failed to fetch subscription' });
  }
};

/**
 * POST /api/subscription/request-upgrade  (protected)
 * Creates a pending Order for the selected plan.
 * Without Razorpay: shows manual payment instructions to user.
 * Admin approves from admin panel → subscription activates.
 */
export const requestUpgrade = async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId) return res.status(400).json({ message: 'Plan ID is required' });

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ message: 'Plan not found or inactive' });
    }
    if (plan.type === 'demo' || plan.type === 'referral') {
      return res.status(400).json({ message: 'Cannot purchase this plan type' });
    }

    // Check for existing pending order for this user
    const existingOrder = await Order.findOne({
      userId: req.user._id,
      status: 'pending_payment',
    });
    if (existingOrder) {
      return res.status(400).json({
        message: 'You already have a pending payment. Complete it or contact support.',
        orderId: existingOrder._id,
      });
    }

    const order = await Order.create({
      userId: req.user._id,
      planId: plan._id,
      amount: plan.price,
    });

    res.status(201).json({
      orderId: order._id,
      plan: { name: plan.name, price: plan.price, icon: plan.icon },
      paymentInstructions: {
        upiId: process.env.UPI_ID || 'motionbook@upi',
        bankAccount: process.env.BANK_ACCOUNT || '0000000000',
        bankIFSC: process.env.BANK_IFSC || 'HDFC0000000',
        bankName: process.env.BANK_NAME || 'MotionBook Technologies',
        amount: plan.price,
        note: `MotionBook Order ${order._id}`,
      },
      message: 'Order created. Transfer the amount and submit your payment reference below.',
    });
  } catch (error) {
    console.error('requestUpgrade error:', error);
    res.status(500).json({ message: 'Failed to create upgrade order' });
  }
};

/**
 * POST /api/subscription/submit-payment  (protected)
 * User submits UTR / UPI transaction ID after making payment.
 */
export const submitPaymentReference = async (req, res) => {
  try {
    const { orderId, paymentReference } = req.body;
    if (!orderId || !paymentReference) {
      return res.status(400).json({ message: 'Order ID and payment reference are required' });
    }

    const order = await Order.findOne({ _id: orderId, userId: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'pending_payment') {
      return res.status(400).json({ message: `Order is already ${order.status}` });
    }

    await Order.updateOne({ _id: orderId }, { paymentReference });
    res.json({ message: 'Payment reference submitted. Your plan will be activated within 24 hours after admin verification.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit payment reference' });
  }
};

/**
 * Internal helper — activate a subscription for a user (called by admin approve).
 */
export const activateSubscription = async (userId, planId, orderId = null, status = 'active') => {
  const plan = await Plan.findById(planId);
  if (!plan) throw new Error('Plan not found');

  // Expire any current active subscription
  await Subscription.updateMany(
    { userId, status: { $in: ['demo', 'active', 'referral_reward'] } },
    { status: 'expired' }
  );

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + plan.validityDays);

  const subscription = await Subscription.create({
    userId,
    planId,
    status,
    startDate,
    endDate,
    orderId,
  });

  return subscription;
};

/**
 * POST /api/subscription/create-razorpay-order
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId) return res.status(400).json({ message: 'Plan ID is required' });

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ message: 'Plan not found or inactive' });
    }
    if (plan.type === 'demo' || plan.type === 'referral') {
      return res.status(400).json({ message: 'Cannot purchase this plan type' });
    }

    if (!razorpayInstance) {
      return res.status(500).json({ message: 'Razorpay is not configured' });
    }

    // Razorpay amount is in paise (INR * 100)
    const amount = plan.price * 100;
    const options = {
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${req.user._id.toString().slice(-6)}`,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    // Save order in our DB with Razorpay Order ID
    const order = await Order.create({
      userId: req.user._id,
      planId: plan._id,
      amount: plan.price,
      status: 'pending_payment',
      paymentReference: razorpayOrder.id, // Store razorpay order ID here
    });

    res.status(201).json({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      plan: { name: plan.name, description: `Upgrade to ${plan.name}` }
    });
  } catch (error) {
    console.error('createRazorpayOrder error:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
};

/**
 * POST /api/subscription/verify-razorpay-payment
 */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing Razorpay payment details' });
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed: Invalid signature' });
    }

    // Find the order
    const order = await Order.findOne({ _id: orderId, userId: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'pending_payment') {
      return res.status(400).json({ message: `Order is already ${order.status}` });
    }

    // Update order status
    order.status = 'approved';
    order.processedAt = new Date();
    await order.save();

    // Activate subscription
    const subscription = await activateSubscription(req.user._id, order.planId, order._id, 'active');

    res.json({ message: 'Payment verified and plan activated', subscription });
  } catch (error) {
    console.error('verifyRazorpayPayment error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};
