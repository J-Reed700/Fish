import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Reward } from '../types';

interface RewardUnlockModalProps {
  visible: boolean;
  reward: Reward | null;
  onClose: () => void;
}

export const RewardUnlockModal: React.FC<RewardUnlockModalProps> = ({
  visible,
  reward,
  onClose,
}) => {
  if (!reward) return null;

  const getRewardIcon = (type: string, value: string | number) => {
    switch (type) {
      case 'prey-unlock':
        if (value === 'mouse') return '🐭';
        if (value === 'laser') return '🔴';
        if (value === 'insect') return '🦋';
        return '🎯';
      case 'theme-unlock':
        return '🎨';
      case 'achievement':
        return '🏆';
      case 'points':
        return '⭐';
      default:
        return '🎁';
    }
  };

  const getRewardTitle = (type: string) => {
    switch (type) {
      case 'prey-unlock':
        return 'New Prey Unlocked!';
      case 'theme-unlock':
        return 'New Theme Unlocked!';
      case 'achievement':
        return 'Achievement Unlocked!';
      case 'points':
        return 'Points Earned!';
      default:
        return 'Reward Unlocked!';
    }
  };

  const getRewardDescription = (type: string, value: string | number) => {
    switch (type) {
      case 'prey-unlock':
        if (value === 'mouse') return 'You can now hunt mice in Mouse Mode!';
        if (value === 'laser') return 'You can now chase laser pointers in Laser Mode!';
        if (value === 'insect') return 'You can now catch insects in Insect Mode!';
        return 'A new prey type is now available!';
      case 'theme-unlock':
        return `The ${value} theme is now available in settings!`;
      case 'achievement':
        return 'Congratulations on earning this achievement!';
      case 'points':
        return `You earned ${value} points!`;
      default:
        return '';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.celebration}>🎉</Text>
          <Text style={styles.title}>{getRewardTitle(reward.type)}</Text>

          <Text style={styles.icon}>{getRewardIcon(reward.type, reward.value)}</Text>

          <Text style={styles.rewardName}>{reward.displayName}</Text>

          <Text style={styles.description}>
            {getRewardDescription(reward.type, reward.value)}
          </Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Awesome!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
    maxWidth: 400,
    width: '100%',
  },
  celebration: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fbbf24',
    marginBottom: 24,
    textAlign: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  rewardName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
    minWidth: 150,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
  },
});
