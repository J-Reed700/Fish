import { usePurchaseContext } from '../contexts/PurchaseContext';

export function usePremium() {
  const { state } = usePurchaseContext();

  return {
    isPremium: state.isPremium,
    isFamily: state.isFamily,
    tier: state.tier,
    loading: state.isLoading,
    error: state.error,
  };
}
