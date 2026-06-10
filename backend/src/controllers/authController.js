import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { OTP } from '../models/OTP.js';
import { Plan } from '../models/Plan.js';
import { Subscription } from '../models/Subscription.js';
import { Referral } from '../models/Referral.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });

const generateReferralCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

const createDemoSubscription = async (userId) => {
  try {
    const demoPlan = await Plan.findOne({ planKey: 'demo' });
    if (!demoPlan) return;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + demoPlan.validityDays);
    await Subscription.create({
      userId,
      planId: demoPlan._id,
      status: 'demo',
      startDate: new Date(),
      endDate,
    });
  } catch (err) {
    console.error('createDemoSubscription error:', err.message);
  }
};

// ── Controllers ───────────────────────────────────────────────────────────────

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.findOneAndUpdate(
      { email },
      { email, otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    const htmlContent = `
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;border:1px solid #eaeaea;border-radius:12px;background:#ffffff;">
        <p style="font-size:16px;margin-bottom:20px;">Hello there,</p>
        <p style="font-size:16px;margin-bottom:30px;">Use the following code to verify your MotionBook account. Valid for <strong>5 minutes</strong>.</p>
        <div style="text-align:center;margin:40px 0;">
          <div style="display:inline-block;padding:15px 40px;font-size:36px;font-weight:bold;color:#111;background:#f8f9fa;border:1px solid #e5e7eb;border-radius:8px;letter-spacing:8px;">${otp}</div>
        </div>
        <p style="font-size:14px;color:#666;text-align:center;">If you didn't request this, ignore this email.</p>
        <div style="text-align:center;padding-top:20px;border-top:1px solid #f0f0f0;font-size:12px;color:#999;">
          <p>&copy; ${new Date().getFullYear()} Motionbook. All rights reserved.</p>
        </div>
      </div>`;

    fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'accept': 'application/json', 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Motionbook', email: 'support.motionbook@gmail.com' },
        to: [{ email }],
        subject: 'Your Motionbook Verification Code',
        htmlContent,
      }),
    }).then(async (r) => {
      if (!r.ok) console.error('Brevo error:', await r.json());
      else console.log(`OTP sent to ${email}`);
    }).catch((e) => console.error('Email error:', e));

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('sendOTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, otp, referralCode: usedReferralCode } = req.body;

    if (!otp) return res.status(400).json({ message: 'OTP is required' });

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    if (otpRecord.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    await OTP.deleteOne({ email });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique referral code
    let myReferralCode;
    let codeExists = true;
    while (codeExists) {
      myReferralCode = generateReferralCode();
      codeExists = !!(await User.findOne({ referralCode: myReferralCode }));
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      referralCode: myReferralCode,
      referredBy: usedReferralCode || null,
    });

    if (!user) return res.status(400).json({ message: 'Invalid user data' });

    // Handle referral — mark as completed when account is created + OTP verified
    if (usedReferralCode) {
      const referrer = await User.findOne({ referralCode: usedReferralCode });
      if (referrer) {
        // Check not already referred
        const alreadyReferred = await Referral.findOne({ referreeId: user._id });
        if (!alreadyReferred) {
          await Referral.create({
            referrerId: referrer._id,
            referreeId: user._id,
            referralCode: usedReferralCode,
            status: 'completed',  // OTP verified = completed
            completedAt: new Date(),
          });
        }
      }
    }

    // Create demo subscription
    await createDemoSubscription(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode,
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    console.error('registerUser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Contact support.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode,
      token: generateToken(user._id.toString()),
    });
  } catch (error) {
    console.error('loginUser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
