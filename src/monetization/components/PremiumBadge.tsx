import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PremiumBadgeProps {
  variant?: 'lock' | 'premium' | 'family';
  size?: 'small' | 'medium' | 'large';
}

export function PremiumBadge({ variant = 'lock', size = 'medium' }: PremiumBadgeProps) {
  const getContent = () => {
    switch (variant) {
      case 'lock':
        return { icon: '🔒', text: 'Premium' };
      case 'premium':
        return { icon: '⭐', text: 'Premium' };
      case 'family':
        return { icon: '👨‍👩‍👧‍👦', text: 'Family' };
      default:
        return { icon: '🔒', text: 'Premium' };
    }
  };

  const content = getContent();
  const sizeStyle = size === 'small' ? styles.small : size === 'large' ? styles.large : styles.medium;

  return (
    <View style={[styles.badge, sizeStyle]}>
      <Text style={[styles.icon, sizeStyle]}>{content.icon}</Text>
      <Text style={[styles.text, sizeStyle]}>{content.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  icon: {
    fontSize: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  large: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
});
