import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

const app = express();
const port = process.env.PORT || 5000;

// ── Routes ────────────────────────────────────────────────────────────────────
import authRoutes from './routes/authRoutes.js';
import motionbookRoutes from './routes/motionbookRoutes.js';
import planRoutes from './routes/planRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import albumRoutes from './routes/albumRoutes.js';

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── API ────────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/motionbook', motionbookRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/albums', albumRoutes);

app.get('/', (req, res) => res.send('Motionbook API is running'));

// ── DB Seed — default plans ────────────────────────────────────────────────────
const seedPlans = async () => {
  try {
    const { Plan, DEFAULT_PLANS } = await import('./models/Plan.js');
    const count = await Plan.countDocuments();
    if (count === 0) {
      await Plan.insertMany(DEFAULT_PLANS);
      console.log(`✅ Seeded ${DEFAULT_PLANS.length} default plans`);
    }
  } catch (err) {
    console.error('Plan seed error:', err.message);
  }
};

// ── Connect & Start ────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/motionbook';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedPlans();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
