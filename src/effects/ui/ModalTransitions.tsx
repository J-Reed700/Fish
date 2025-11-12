import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface ModalTransitionsProps {
  children: React.ReactNode;
  visible: boolean;
  animationType?: 'slide' | 'fade' | 'scale' | 'slideUp';
  duration?: number;
  onClose?: () => void;
}

export const ModalTransitions: React.FC<ModalTransitionsProps> = ({
  children,
  visible,
  animationType = 'slideUp',
  duration = 300,
  onClose,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(height);
  const translateX = useSharedValue(width);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.ease),
      });

      switch (animationType) {
        case 'slideUp':
          translateY.value = withSpring(0, {
            damping: 20,
            stiffness: 300,
          });
          break;
        case 'slide':
          translateX.value = withSpring(0, {
            damping: 20,
            stiffness: 300,
          });
          break;
        case 'scale':
          scale.value = withSpring(1, {
            damping: 15,
            stiffness: 200,
          });
          break;
      }
    } else {
      opacity.value = withTiming(0, {
        duration: duration * 0.7,
        easing: Easing.in(Easing.ease),
      });

      switch (animationType) {
        case 'slideUp':
          translateY.value = withTiming(height, {
            duration: duration * 0.7,
            easing: Easing.in(Easing.ease),
          });
          break;
        case 'slide':
          translateX.value = withTiming(width, {
            duration: duration * 0.7,
            easing: Easing.in(Easing.ease),
          });
          break;
        case 'scale':
          scale.value = withTiming(0.8, {
            duration: duration * 0.7,
            easing: Easing.in(Easing.ease),
          });
          break;
      }
    }
  }, [visible, animationType, duration]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => {
    const baseStyle: any = {
      opacity: opacity.value,
    };

    switch (animationType) {
      case 'slideUp':
        baseStyle.transform = [{ translateY: translateY.value }];
        break;
      case 'slide':
        baseStyle.transform = [{ translateX: translateX.value }];
        break;
      case 'scale':
        baseStyle.transform = [{ scale: scale.value }];
        break;
      case 'fade':
        break;
    }

    return baseStyle;
  });

  if (!visible && opacity.value === 0) {
    return null;
  }

  return (
    <>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
      </Animated.View>
      <Animated.View style={[styles.content, contentStyle]}>
        {children}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ModalTransitions;
