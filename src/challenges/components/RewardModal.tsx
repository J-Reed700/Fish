import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import type { RewardResult } from '../services/RewardManager';

interface RewardModalProps {
  visible: boolean;
  reward: RewardResult | null;
  onClose: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  visible,
  reward,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 20 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      rotation: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (visible && reward) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      confettiAnims.forEach((anim, index) => {
        const delay = index * 50;
        const randomX = (Math.random() - 0.5) * 400;
        const randomRotation = Math.random() * 720;

        Animated.parallel([
          Animated.timing(anim.x, {
            toValue: randomX,
            duration: 2000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim.y, {
            toValue: 600,
            duration: 2000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotation, {
            toValue: randomRotation,
            duration: 2000,
            delay,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      confettiAnims.forEach((anim) => {
        anim.x.setValue(0);
        anim.y.setValue(0);
        anim.rotation.setValue(0);
      });
    }
  }, [visible, reward]);

  if (!reward) return null;

  const confettiColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {confettiAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                backgroundColor: confettiColors[index % confettiColors.length],
                transform: [
                  { translateX: anim.x },
                  { translateY: anim.y },
                  { rotate: anim.rotation.interpolate({
                    inputRange: [0, 720],
                    outputRange: ['0deg', '720deg'],
                  })},
                ],
              },
            ]}
          />
        ))}

        <Animated.View
          style={[
            styles.modal,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>🎉 Challenge Complete! 🎉</Text>
          </View>

          <View style={styles.content}>
            {reward.xpGained > 0 && (
              <View style={styles.rewardItem}>
                <Text style={styles.rewardIcon}>⭐</Text>
                <Text style={styles.rewardText}>+{reward.xpGained} XP</Text>
              </View>
            )}

            {reward.badgesUnlocked.length > 0 && (
              <View style={styles.rewardItem}>
                <Text style={styles.rewardIcon}>🏅</Text>
                <Text style={styles.rewardText}>
                  {reward.badgesUnlocked.length} Badge{reward.badgesUnlocked.length > 1 ? 's' : ''} Unlocked
                </Text>
              </View>
            )}

            {reward.currencyGained > 0 && (
              <View style={styles.rewardItem}>
                <Text style={styles.rewardIcon}>🪙</Text>
                <Text style={styles.rewardText}>+{reward.currencyGained} Fish Coins</Text>
              </View>
            )}

            {reward.contentUnlocked.length > 0 && (
              <View style={styles.rewardItem}>
                <Text style={styles.rewardIcon}>🔓</Text>
                <Text style={styles.rewardText}>
                  {reward.contentUnlocked.length} Item{reward.contentUnlocked.length > 1 ? 's' : ''} Unlocked
                </Text>
              </View>
            )}

            {reward.leveledUp && reward.newLevel && (
              <View style={styles.levelUpContainer}>
                <Text style={styles.levelUpText}>🎊 LEVEL UP! 🎊</Text>
                <Text style={styles.levelUpNumber}>Level {reward.newLevel}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Claim Rewards</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    top: -20,
    left: Dimensions.get('window').width / 2,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  content: {
    marginBottom: 24,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  rewardIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  rewardText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  levelUpContainer: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  levelUpText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  levelUpNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
