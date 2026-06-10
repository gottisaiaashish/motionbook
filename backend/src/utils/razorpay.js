import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

// Create Razorpay instance
// If keys are missing, we log a warning but don't crash, so the app still runs
export const razorpayInstance = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

if (!razorpayInstance) {
  console.warn('⚠️  RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Razorpay payments will fail.');
}
