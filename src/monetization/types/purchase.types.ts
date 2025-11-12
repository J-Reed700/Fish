import { CustomerInfo as RCCustomerInfo } from 'react-native-purchases';

export type PurchaseTier = 'free' | 'premium' | 'family';
export type EntitlementStatus = 'active' | 'expired' | 'none';

export interface PurchaseState {
  tier: PurchaseTier;
  isPremium: boolean;
  isFamily: boolean;
  isLoading: boolean;
  error: string | null;
  customerInfo: RCCustomerInfo | null;
}

export interface FeatureAccess {
  maxProfiles: number;
  availablePreyTypes: string[];
  availableEnvironments: string[];
  statsRetentionDays: number | 'lifetime';
  hasFamilyDashboard: boolean;
}

export interface PurchaseError {
  code: string;
  message: string;
  userFacingMessage: string;
}

export interface PurchaseResult {
  success: boolean;
  tier?: PurchaseTier;
  error?: PurchaseError;
}
