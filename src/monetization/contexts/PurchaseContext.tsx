import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CustomerInfo } from 'react-native-purchases';
import RevenueCatService from '../services/RevenueCatService';
import type { PurchaseState } from '../types/purchase.types';

interface PurchaseContextValue {
  state: PurchaseState;
  purchasePremium: () => Promise<void>;
  purchaseFamily: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  refreshCustomerInfo: () => Promise<void>;
}

const PurchaseContext = createContext<PurchaseContextValue | undefined>(undefined);

export function PurchaseProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PurchaseState>({
    tier: 'free',
    isPremium: false,
    isFamily: false,
    isLoading: true,
    error: null,
    customerInfo: null,
  });

  useEffect(() => {
    initializeRevenueCat();
  }, []);

  const initializeRevenueCat = async () => {
    try {
      await RevenueCatService.initialize();
      await refreshCustomerInfo();
    } catch (error: any) {
      console.error('[PurchaseContext] Initialization failed:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to initialize purchases',
      }));
    }
  };

  const refreshCustomerInfo = useCallback(async () => {
    try {
      const customerInfo = await RevenueCatService.getCustomerInfo();
      const tier = RevenueCatService.getTierFromCustomerInfo(customerInfo);

      setState({
        tier,
        isPremium: tier === 'premium' || tier === 'family',
        isFamily: tier === 'family',
        isLoading: false,
        error: null,
        customerInfo,
      });
    } catch (error: any) {
      console.error('[PurchaseContext] Failed to load customer info:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to load purchase status',
      }));
    }
  }, []);

  const purchasePremium = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const result = await RevenueCatService.purchasePackage('premium');

    if (result.success) {
      await refreshCustomerInfo();
    } else {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: result.error?.userFacingMessage || 'Purchase failed',
      }));
    }
  }, [refreshCustomerInfo]);

  const purchaseFamily = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const result = await RevenueCatService.purchasePackage('family');

    if (result.success) {
      await refreshCustomerInfo();
    } else {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: result.error?.userFacingMessage || 'Purchase failed',
      }));
    }
  }, [refreshCustomerInfo]);

  const restorePurchases = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    const result = await RevenueCatService.restorePurchases();

    if (result.success) {
      await refreshCustomerInfo();
    } else {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: result.error?.userFacingMessage || 'No purchases to restore',
      }));
    }
  }, [refreshCustomerInfo]);

  return (
    <PurchaseContext.Provider
      value={{
        state,
        purchasePremium,
        purchaseFamily,
        restorePurchases,
        refreshCustomerInfo,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchaseContext() {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchaseContext must be used within PurchaseProvider');
  }
  return context;
}
