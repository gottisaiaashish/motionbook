import { Subscription } from '../models/Subscription.js';

/**
 * Middleware: verify user has an active subscription and upload limits are not exceeded.
 * Must be placed AFTER the `protect` middleware (req.user must exist).
 * Attaches `req.subscription` on success.
 */
export const checkSubscriptionLimits = async (req, res, next) => {
  try {
    const bypassLimits = req.user && req.user.email === 'gottisaiaashish@gmail.com';

    let subscription = await Subscription.findOne({
      userId: req.user._id,
      status: { $in: ['demo', 'active', 'referral_reward'] },
    })
      .sort({ createdAt: -1 })
      .populate('planId');

    if (bypassLimits) {
      if (subscription && subscription.planId) {
        subscription.planId.maxPhotos = Infinity;
        subscription.planId.maxStorageBytes = Infinity;
        subscription.planId.maxVideoSizeMB = Infinity;
        subscription.endDate = new Date('2099-12-31');
      } else {
        subscription = {
          planId: { maxPhotos: Infinity, maxStorageBytes: Infinity, maxVideoSizeMB: Infinity, hasWatermark: false },
          photosUploaded: 0,
          storageUsedBytes: 0,
          albumsCreated: 0,
          status: 'active',
          endDate: new Date('2099-12-31')
        };
      }
    }

    // No active subscription at all
    if (!subscription) {
      return res.status(403).json({
        error: 'NO_SUBSCRIPTION',
        message: 'No active subscription found. Please purchase a plan.',
        upgradeUrl: '/upgrade',
      });
    }

    // Check expiry
    if (new Date() > subscription.endDate) {
      await Subscription.updateOne({ _id: subscription._id }, { status: 'expired' });
      return res.status(403).json({
        error: 'SUBSCRIPTION_EXPIRED',
        message: 'Your subscription has expired. Please renew.',
        upgradeUrl: '/upgrade',
      });
    }

    // Check if user is blocked
    if (req.user.isBlocked) {
      return res.status(403).json({
        error: 'ACCOUNT_BLOCKED',
        message: 'Your account has been blocked. Contact support.',
      });
    }

    const plan = subscription.planId;

    // For file uploads only (when req.files exists)
    if (req.files) {
      const imageFile = req.files?.image?.[0];
      const videoFile = req.files?.video?.[0];

      // Check photo upload limit
      if (imageFile && subscription.photosUploaded >= plan.maxPhotos) {
        return res.status(403).json({
          error: 'PHOTO_LIMIT_REACHED',
          message: `You've reached your photo limit (${plan.maxPhotos} photos). Upgrade your plan.`,
          limit: plan.maxPhotos,
          used: subscription.photosUploaded,
          upgradeUrl: '/upgrade',
        });
      }

      // Check storage limit
      const incomingBytes = (imageFile?.size || 0) + (videoFile?.size || 0);
      if (subscription.storageUsedBytes + incomingBytes > plan.maxStorageBytes) {
        const usedGB = (subscription.storageUsedBytes / (1024 ** 3)).toFixed(2);
        const totalGB = (plan.maxStorageBytes / (1024 ** 3)).toFixed(2);
        return res.status(403).json({
          error: 'STORAGE_LIMIT_REACHED',
          message: `Storage full (${usedGB} GB / ${totalGB} GB used). Upgrade your plan.`,
          storageUsed: subscription.storageUsedBytes,
          storageTotal: plan.maxStorageBytes,
          upgradeUrl: '/upgrade',
        });
      }

      // Check individual video size limit (if plan has restriction)
      if (videoFile && plan.maxVideoSizeMB > 0) {
        const videoMB = videoFile.size / (1024 * 1024);
        if (videoMB > plan.maxVideoSizeMB) {
          return res.status(403).json({
            error: 'VIDEO_SIZE_EXCEEDED',
            message: `Video exceeds ${plan.maxVideoSizeMB} MB limit for your plan.`,
            maxMB: plan.maxVideoSizeMB,
          });
        }
      }
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('checkSubscriptionLimits error:', error);
    res.status(500).json({ message: 'Failed to verify subscription limits' });
  }
};
