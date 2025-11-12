import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { ShareContentType } from '../../types';

interface ShareButtonProps {
  contentType: ShareContentType;
  contentId?: string;
  variant?: 'icon-only' | 'button' | 'floating';
  onPress: () => Promise<void>;
  style?: ViewStyle;
  disabled?: boolean;
  label?: string;
  icon?: React.ReactNode;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  contentType,
  contentId,
  variant = 'button',
  onPress,
  style,
  disabled = false,
  label,
  icon,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (isLoading || disabled) return;

    try {
      setIsLoading(true);
      await onPress();
    } catch (error) {
      console.error('Share button error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultLabel = (): string => {
    if (label) return label;

    switch (contentType) {
      case 'achievement':
        return 'Share Achievement';
      case 'high-score':
        return 'Share Score';
      case 'boss-victory':
        return 'Share Victory';
      case 'profile':
        return 'Share Profile';
      case 'streak':
        return 'Share Streak';
      case 'mini-game':
        return 'Share Score';
      default:
        return 'Share';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator color="#FFFFFF" size="small" />;
    }

    if (variant === 'icon-only') {
      return icon || <Text style={styles.iconText}>⬆️</Text>;
    }

    return (
      <View style={styles.buttonContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.buttonText}>{getDefaultLabel()}</Text>
      </View>
    );
  };

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyles: ViewStyle[] = [styles.button];

    if (variant === 'icon-only') {
      baseStyles.push(styles.iconButton);
    } else if (variant === 'floating') {
      baseStyles.push(styles.floatingButton);
    }

    if (disabled) {
      baseStyles.push(styles.disabled);
    }

    if (style) {
      baseStyles.push(style);
    }

    return baseStyles;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  iconText: {
    fontSize: 24,
  },
  disabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
});
