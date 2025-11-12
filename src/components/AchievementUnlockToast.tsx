import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Achievement } from '../types';

interface AchievementUnlockToastProps {
  achievement: Achievement;
  onDismiss: () => void;
  onPress?: () => void;
}

export const AchievementUnlockToast: React.FC<AchievementUnlockToastProps> = ({
  achievement,
  onDismiss,
  onPress,
}) => {
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      dismiss();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
    dismiss();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.toast}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.header}>
          <Text style={styles.trophy}>🏆</Text>
          <Text style={styles.title}>Achievement Unlocked!</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.icon}>{achievement.icon}</Text>
          <View style={styles.info}>
            <Text style={styles.achievementTitle}>{achievement.title}</Text>
            <Text style={styles.points}>+{achievement.reward.points} points</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toast: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trophy: {
    fontSize: 24,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  points: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },
});

interface AchievementToastQueueProps {
  achievements: Achievement[];
  onDismiss: (achievement: Achievement) => void;
  onPress?: (achievement: Achievement) => void;
}

export const AchievementToastQueue: React.FC<AchievementToastQueueProps> = ({
  achievements,
  onDismiss,
  onPress,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  useEffect(() => {
    if (achievements.length === 0) {
      setCurrentIndex(0);
    }
  }, [achievements.length]);

  const handleDismiss = () => {
    const current = achievements[currentIndex];
    onDismiss(current);
    setCurrentIndex(prev => prev + 1);
  };

  if (currentIndex >= achievements.length) {
    return null;
  }

  return (
    <AchievementUnlockToast
      achievement={achievements[currentIndex]}
      onDismiss={handleDismiss}
      onPress={onPress ? () => onPress(achievements[currentIndex]) : undefined}
    />
  );
};
