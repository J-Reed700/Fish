import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { usePurchase } from '../hooks/usePurchase';
import { PRICING } from '../config/products';

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  context?: 'prey' | 'environment' | 'profile' | 'stats' | 'general';
}

export function Paywall({ visible, onClose, context = 'general' }: PaywallProps) {
  const { purchasePremium, purchaseFamily, restorePurchases, isLoading, error } = usePurchase();
  const [selectedTier, setSelectedTier] = useState<'premium' | 'family'>('premium');

  const handlePurchase = async () => {
    if (selectedTier === 'premium') {
      await purchasePremium();
    } else {
      await purchaseFamily();
    }

    if (!error) {
      onClose();
    }
  };

  const handleRestore = async () => {
    await restorePurchases();
    if (!error) {
      onClose();
    }
  };

  const getContextualHeadline = () => {
    switch (context) {
      case 'prey':
        return 'Unlock All 15+ Prey Types';
      case 'environment':
        return 'Unlock All 12 Environments';
      case 'profile':
        return 'Create More Cat Profiles';
      case 'stats':
        return 'Unlock Lifetime Statistics';
      default:
        return 'Unlock Premium Features';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.headline}>{getContextualHeadline()}</Text>
          <Text style={styles.subheadline}>
            One-time purchase. No subscriptions. No ads. Ever.
          </Text>

          <TouchableOpacity
            style={[styles.tierCard, selectedTier === 'premium' && styles.tierCardSelected]}
            onPress={() => setSelectedTier('premium')}
          >
            <View style={styles.tierHeader}>
              <Text style={styles.tierName}>Premium</Text>
              <Text style={styles.tierPrice}>${PRICING.premium}</Text>
            </View>
            <Text style={styles.tierSubtitle}>Perfect for single-cat households</Text>

            <View style={styles.features}>
              <FeatureItem text="All 15+ prey types" />
              <FeatureItem text="All 12 environments" />
              <FeatureItem text="3 cat profiles" />
              <FeatureItem text="Lifetime statistics" />
              <FeatureItem text="Unlimited screenshots" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tierCard,
              selectedTier === 'family' && styles.tierCardSelected,
              styles.familyCard,
            ]}
            onPress={() => setSelectedTier('family')}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>BEST VALUE</Text>
            </View>

            <View style={styles.tierHeader}>
              <Text style={styles.tierName}>Family</Text>
              <Text style={styles.tierPrice}>${PRICING.family}</Text>
            </View>
            <Text style={styles.tierSubtitle}>For multi-cat homes</Text>

            <View style={styles.features}>
              <FeatureItem text="Everything in Premium" highlighted />
              <FeatureItem text="6 cat profiles" highlighted />
              <FeatureItem text="Family dashboard" highlighted />
              <FeatureItem text="Compare cat stats" highlighted />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={handlePurchase}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.purchaseButtonText}>
                Purchase {selectedTier === 'premium' ? 'Premium' : 'Family'} - One Time
              </Text>
            )}
          </TouchableOpacity>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>

          <View style={styles.trustIndicators}>
            <Text style={styles.trustText}>✓ One-time purchase only</Text>
            <Text style={styles.trustText}>✓ No recurring charges</Text>
            <Text style={styles.trustText}>✓ Works on all your devices</Text>
          </View>

          <Text style={styles.footnote}>
            Payment will be charged to your Apple ID/Google Play account. Purchase is
            non-refundable per store policies.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

function FeatureItem({ text, highlighted = false }: { text: string; highlighted?: boolean }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>✓</Text>
      <Text style={[styles.featureText, highlighted && styles.featureTextHighlighted]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    color: '#666',
  },
  headline: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subheadline: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  tierCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  tierCardSelected: {
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  familyCard: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tierName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  tierPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  tierSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  features: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: {
    fontSize: 16,
    color: '#34C759',
  },
  featureText: {
    fontSize: 16,
    color: '#333',
  },
  featureTextHighlighted: {
    fontWeight: '600',
    color: '#007AFF',
  },
  purchaseButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
  },
  restoreButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  restoreText: {
    color: '#007AFF',
    fontSize: 16,
  },
  trustIndicators: {
    alignItems: 'center',
    marginTop: 20,
    gap: 4,
  },
  trustText: {
    fontSize: 14,
    color: '#666',
  },
  footnote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});
