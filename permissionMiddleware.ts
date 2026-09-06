import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { FeaturePermissionModel } from '../models/FeaturePermission';

/**
 * Express Middleware to enforce backend feature permission validation.
 * 1. Checks if feature exists in MongoDB.
 * 2. If feature.enabled === false -> denies access (FEATURE_DISABLED).
 * 3. Admins / Super Admins bypass user-tier restrictions.
 * 4. Checks user tier:
 *    - Free User (premiumStatus !== 'ACTIVE'): checks feature.freeUser === true.
 *    - Premium User (premiumStatus === 'ACTIVE'): checks feature.premiumUser === true.
 * 5. Returns structured 403 response if unauthorized.
 */
export const requireFeaturePermission = (featureKey: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const featureDoc = await FeaturePermissionModel.findOne({ feature: featureKey });

      // If feature is not found in database, allow fallback or create default
      if (!featureDoc) {
        return next();
      }

      // 1. Check if the feature is globally disabled by Admin
      if (!featureDoc.enabled) {
        res.status(403).json({
          success: false,
          code: 'FEATURE_DISABLED',
          feature: featureKey,
          featureName: featureDoc.name,
          message: `The '${featureDoc.name}' feature is currently disabled by the platform administrator.`,
        });
        return;
      }

      // 2. Admins and Super Admins have full access to all enabled features
      const user = req.user;
      if (user?.role === 'admin' || user?.role === 'super_admin') {
        return next();
      }

      // 3. User tier checks
      const isPremium = user?.premiumStatus === 'ACTIVE' || user?.role === 'premium';

      if (isPremium) {
        if (!featureDoc.premiumUser) {
          res.status(403).json({
            success: false,
            code: 'FEATURE_DISABLED_FOR_PREMIUM',
            feature: featureKey,
            featureName: featureDoc.name,
            message: `The '${featureDoc.name}' feature is currently unavailable for Premium accounts.`,
          });
          return;
        }
        return next();
      }

      // 4. Free User check
      if (!featureDoc.freeUser) {
        res.status(403).json({
          success: false,
          code: 'FEATURE_REQUIRES_PREMIUM',
          feature: featureKey,
          featureName: featureDoc.name,
          message: `The '${featureDoc.name}' feature requires a BudgetBuddy Premium subscription.`,
          requiresPremium: true,
        });
        return;
      }

      return next();
    } catch (error: any) {
      console.error(`[Permission Middleware] Error validating permission for ${featureKey}:`, error);
      // On error, let request proceed or return safe error
      return next();
    }
  };
};
