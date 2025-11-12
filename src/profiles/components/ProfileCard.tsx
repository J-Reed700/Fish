import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { CatProfile } from '../../types';

interface ProfileCardProps {
  profile: CatProfile;
  onPress: () => void;
  onLongPress: () => void;
  isActive?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onPress, onLongPress, isActive = false }) => {
  const formatPlaytime = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getLastPlayedText = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.photoContainer}>
        {profile.photoUri ? (
          <Image source={{ uri: profile.photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.placeholderPhoto}>
            <Text style={styles.placeholderText}>{profile.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        {isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>✓</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {profile.name}
        </Text>
        {profile.breed && (
          <Text style={styles.breed} numberOfLines={1}>
            {profile.breed}
          </Text>
        )}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.stats.totalCatches}</Text>
            <Text style={styles.statLabel}>Catches</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatPlaytime(profile.stats.totalPlaytime)}</Text>
            <Text style={styles.statLabel}>Playtime</Text>
          </View>
        </View>

        <Text style={styles.lastPlayed}>{getLastPlayedText(profile.lastPlayed)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeContainer: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  photoContainer: {
    position: 'relative',
    marginRight: 16,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#757575',
  },
  activeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  breed: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stat: {
    marginRight: 24,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  statLabel: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  lastPlayed: {
    fontSize: 12,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
});
