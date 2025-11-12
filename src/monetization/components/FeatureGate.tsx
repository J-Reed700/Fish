import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePremium } from '../hooks/usePremium';

interface FeatureGateProps {
  feature: 'prey' | 'environment' | 'profile' | 'stats';
  requiredTier: 'premium' | 'family';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUpgradePress?: () => void;
}

export function FeatureGate({
  feature,
  requiredTier,
  children,
  fallback,
  onUpgradePress,
}: FeatureGateProps) {
  const { isPremium, isFamily } = usePremium();

  const hasAccess =
    (requiredTier === 'premium' && (isPremium || isFamily)) ||
    (requiredTier === 'family' && isFamily);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <View style={styles.lockedContainer}>
      <Text style={styles.lockedText}>
        {requiredTier === 'family' ? '🔒 Family Tier Feature' : '🔒 Premium Feature'}
      </Text>
      {onUpgradePress && (
        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgradePress}>
          <Text style={styles.upgradeButtonText}>Upgrade</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  lockedContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  lockedText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
