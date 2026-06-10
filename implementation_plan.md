- **Referral system** with 3-friend unlock  
- **Full Admin Panel** (manage users, plans, pricing, storage, analytics)  
- **Theme:** Black `#0a0a0a` + Orange `#f97316` / `#ea580c` (premium startup aesthetic)  
- **Payment:** Razorpay (Indian ₹ gateway — matches all plan prices)

---

## Open Questions

> [!IMPORTANT]
> **Payment Gateway:** Razorpay integration కి `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` environment variables కావాలి. మీ Razorpay account ఉందా? లేదంటే payment flow UI-only (manual payment) గా implement చేయవచ్చు.

> [!NOTE]
> **Phone Verification for Referral:** Referral unlock కి "Friend verifies mobile number" condition ఉంది. ఇప్పుడు auth system email-only. Phone verify కి Twilio/Fast2SMS కావాలి. Initially, **email verification only** గా implement చేసి later phone add చేయవచ్చు.

> [!NOTE]
> **Admin Account:** Admin credentials `.env` లో hardcode చేస్తాం (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) తర్వాత DB-based management add చేయవచ్చు.

---

## Database Schema (New Models)

### 1. `Plan.js` — Plan definitions (admin configurable)
```
{
  planKey: String (unique slug, e.g. 'spark', 'creator')
  name: String
  type: 'user' | 'photographer' | 'referral' | 'demo'
  price: Number (INR)
  maxAlbums: Number
  maxPhotos: Number
  maxStorageBytes: Number
  maxVideoSizeMB: Number (for referral plan)
  validityDays: Number (3650 = 10 years, 7 for demo, 30 for referral)
  hasFamilySharing: Boolean
  hasAnalytics: Boolean
  hasPhotographerDashboard: Boolean
  hasPrioritySupport: Boolean
  hasWatermark: Boolean
  isActive: Boolean
  createdAt: Date
}
```

### 2. `Subscription.js` — User's active plan
```
{
  userId: ObjectId → User
  planId: ObjectId → Plan
  status: 'demo' | 'active' | 'expired' | 'referral_reward'
  startDate: Date
  endDate: Date
  storageUsedBytes: Number (default 0)
  albumsCreated: Number (default 0)
  photosUploaded: Number (default 0)
  paymentId: String (Razorpay payment ID, null for demo/referral)
  orderId: String (Razorpay order ID)
  createdAt: Date
}
```

### 3. `Referral.js` — Referral tracking
```
{
  referrerId: ObjectId → User (who shared the code)
  referreeId: ObjectId → User (who signed up with code)
  referralCode: String
  status: 'pending' | 'completed'
  rewardGiven: Boolean (default false)
  completedAt: Date
  createdAt: Date
}
```

### 4. `Album.js` — Album structure (replaces individual motionbook grouping)
```
{
  userId: ObjectId → User
  subscriptionId: ObjectId → Subscription
  name: String
  description: String
  coverImageUrl: String
  type: 'personal' | 'wedding' | 'client'
  isShared: Boolean
  sharedWith: [ObjectId] (family sharing)
  createdAt: Date
}
```

### 5. `Order.js` — Payment orders
```
{
  userId: ObjectId → User
  planId: ObjectId → Plan
  razorpayOrderId: String
  razorpayPaymentId: String
  amount: Number
  currency: 'INR'
  status: 'created' | 'paid' | 'failed'
  createdAt: Date
}
```

### User.js — Updates
```
Add fields:
  role: 'user' | 'photographer' | 'admin' (default: 'user')
  referralCode: String (unique, auto-generated on signup)
  referredBy: String (referral code used during signup)
  phone: String (optional, for future phone verify)
  phoneVerified: Boolean (default false)
  isBlocked: Boolean (default false)
```

### Motionbook.js — Updates
```
Add fields:
  albumId: ObjectId → Album (optional, for album grouping)
  fileSizeBytes: Number (image + video size for storage tracking)
```

---

## Backend APIs (New Route Groups)

### `/api/plans` — Plan Management
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | Public | Get all active plans |
| GET | `/:id` | Public | Get plan details |
| POST | `/` | Admin | Create plan |
| PUT | `/:id` | Admin | Update plan (price, limits, validity) |
| DELETE | `/:id` | Admin | Deactivate plan |

