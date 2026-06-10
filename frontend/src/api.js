const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/auth')
  .replace('/api/auth', '');
const API_URL = `${BASE}/api/auth`;
const API_MB_URL = `${BASE}/api/motionbook`;
const API_PLANS_URL = `${BASE}/api/plans`;
const API_SUB_URL = `${BASE}/api/subscription`;
const API_REF_URL = `${BASE}/api/referral`;
const API_ADMIN_URL = `${BASE}/api/admin`;

export const sendOTP = async (email) => {
  const response = await fetch(`${API_URL}/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send OTP');
  }

  return response.json();
};

export const register = async (name, email, password, otp) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password, otp }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to register');
  }

  const data = await response.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
  }
  return data;
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to login');
  }

  const data = await response.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
  }
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const googleLogin = async (idToken) => {
  const response = await fetch(`${API_URL}/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to login with Google');
  }

  const data = await response.json();
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
  }
  return data;
};

// ─── Motionbook API ───────────────────────────────────────────────────────────

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

/**
 * Upload a photo + video pair as a new Motionbook project.
 * @param {FormData} formData  — must include: title (string), image (File), video (File)
 */
export const uploadMotionbook = async (formData) => {
  const response = await fetch(`${API_MB_URL}/upload`, {
    method: 'POST',
    headers: getAuthHeader(), // NOTE: no Content-Type — browser sets multipart boundary
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }
  return response.json();
};

/**
 * Send a camera frame (base64 data URL) to the backend for image recognition.
 * @param {string} imageDataUrl  — e.g. canvas.toDataURL('image/jpeg', 0.7)
 */
export const scanImage = async (imageDataUrl) => {
  const response = await fetch(`${API_MB_URL}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageDataUrl }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Scan failed');
  }
  return response.json();
};

/**
 * Fetch all motionbooks belonging to the logged-in user.
 */
export const getMyMotionbooks = async () => {
  const response = await fetch(`${API_MB_URL}/my`, {
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch motionbooks');
  }
  return response.json();
};

/**
 * Delete a motionbook by ID.
 */
export const deleteMotionbook = async (id) => {
  const response = await fetch(`${API_MB_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Delete failed');
  }
  return response.json();
};

// ─── Plans API ────────────────────────────────────────────────────────────────
export const getPlans = async () => {
  const r = await fetch(API_PLANS_URL);
  if (!r.ok) throw new Error('Failed to fetch plans');
  return r.json();
};

// ─── Subscription API ─────────────────────────────────────────────────────────
export const getMySubscription = async () => {
  const r = await fetch(`${API_SUB_URL}/my`, { headers: getAuthHeader() });
  if (!r.ok) throw new Error('Failed to fetch subscription');
  return r.json();
};

export const createRazorpayOrder = async (planId) => {
  const r = await fetch(`${API_SUB_URL}/create-razorpay-order`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId }),
  });
  if (!r.ok) { const e = await r.json(); throw new Error(e.message || 'Failed'); }
  return r.json();
};

export const verifyRazorpayPayment = async (paymentData) => {
  const r = await fetch(`${API_SUB_URL}/verify-razorpay-payment`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  });
  if (!r.ok) { const e = await r.json(); throw new Error(e.message || 'Failed'); }
  return r.json();
};

// ─── Referral API ─────────────────────────────────────────────────────────────
export const getMyReferral = async () => {
  const r = await fetch(`${API_REF_URL}/my`, { headers: getAuthHeader() });
  if (!r.ok) throw new Error('Failed to fetch referral data');
  return r.json();
};

export const claimReferralReward = async () => {
  const r = await fetch(`${API_REF_URL}/claim-reward`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
  });
  if (!r.ok) { const e = await r.json(); throw new Error(e.message || 'Failed'); }
  return r.json();
};

// ─── Admin API ────────────────────────────────────────────────────────────────
const getAdminHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
  'Content-Type': 'application/json',
});

export const adminLogin = async (email, password) => {
  const r = await fetch(`${API_ADMIN_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) { const e = await r.json(); throw new Error(e.message || 'Invalid credentials'); }
  const data = await r.json();
  localStorage.setItem('adminToken', data.token);
  return data;
};

export const adminLogout = () => localStorage.removeItem('adminToken');
export const isAdminAuthenticated = () => !!localStorage.getItem('adminToken');

export const adminGetStats = async () => {
  const r = await fetch(`${API_ADMIN_URL}/stats`, { headers: getAdminHeader() });
  if (!r.ok) throw new Error('Failed');
  return r.json();
};

export const adminGetUsers = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  const r = await fetch(`${API_ADMIN_URL}/users?${q}`, { headers: getAdminHeader() });
  if (!r.ok) throw new Error('Failed');
  return r.json();
};

export const adminToggleBlock = async (userId) => {
  const r = await fetch(`${API_ADMIN_URL}/users/${userId}/block`, { method: 'PUT', headers: getAdminHeader() });
  if (!r.ok) throw new Error('Failed');
  return r.json();
};

export const adminAssignPlan = async (userId, planId) => {
  const r = await fetch(`${API_ADMIN_URL}/users/${userId}/assign-plan`, {
    method: 'PUT', headers: getAdminHeader(), body: JSON.stringify({ planId }),
  });
  if (!r.ok) { const e = await r.json(); throw new Error(e.message || 'Failed'); }
  return r.json();
};

export const adminGetOrders = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  const r = await fetch(`${API_ADMIN_URL}/orders?${q}`, { headers: getAdminHeader() });
  if (!r.ok) throw new Error('Failed');
  return r.json();
};

export const adminApproveOrder = async (orderId) => {
  const r = await fetch(`${API_ADMIN_URL}/orders/${orderId}/approve`, { method: 'PUT', headers: getAdminHeader() });
  if (!r.ok) { const e = await r.json(); throw new Error(e.message || 'Failed'); }
  return r.json();
};

export const adminRejectOrder = async (orderId, reason) => {
  const r = await fetch(`${API_ADMIN_URL}/orders/${orderId}/reject`, {
    method: 'PUT', headers: getAdminHeader(), body: JSON.stringify({ reason }),
  });
  if (!r.ok) throw new Error('Failed');
  return r.json();
};

export const adminGetPlans = async () => {
  const r = await fetch(`${API_ADMIN_URL}/plans`, { headers: getAdminHeader() });
  if (!r.ok) throw new Error('Failed');
  return r.json();
};

export const adminUpdatePlan = async (planId, updates) => {
  const r = await fetch(`${API_PLANS_URL}/${planId}`, {
    method: 'PUT', headers: getAdminHeader(), body: JSON.stringify(updates),
  });
  if (!r.ok) throw new Error('Failed');
  return r.json();
};

export const adminGetReferrals = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  const r = await fetch(`${API_ADMIN_URL}/referrals?${q}`, { headers: getAdminHeader() });
  if (!r.ok) throw new Error('Failed');
  return r.json();
};


