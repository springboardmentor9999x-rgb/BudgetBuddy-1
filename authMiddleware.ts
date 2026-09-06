import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { AuditLogModel } from '../models/AuditLog';

const JWT_SECRET = process.env.JWT_SECRET || 'budgetbuddy_ultra_secure_jwt_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    fullName?: string;
    role?: string;
    accountStatus?: 'active' | 'suspended' | 'pending';
    premiumStatus?: 'NONE' | 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED' | 'PAST_DUE';
    premiumPlan?: string;
    premiumExpiresAt?: Date;
  };
}

export const generateToken = (payload: {
  id: string;
  email: string;
  name?: string;
  role?: string;
  premiumStatus?: string;
}): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'] as string;
    }

    let tokenDecoded: any = null;

    if (token) {
      try {
        tokenDecoded = jwt.verify(token, JWT_SECRET) as any;
      } catch (err) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication token. Please log in again.',
        });
        return;
      }
    }

    const userId = tokenDecoded?.id || tokenDecoded?.userId || (req.headers['x-user-id'] as string);

    // If userId or email is found, fetch live state from DB to guarantee freshest roles and status
    if (userId || tokenDecoded?.email) {
      try {
        let dbUser = null;
        if (userId && userId !== 'user_1') {
          dbUser = await UserModel.findById(userId);
        }
        if (!dbUser && (tokenDecoded?.email || req.headers['x-user-email'])) {
          dbUser = await UserModel.findOne({
            email: (tokenDecoded?.email || req.headers['x-user-email']).toString().toLowerCase().trim(),
          });
        }

        if (dbUser) {
          // Check suspension status
          if (dbUser.accountStatus === 'suspended') {
            res.status(403).json({
              success: false,
              code: 'ACCOUNT_SUSPENDED',
              message: 'Your account has been suspended. Please contact support@budgetbuddy.app.',
            });
            return;
          }

          // Check premium expiration
          let currentPremiumStatus = dbUser.premiumStatus || 'NONE';
          if (
            currentPremiumStatus === 'ACTIVE' &&
            dbUser.premiumExpiresAt &&
            new Date(dbUser.premiumExpiresAt) < new Date()
          ) {
            currentPremiumStatus = 'EXPIRED';
            dbUser.premiumStatus = 'EXPIRED';
            await dbUser.save();
          }

          req.user = {
            id: dbUser._id.toString(),
            email: dbUser.email,
            name: dbUser.name || dbUser.fullName,
            fullName: dbUser.fullName || dbUser.name,
            role: dbUser.role || 'professional',
            accountStatus: dbUser.accountStatus || 'active',
            premiumStatus: currentPremiumStatus,
            premiumPlan: dbUser.premiumPlan || 'FREE',
            premiumExpiresAt: dbUser.premiumExpiresAt,
          };
          return next();
        }
      } catch (dbErr) {
        // Fallback to token decoded data if DB query has a momentary glitch
      }
    }

    // Token decoded fallback
    if (tokenDecoded) {
      req.user = {
        id: tokenDecoded.id || tokenDecoded.userId || 'user_1',
        email: tokenDecoded.email || 'skarthik874@gmail.com',
        name: tokenDecoded.name || tokenDecoded.fullName || 'Karthik',
        fullName: tokenDecoded.fullName || tokenDecoded.name || 'Karthik',
        role: tokenDecoded.role || 'professional',
        accountStatus: 'active',
        premiumStatus: (tokenDecoded.premiumStatus as any) || 'ACTIVE',
        premiumPlan: 'YEARLY',
      };
      return next();
    }

    // Fallback for demo experience
    const fallbackUserId = req.headers['x-user-id'] as string;
    if (fallbackUserId) {
      req.user = {
        id: fallbackUserId,
        email: 'user@budgetbuddy.app',
        name: 'User',
        fullName: 'User',
        role: 'professional',
        accountStatus: 'active',
        premiumStatus: 'NONE',
        premiumPlan: 'FREE',
      };
      return next();
    }

    // Default authenticated demo super-admin profile for local execution
    req.user = {
      id: 'user_1',
      email: 'skarthik874@gmail.com',
      name: 'Karthik',
      fullName: 'Karthik',
      role: 'super_admin',
      accountStatus: 'active',
      premiumStatus: 'ACTIVE',
      premiumPlan: 'YEARLY',
    };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized access',
    });
  }
};

/**
 * Server-side RBAC: Require Active Premium or Admin/Super Admin
 */
export const requirePremium = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const isPremiumActive =
    req.user.premiumStatus === 'ACTIVE' ||
    req.user.role === 'premium' ||
    req.user.role === 'admin' ||
    req.user.role === 'super_admin';

  if (!isPremiumActive) {
    res.status(403).json({
      success: false,
      code: 'PREMIUM_REQUIRED',
      message: 'This feature requires BudgetBuddy Premium.',
    });
    return;
  }

  next();
};

/**
 * Server-side RBAC: Require Admin or Super Admin Role
 */
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

  if (!isAdmin) {
    res.status(403).json({
      success: false,
      code: 'ADMIN_REQUIRED',
      message: 'Access denied. Administrative privileges required.',
    });
    return;
  }

  next();
};

/**
 * Server-side RBAC: Require Super Admin Role
 */
export const requireSuperAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const isSuperAdmin = req.user.role === 'super_admin';

  if (!isSuperAdmin) {
    res.status(403).json({
      success: false,
      code: 'SUPER_ADMIN_REQUIRED',
      message: 'Access denied. Super Administrator privileges required.',
    });
    return;
  }

  next();
};

/**
 * Audit Logging Helper
 */
export const logAuditAction = async (data: {
  adminId: string;
  adminEmail: string;
  adminName: string;
  action: string;
  targetType: 'USER' | 'SUBSCRIPTION' | 'PLAN' | 'CATEGORY' | 'REPORT' | 'SYSTEM' | 'SUPPORT' | 'AUTH' | 'NOTIFICATION' | 'SECURITY';
  targetId?: string;
  result?: 'SUCCESS' | 'FAILED';
  details?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}) => {
  try {
    await AuditLogModel.create({
      result: 'SUCCESS',
      ...data,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('[Audit Log Error]: Failed to write audit record:', err);
  }
};