### `/api/subscription` — Subscription Management
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/my` | User | Get current subscription + limits |
| GET | `/storage` | User | Storage usage details |
| POST | `/create-order` | User | Create Razorpay order |
| POST | `/verify-payment` | User | Verify & activate subscription |
| GET | `/check-limit` | User | Check album/photo/storage limits |

### `/api/referral` — Referral System
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/my` | User | My referral code + stats |
| POST | `/apply` | User | Apply referral code at signup |
| GET | `/status` | User | Count completed referrals, reward status |
| POST | `/claim-reward` | User | Claim Mini plan after 3 referrals |

### `/api/album` — Album Management
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/my` | User | Get user's albums |
| POST | `/` | User | Create album (checks limit) |
| PUT | `/:id` | User | Update album |
| DELETE | `/:id` | User | Delete album + all motionbooks |

### `/api/admin` — Admin Panel APIs
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/login` | Public | Admin login |
| GET | `/stats` | Admin | Revenue, users, albums overview |
| GET | `/users` | Admin | List all users with filters |
| PUT | `/users/:id/block` | Admin | Block/unblock user |
| PUT | `/users/:id/plan` | Admin | Manually assign plan |
| GET | `/subscriptions` | Admin | All subscriptions |
| GET | `/revenue` | Admin | Revenue analytics |
| GET | `/referrals` | Admin | Referral analytics |

### `/api/motionbook` — Updated with limit checks
- Add middleware to check subscription limits before upload
- Track `fileSizeBytes` for storage usage
- Block upload when storage/photo limit reached

---

## Middleware

### `checkSubscriptionLimits.js`
Before any upload:
1. Get user's active subscription
2. Check if subscription expired → 403 (upgrade)
3. Check storage limit → 403 (storage full)
4. Check photo count limit → 403 (photo limit reached)

### `adminAuth.js`  
Verify admin JWT or admin credentials from env.

---

## Frontend Pages & Components (New)

### Theme System
Orange accent: `#f97316` (orange-500), `#ea580c` (orange-600)  
Background: `#0a0a0a`, Cards: `#111114`, Borders: `rgba(249,115,22,0.15)`

### New Pages

#### 1. `/pricing` — PricingPage
- **Hero:** "Choose Your MotionBook Plan"  
- **Toggle:** User Plans / Photographer Plans  
- **6 plan cards** with highlighted "Popular" badge  
- **Orange gradient** on featured cards  
- **CTA:** "Get Started" → Razorpay checkout or signup  
- Demo plan banner at bottom  

#### 2. `/dashboard` — Dashboard (major update)
- **Plan badge** top right (Demo / Spark / Creator / etc.)  
- **Storage bar:** used / total with orange fill  
- **Expiry countdown:** "Valid until DD/MM/YYYY"  
- **Upgrade banner** if on demo / near expiry  
- **Albums grid** instead of flat motionbooks  

#### 3. `/referral` — ReferralPage
- **My referral code** with copy button  
- **Progress tracker:** 0/3 friends invited  
- **Status cards** for each referral (pending / completed)  
- **Reward preview:** MotionBook Mini card  
- **Claim button** when 3 referrals complete  

#### 4. `/upgrade` — UpgradePage
- Shown when demo expires or limit hit  
- Full plan comparison table  
- "Upgrade Now" → Razorpay  
- Referral code input option  

#### 5. `/admin` — AdminPanel (single-page dashboard with tabs)
**Tabs:**
- 📊 **Overview** — Revenue, total users, active plans, albums created  
- 👥 **Users** — Searchable table, block/unblock, assign plan  
- 💼 **Plans** — Edit plan price/limits/validity inline  
- 📦 **Subscriptions** — Filter by plan/status/date  
- 🔗 **Referrals** — Referral analytics table  
- 📈 **Revenue** — Chart: revenue over time, plan distribution  

#### 6. `StorageBar` component (used across Dashboard + Admin)
Visual storage usage indicator with orange fill.

#### 7. `PlanBadge` component
Shows current plan tier with color coding.

#### 8. `UpgradeBanner` component
Dismissible banner when demo expires / storage at 80%+.

---

## Business Logic

### On Signup (registerUser updated):
1. Generate unique `referralCode` (6-char uppercase)
2. If `referredBy` code provided → create Referral record
3. Create Demo Subscription (1 photo, 1 video, 7 days)

### Upload Check (new middleware):
1. Get user subscription  
2. If expired → `{ error: 'SUBSCRIPTION_EXPIRED', upgradeUrl: '/upgrade' }`
3. If storage full → `{ error: 'STORAGE_LIMIT_REACHED' }`
4. If photo limit full → `{ error: 'PHOTO_LIMIT_REACHED' }`
5. On successful upload → `subscription.storageUsedBytes += fileSize`; `subscription.photosUploaded += 1`

