import { usePurchaseContext } from '../contexts/PurchaseContext';
import { getFeatureAccess } from '../utils/featureAccess';

export function usePurchase() {
  const context = usePurchaseContext();
  const { state } = context;
  const access = getFeatureAccess(state.tier);

  return {
    ...context,
    tier: state.tier,
    isPremium: state.isPremium,
    isFamily: state.isFamily,
    isLoading: state.isLoading,
    error: state.error,
    access,
  };
}
