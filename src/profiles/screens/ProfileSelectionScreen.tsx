import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useProfiles } from '../hooks/useProfiles';
import { ProfileCard } from '../components/ProfileCard';
import TierValidator from '../utils/TierValidator';

interface ProfileSelectionScreenProps {
  onNavigateToEditor: (profileId?: string) => void;
  onNavigateToStats: (profileId: string) => void;
}

export const ProfileSelectionScreen: React.FC<ProfileSelectionScreenProps> = ({
  onNavigateToEditor,
  onNavigateToStats,
}) => {
  const { profiles, loading, tier, switchProfile, deleteProfile } = useProfiles();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleProfilePress = async (profileId: string) => {
    const result = await switchProfile(profileId);
    if (!result.success) {
      Alert.alert('Error', result.error || 'Failed to switch profile');
    }
  };

  const handleProfileLongPress = (profileId: string) => {
    Alert.alert('Profile Options', 'What would you like to do?', [
      {
        text: 'Edit',
        onPress: () => onNavigateToEditor(profileId),
      },
      {
        text: 'View Stats',
        onPress: () => onNavigateToStats(profileId),
      },
      {
        text: 'Delete',
        onPress: () => handleDeleteProfile(profileId),
        style: 'destructive',
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const handleDeleteProfile = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    Alert.alert(
      'Delete Profile',
      `Are you sure you want to delete "${profile.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(profileId);
            const result = await deleteProfile(profileId);
            setDeletingId(null);

            if (!result.success) {
              Alert.alert('Error', result.error || 'Failed to delete profile');
            }
          },
        },
      ]
    );
  };

  const handleAddProfile = () => {
    const validation = TierValidator.validateProfileCreation(tier, profiles.length);

    if (!validation.valid) {
      Alert.alert('Profile Limit Reached', validation.upgradeMessage || validation.error, [
        {
          text: 'Maybe Later',
          style: 'cancel',
        },
        {
          text: 'Upgrade',
          onPress: () => {
          },
        },
      ]);
      return;
    }

    onNavigateToEditor();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading profiles...</Text>
      </View>
    );
  }

  const activeProfile = profiles.find(p => p.isActive);
  const canAddProfile = TierValidator.canCreateProfile(tier, profiles.length);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cat Profiles</Text>
        <Text style={styles.subtitle}>
          {profiles.length} of {TierValidator.getMaxProfiles(tier)} profiles
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {profiles.map((profile) => (
          <View key={profile.id}>
            {deletingId === profile.id ? (
              <View style={styles.deletingCard}>
                <ActivityIndicator size="small" color="#757575" />
                <Text style={styles.deletingText}>Deleting...</Text>
              </View>
            ) : (
              <ProfileCard
                profile={profile}
                onPress={() => handleProfilePress(profile.id)}
                onLongPress={() => handleProfileLongPress(profile.id)}
                isActive={profile.isActive}
              />
            )}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.addCard, !canAddProfile && styles.addCardDisabled]}
          onPress={handleAddProfile}
          activeOpacity={0.7}
        >
          <View style={styles.addIconContainer}>
            <Text style={styles.addIcon}>{canAddProfile ? '+' : '🔒'}</Text>
          </View>
          <Text style={styles.addText}>
            {canAddProfile ? 'Add New Profile' : 'Upgrade for More Profiles'}
          </Text>
          {!canAddProfile && <Text style={styles.addSubtext}>Premium or Family plan required</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  deletingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  deletingText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#757575',
  },
  addCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardDisabled: {
    borderColor: '#BDBDBD',
    opacity: 0.6,
  },
  addIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F8F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  addIcon: {
    fontSize: 36,
    color: '#4CAF50',
  },
  addText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  addSubtext: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
});
