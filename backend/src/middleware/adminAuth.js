import jwt from 'jsonwebtoken';

/**
 * Admin authentication middleware.
 * Checks for a JWT that has { admin: true } in the payload.
 * Admin JWT is issued by POST /api/admin/login using ADMIN_EMAIL + ADMIN_PASSWORD from .env
 */
export const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Admin authorization required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    if (!decoded.admin) {
      return res.status(403).json({ message: 'Not an admin account' });
    }
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired admin token' });
  }
};
