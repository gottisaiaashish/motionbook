import { Plan } from '../models/Plan.js';

/** GET /api/plans — All active plans (public) */
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plans' });
  }
};

/** GET /api/plans/:key — Single plan by planKey (public) */
export const getPlanByKey = async (req, res) => {
  try {
    const plan = await Plan.findOne({ planKey: req.params.key, isActive: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plan' });
  }
};

/** PUT /api/plans/:id — Update plan (admin) */
export const updatePlan = async (req, res) => {
  try {
    const allowed = [
      'name', 'price', 'maxAlbums', 'maxPhotos', 'maxStorageBytes',
      'maxVideoSizeMB', 'validityDays', 'features', 'isActive',
      'hasFamilySharing', 'hasAnalytics', 'hasPhotographerDashboard',
      'hasPrioritySupport', 'badge', 'icon',
    ];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const plan = await Plan.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update plan' });
  }
};
