import mongoose from 'mongoose';

/**
 * Order — tracks plan purchase requests.
 * Without Razorpay: Admin manually approves orders.
 *
 * ─── HOW TO ADD RAZORPAY LATER ───────────────────────────────────────────────
 * 1. Sign up at razorpay.com → Settings → API Keys → Get test/live keys
 * 2. Add to backend/.env:
 *      RAZORPAY_KEY_ID=rzp_test_XXXX
 *      RAZORPAY_KEY_SECRET=XXXX
 * 3. Add to frontend/.env:
 *      VITE_RAZORPAY_KEY_ID=rzp_test_XXXX
 * 4. Run: npm install razorpay  (in backend folder)
 * 5. In subscriptionController.js → replace createManualOrder() with Razorpay order creation
 * 6. In UpgradePage.jsx → load Razorpay script, trigger checkout on "Pay Now"
 * 7. After payment success → call POST /api/subscription/verify-payment
 *    with { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 * 8. Backend verifies signature with HMAC-SHA256, activates subscription
 * ─────────────────────────────────────────────────────────────────────────────
 */
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true,
  },
  amount: { type: Number, required: true },  // INR
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['pending_payment', 'approved', 'rejected', 'cancelled'],
    default: 'pending_payment',
  },
  // Customer fills this after making bank transfer / UPI payment
  paymentReference: { type: String, default: '' },  // UTR / UPI transaction ID
  // Razorpay fields (populated when Razorpay is integrated later)
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  // Admin actions
  approvedBy: { type: String, default: '' },
  rejectedReason: { type: String, default: '' },
  processedAt: { type: Date, default: null },
  notes: { type: String, default: '' },
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
