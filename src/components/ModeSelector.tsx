import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { GameMode } from '../types';

interface ModeInfo {
  icon: string;
  title: string;
  description: string;
  intensity: string;
  recommended: string;
}

const MODE_INFO: Record<GameMode, ModeInfo> = {
  'free-swim': {
    icon: '🐟',
    title: 'Free Swim',
    description: 'Calm, natural swimming. Perfect for relaxed play.',
    intensity: 'Low',
    recommended: 'All cats, beginners',
  },
  'hunt': {
    icon: '⚡',
    title: 'Hunt Mode',
    description: 'Fast, erratic fish. Challenging chase!',
    intensity: 'High',
    recommended: 'Energetic cats, kittens',
  },
  'bubbles': {
    icon: '🫧',
    title: 'Bubbles',
    description: 'Gentle floating bubbles. Soothing and calm.',
    intensity: 'Very Low',
    recommended: 'Anxious cats, seniors',
  },
  'frenzy': {
    icon: '🌀',
    title: 'Frenzy',
    description: 'Many fish, chaotic movement. High energy!',
    intensity: 'Very High',
    recommended: 'Playful cats, multiple cats',
  },
  'mouse': {
    icon: '🐭',
    title: 'Mouse Hunt',
    description: 'Scurrying mice with realistic behavior. Exciting chase!',
    intensity: 'Medium',
    recommended: 'All cats',
  },
  'laser': {
    icon: '🔴',
    title: 'Laser Chase',
    description: 'Fast-moving red dot. The classic!',
    intensity: 'Very High',
    recommended: 'Active cats',
  },
  'insect': {
    icon: '🦋',
    title: 'Bug Hunt',
    description: 'Butterflies and flies with realistic flight.',
    intensity: 'Medium',
    recommended: 'All cats',
  },
  'variety': {
    icon: '🎪',
    title: 'Variety Mix',
    description: 'Mix of all prey types. Ultimate variety!',
    intensity: 'High',
    recommended: 'Experienced cats',
  },
};

interface ModeSelectorProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onClose?: () => void;
}

interface ModeCardProps {
  mode: GameMode;
  info: ModeInfo;
  isSelected: boolean;
  onSelect: () => void;
}

interface BadgeProps {
  text: string;
  color: string;
}

const getIntensityColor = (intensity: string): string => {
  switch (intensity) {
    case 'Very Low':
      return '#4CAF50';
    case 'Low':
      return '#03A9F4';
    case 'Medium':
      return '#9C27B0';
    case 'High':
      return '#FF9800';
    case 'Very High':
      return '#F44336';
    default:
      return '#03A9F4';
  }
};

const Badge: React.FC<BadgeProps> = ({ text, color }) => {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
};

const ModeCard: React.FC<ModeCardProps> = ({ mode, info, isSelected, onSelect }) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{info.icon}</Text>
      <Text style={styles.cardTitle}>{info.title}</Text>
      <Text style={styles.description}>{info.description}</Text>

      <View style={styles.badges}>
        <Badge text={info.intensity} color={getIntensityColor(info.intensity)} />
      </View>

      <Text style={styles.recommended}>👍 {info.recommended}</Text>
    </TouchableOpacity>
  );
};

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
  onClose,
}) => {
  const { width } = Dimensions.get('window');
  const isTabletLandscape = width > 768;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Select Game Mode</Text>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[
            styles.grid,
            isTabletLandscape && styles.gridLandscape
          ]}>
            {(Object.keys(MODE_INFO) as GameMode[]).map((mode) => (
              <ModeCard
                key={mode}
                mode={mode}
                info={MODE_INFO[mode]}
                isSelected={mode === currentMode}
                onSelect={() => onModeChange(mode)}
              />
            ))}
          </View>
        </ScrollView>

        {onClose && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeText}>Start Playing</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001a33',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 800,
    maxHeight: '90%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  gridLandscape: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '45%',
    minWidth: 160,
    maxWidth: 200,
    backgroundColor: 'rgba(0, 51, 102, 0.8)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: '#0080FF',
    backgroundColor: 'rgba(0, 128, 255, 0.2)',
  },
  icon: {
    fontSize: 60,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#B0C4DE',
    textAlign: 'center',
    marginBottom: 12,
    minHeight: 60,
  },
  badges: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  recommended: {
    fontSize: 12,
    color: '#B0C4DE',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  closeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#001a33',
  },
});
