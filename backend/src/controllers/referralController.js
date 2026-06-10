import { Referral } from '../models/Referral.js';
import { User } from '../models/User.js';
import { Subscription } from '../models/Subscription.js';
import { Plan } from '../models/Plan.js';
import { activateSubscription } from './subscriptionController.js';

/**
 * GET /api/referral/my  (protected)
 * Returns the user's referral code and stats.
 */
export const getMyReferral = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('referralCode name');
    const referrals = await Referral.find({ referrerId: req.user._id })
      .populate('referreeId', 'name email createdAt')
      .sort({ createdAt: -1 });

    const completedCount = referrals.filter((r) => r.status === 'completed').length;
    const rewardEligible = completedCount >= 3;

    // Check if reward already claimed
    const rewardSubscription = await Subscription.findOne({
      userId: req.user._id,
      status: 'referral_reward',
    });
    const rewardClaimed = !!rewardSubscription;

    const referralLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/signup?ref=${user.referralCode}`;

    res.json({
      referralCode: user.referralCode,
      referralLink,
      referrals: referrals.map((r) => ({
        _id: r._id,
        name: r.referreeId?.name || 'Unknown',
        email: r.referreeId?.email,
        status: r.status,
        joinedAt: r.referreeId?.createdAt,
        completedAt: r.completedAt,
      })),
      stats: {
        totalInvited: referrals.length,
        completed: completedCount,
        pending: referrals.length - completedCount,
        remaining: Math.max(0, 3 - completedCount),
      },
      reward: {
        eligible: rewardEligible,
        claimed: rewardClaimed,
        worth: 499,
        planName: 'MotionBook Mini',
      },
    });
  } catch (error) {
    console.error('getMyReferral error:', error);
    res.status(500).json({ message: 'Failed to fetch referral data' });
  }
};

/**
 * POST /api/referral/claim-reward  (protected)
 * Claim MotionBook Mini plan after 3 successful referrals.
 */
export const claimReferralReward = async (req, res) => {
  try {
    const completedReferrals = await Referral.countDocuments({
      referrerId: req.user._id,
      status: 'completed',
      rewardGiven: false,
    });

    if (completedReferrals < 3) {
      return res.status(400).json({
        message: `You need ${3 - completedReferrals} more completed referrals to claim the reward.`,
        completed: completedReferrals,
      });
    }

    // Check not already claimed
    const existing = await Subscription.findOne({
      userId: req.user._id,
      status: 'referral_reward',
    });
    if (existing) {
      return res.status(400).json({ message: 'Referral reward already claimed.' });
    }

    const miniPlan = await Plan.findOne({ planKey: 'mini_referral' });
    if (!miniPlan) return res.status(500).json({ message: 'Reward plan not configured' });

    // Activate referral reward subscription
    await activateSubscription(req.user._id, miniPlan._id, null, 'referral_reward');

    // Mark referrals as reward given
    await Referral.updateMany(
      { referrerId: req.user._id, status: 'completed', rewardGiven: false },
      { rewardGiven: true }
    );

    res.json({
      message: '🎉 Congratulations! MotionBook Mini has been activated on your account.',
      planName: miniPlan.name,
      validity: `${miniPlan.validityDays} days`,
    });
  } catch (error) {
    console.error('claimReferralReward error:', error);
    res.status(500).json({ message: 'Failed to claim reward' });
  }
};
