import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Profile, Achievement } from '../types';
import { ImageHandler } from '../profiles/ImageHandler';
import { AchievementManager } from '../achievements/AchievementManager';
import { AchievementBadgeGrid } from './AchievementBadge';

interface ProfileCardProps {
  profile: Profile;
  isActive?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  showAchievements?: boolean;
  onViewAchievements?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isActive = false,
  onPress,
  onLongPress,
  showAchievements = false,
  onViewAchievements,
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    if (showAchievements) {
      loadAchievements();
    }
  }, [showAchievements, profile.id]);

  const loadAchievements = async () => {
    const loaded = await AchievementManager.loadAchievements(profile.id);
    const unlocked = loaded.filter(a => a.unlocked);
    setAchievements(unlocked);
  };

  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={[styles.photoContainer, isActive && styles.activePhotoContainer]}>
        {profile.photoUri ? (
          <Image source={{ uri: profile.photoUri }} style={styles.photo} />
        ) : (
          <Text style={styles.placeholder}>{ImageHandler.getDefaultPlaceholder()}</Text>
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {profile.name}
      </Text>
      {profile.age && (
        <View style={styles.ageBadge}>
          <Text style={styles.ageText}>{profile.age}y</Text>
        </View>
      )}
      {isActive && (
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>✓</Text>
        </View>
      )}
      {showAchievements && achievements.length > 0 && (
        <View style={styles.achievementsContainer}>
          <AchievementBadgeGrid
            achievements={achievements}
            maxDisplay={3}
            onViewAllPress={onViewAchievements}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    width: 100,
    margin: 8,
  },
  activeContainer: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f9f0',
  },
  photoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  activePhotoContainer: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    fontSize: 32,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  ageBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ageText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  activeBadge: {
    position: 'absolute',
    bottom: 32,
    right: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  achievementsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    width: '100%',
    alignItems: 'center',
  },
});
