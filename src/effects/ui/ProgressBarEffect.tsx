import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface ProgressBarEffectProps {
  progress: number;
  maxProgress: number;
  width: number;
  height?: number;
  colors?: string[];
  showParticles?: boolean;
  animated?: boolean;
  onMilestone?: (milestone: number) => void;
}

export const ProgressBarEffect: React.FC<ProgressBarEffectProps> = ({
  progress,
  maxProgress,
  width,
  height = 20,
  colors = ['#4CAF50', '#8BC34A'],
  showParticles = true,
  animated = true,
  onMilestone,
}) => {
  const fillWidth = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const shakeOffset = useSharedValue(0);
  const particleOpacity = useSharedValue(0);

  const percentage = Math.min(100, (progress / maxProgress) * 100);

  useEffect(() => {
    const targetWidth = (percentage / 100) * width;

    if (animated) {
      fillWidth.value = withSpring(targetWidth, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      fillWidth.value = targetWidth;
    }

    if (percentage === 100) {
      glowOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0.5, { duration: 300 })
      );

      shakeOffset.value = withSequence(
        withTiming(3, { duration: 50 }),
        withTiming(-3, { duration: 50 }),
        withTiming(3, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );

      onMilestone?.(maxProgress);
    }

    const milestones = [25, 50, 75];
    const currentMilestone = milestones.find(
      (m) => percentage >= m && percentage < m + 5
    );

    if (currentMilestone) {
      particleOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 500 })
      );
      onMilestone?.(currentMilestone);
    }
  }, [progress, maxProgress, width, animated]);

  const fillStyle = useAnimatedStyle(() => ({
    width: fillWidth.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }],
  }));

  const particleStyle = useAnimatedStyle(() => ({
    opacity: particleOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, { width, height }, containerStyle]}>
      <View style={[styles.background, { height }]}>
        <Animated.View style={[styles.fill, fillStyle, { height }]}>
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {showParticles && (
          <Animated.View style={[styles.particles, particleStyle]}>
            {[...Array(5)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.particle,
                  {
                    left: `${(i / 5) * 100}%`,
                    top: Math.random() * height,
                  },
                ]}
              />
            ))}
          </Animated.View>
        )}

        <Animated.View style={[styles.glow, glowStyle, { height }]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  background: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 10,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    backgroundColor: '#FFD700',
    opacity: 0,
    borderRadius: 10,
  },
  particles: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFD700',
  },
});

export default ProgressBarEffect;
