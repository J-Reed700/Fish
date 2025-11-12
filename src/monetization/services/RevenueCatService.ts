import Purchases, {
  PurchasesOfferings,
  CustomerInfo,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { REVENUECAT_CONFIG, ENTITLEMENTS } from '../config/products';
import type { PurchaseTier, PurchaseResult } from '../types/purchase.types';

class RevenueCatService {
  private initialized = false;

  async initialize(userId?: string): Promise<void> {
    if (this.initialized) return;

    try {
      const apiKey = Platform.select({
        ios: REVENUECAT_CONFIG.ios,
        android: REVENUECAT_CONFIG.android,
        default: REVENUECAT_CONFIG.ios,
      });

      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      Purchases.configure({ apiKey });

      if (userId) {
        await Purchases.logIn(userId);
      }

      this.initialized = true;
      console.log('[RevenueCat] Initialized successfully');
    } catch (error) {
      console.error('[RevenueCat] Initialization failed:', error);
      throw error;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('[RevenueCat] Failed to get customer info:', error);
      throw error;
    }
  }

  async getOfferings(): Promise<PurchasesOfferings> {
    try {
      return await Purchases.getOfferings();
    } catch (error) {
      console.error('[RevenueCat] Failed to get offerings:', error);
      throw error;
    }
  }

  async purchasePackage(packageId: string): Promise<PurchaseResult> {
    try {
      const offerings = await this.getOfferings();
      const packageToPurchase = offerings.current?.availablePackages.find(
        (pkg) => pkg.identifier === packageId
      );

      if (!packageToPurchase) {
        return {
          success: false,
          error: {
            code: 'PACKAGE_NOT_FOUND',
            message: 'Purchase package not found',
            userFacingMessage: 'This purchase option is not available right now.',
          },
        };
      }

      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      const tier = this.getTierFromCustomerInfo(customerInfo);

      return {
        success: true,
        tier,
      };
    } catch (error: any) {
      console.error('[RevenueCat] Purchase failed:', error);

      if (error.userCancelled) {
        return {
          success: false,
          error: {
            code: 'USER_CANCELLED',
            message: 'User cancelled purchase',
            userFacingMessage: 'Purchase cancelled',
          },
        };
      }

      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message || 'Unknown error',
          userFacingMessage: 'Something went wrong. Please try again.',
        },
      };
    }
  }

  async restorePurchases(): Promise<PurchaseResult> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const tier = this.getTierFromCustomerInfo(customerInfo);

      if (tier === 'free') {
        return {
          success: false,
          error: {
            code: 'NO_PURCHASES',
            message: 'No purchases to restore',
            userFacingMessage: 'No previous purchases found.',
          },
        };
      }

      return {
        success: true,
        tier,
      };
    } catch (error: any) {
      console.error('[RevenueCat] Restore failed:', error);
      return {
        success: false,
        error: {
          code: error.code || 'RESTORE_FAILED',
          message: error.message || 'Restore failed',
          userFacingMessage: 'Failed to restore purchases. Please try again.',
        },
      };
    }
  }

  getTierFromCustomerInfo(customerInfo: CustomerInfo): PurchaseTier {
    const { entitlements } = customerInfo;

    if (entitlements.active[ENTITLEMENTS.family]) {
      return 'family';
    }

    if (entitlements.active[ENTITLEMENTS.premium]) {
      return 'premium';
    }

    return 'free';
  }

  checkEntitlement(entitlementId: string, customerInfo: CustomerInfo): boolean {
    return !!customerInfo.entitlements.active[entitlementId];
  }

  async logout(): Promise<void> {
    try {
      await Purchases.logOut();
      console.log('[RevenueCat] Logged out successfully');
    } catch (error) {
      console.error('[RevenueCat] Logout failed:', error);
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export default new RevenueCatService();