### Referral Completion:
- When referred user creates account → referral status = 'pending'
- When referred user verifies email → referral status = 'completed'
- When referrer has 3 completed referrals → eligible to claim Mini plan
- `claimReward()` → creates 30-day referral subscription

### Payment Flow (Razorpay):
1. User selects plan → `POST /api/subscription/create-order` → returns Razorpay order
2. Razorpay checkout opens in browser
3. On success → `POST /api/subscription/verify-payment` with payment ID + signature
4. Backend verifies signature → creates Subscription → returns new plan info

---

## Proposed File Changes

### Backend — New Files

#### [NEW] `backend/src/models/Plan.js`
#### [NEW] `backend/src/models/Subscription.js`
#### [NEW] `backend/src/models/Referral.js`
#### [NEW] `backend/src/models/Album.js`
#### [NEW] `backend/src/models/Order.js`
#### [NEW] `backend/src/controllers/planController.js`
#### [NEW] `backend/src/controllers/subscriptionController.js`
#### [NEW] `backend/src/controllers/referralController.js`
#### [NEW] `backend/src/controllers/albumController.js`
#### [NEW] `backend/src/controllers/adminController.js`
#### [NEW] `backend/src/routes/planRoutes.js`
#### [NEW] `backend/src/routes/subscriptionRoutes.js`
#### [NEW] `backend/src/routes/referralRoutes.js`
#### [NEW] `backend/src/routes/albumRoutes.js`
#### [NEW] `backend/src/routes/adminRoutes.js`
#### [NEW] `backend/src/middleware/checkSubscription.js`
#### [NEW] `backend/src/middleware/adminAuth.js`
#### [NEW] `backend/src/seeds/plans.seed.js` — Seed default plan data

### Backend — Modified Files

#### [MODIFY] `backend/src/models/User.js` — Add role, referralCode, referredBy, phone, isBlocked
#### [MODIFY] `backend/src/models/Motionbook.js` — Add albumId, fileSizeBytes
#### [MODIFY] `backend/src/controllers/authController.js` — Add referral code gen on signup
#### [MODIFY] `backend/src/controllers/motionbookController.js` — Update storage tracking on upload/delete
#### [MODIFY] `backend/src/routes/motionbookRoutes.js` — Add checkSubscription middleware
#### [MODIFY] `backend/src/server.js` — Register all new routes
#### [MODIFY] `backend/.env` — Add RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

### Frontend — New Files

#### [NEW] `frontend/src/components/PricingPage.jsx`
#### [NEW] `frontend/src/components/ReferralPage.jsx`
#### [NEW] `frontend/src/components/UpgradePage.jsx`
#### [NEW] `frontend/src/components/AdminPanel.jsx`
#### [NEW] `frontend/src/components/ui/StorageBar.jsx`
#### [NEW] `frontend/src/components/ui/PlanBadge.jsx`
#### [NEW] `frontend/src/components/ui/UpgradeBanner.jsx`

### Frontend — Modified Files

#### [MODIFY] `frontend/src/components/Dashboard.jsx` — Add storage bar, plan badge, albums, expiry, upgrade banner
#### [MODIFY] `frontend/src/components/LandingPage.jsx` — Add pricing section link & CTA
#### [MODIFY] `frontend/src/App.jsx` — Add /pricing, /referral, /upgrade, /admin routes
#### [MODIFY] `frontend/src/api.js` — Add all new API functions

---

## Execution Phases

### Phase 1 — Backend Foundation (Models + Auth updates)
Plans seed, new models, User model updates, referral code on signup

### Phase 2 — Backend Business Logic (Controllers + Routes)
Subscription flow, storage tracking, referral system, admin APIs, upload middleware

### Phase 3 — Frontend Core (Pricing + Dashboard updates)
PricingPage, Dashboard with storage/plan/expiry, UpgradeBanner component

### Phase 4 — Frontend Advanced (Referral + Admin)
ReferralPage, UpgradePage, AdminPanel with full analytics

---

## Verification Plan

### Automated
- Backend starts without errors: `npm run dev`
- Frontend builds without errors: `npx vite build`

### Manual Flow Tests
1. Signup → demo plan auto-created → see "Demo (7 days)" badge in dashboard
2. Demo expires → upgrade banner shows → upgrade page opens
3. Upload 1 photo on demo → second upload blocked → storage/limit error shown
4. Referral: Copy link → signup with link → referral tracked → 3 completed → claim Mini plan
5. Admin login → see all users, edit plan price, view revenue stats
6. Razorpay checkout (test mode) → payment → subscription activated → new limits apply
