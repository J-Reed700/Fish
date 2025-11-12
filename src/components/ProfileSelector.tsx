import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { ProfileState, Profile } from '../types';
import { ProfileCard } from './ProfileCard';
import { ProfileEditor } from './ProfileEditor';
import { ProfileManager } from '../profiles/ProfileManager';

interface ProfileSelectorProps {
  profileState: ProfileState;
  onSelectProfile: (profileId: string) => void;
  onUpdateState: (state: ProfileState) => void;
  onClose: () => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  profileState,
  onSelectProfile,
  onUpdateState,
  onClose,
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | undefined>();

  const handleSelectProfile = async (profileId: string) => {
    if (profileId === profileState.activeProfileId) {
      onClose();
      return;
    }

    try {
      const newState = await ProfileManager.setActiveProfile(profileId, profileState);
      onUpdateState(newState);
      onSelectProfile(profileId);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to switch profile');
    }
  };

  const handleAddProfile = () => {
    if (!ProfileManager.canAddProfile(profileState)) {
      showUpgradePrompt();
      return;
    }
    setEditingProfile(undefined);
    setShowEditor(true);
  };

  const handleEditProfile = (profile: Profile) => {
    if (profile.id === profileState.activeProfileId) {
      Alert.alert(
        'Active Profile',
        'To delete this profile, please switch to another profile first.',
        [{ text: 'OK' }]
      );
      return;
    }
    setEditingProfile(profile);
    setShowEditor(true);
  };

  const handleSaveProfile = async (
    profileData: Omit<Profile, 'id' | 'createdAt' | 'lastPlayedAt'>
  ) => {
    try {
      let newState: ProfileState;

      if (editingProfile) {
        newState = await ProfileManager.updateProfile(
          editingProfile.id,
          profileData,
          profileState
        );
      } else {
        newState = await ProfileManager.createProfile(profileData, profileState);
      }

      onUpdateState(newState);
      setShowEditor(false);
      setEditingProfile(undefined);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    try {
      const newState = await ProfileManager.deleteProfile(profileId, profileState);
      onUpdateState(newState);
      setShowEditor(false);
      setEditingProfile(undefined);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete profile');
    }
  };

  const showUpgradePrompt = () => {
    const tierLimits = {
      1: { name: 'Free', next: 'Premium (3 profiles)' },
      3: { name: 'Premium', next: 'Family (6 profiles)' },
      6: { name: 'Family', next: null },
    };

    const currentTier = tierLimits[profileState.tierLimit as keyof typeof tierLimits];

    if (!currentTier.next) {
      Alert.alert(
        'Profile Limit Reached',
        `You've reached the maximum of ${profileState.tierLimit} profiles for the Family tier.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Profile Limit Reached',
      `You've reached the ${profileState.tierLimit} profile limit for the ${currentTier.name} tier.\n\nUpgrade to ${currentTier.next} to add more profiles.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade', onPress: () => {} },
      ]
    );
  };

  if (showEditor) {
    return (
      <Modal visible={true} animationType="slide" onRequestClose={() => setShowEditor(false)}>
        <ProfileEditor
          profileId={editingProfile?.id}
          initialProfile={editingProfile}
          onSave={handleSaveProfile}
          onCancel={() => {
            setShowEditor(false);
            setEditingProfile(undefined);
          }}
          onDelete={editingProfile ? handleDeleteProfile : undefined}
        />
      </Modal>
    );
  }

  return (
    <Modal visible={true} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Cat Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.profileGrid}>
              {profileState.profiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  isActive={profile.id === profileState.activeProfileId}
                  onPress={() => handleSelectProfile(profile.id)}
                  onLongPress={() => handleEditProfile(profile)}
                />
              ))}

              {ProfileManager.canAddProfile(profileState) && (
                <TouchableOpacity style={styles.addCard} onPress={handleAddProfile}>
                  <View style={styles.addIcon}>
                    <Text style={styles.addIconText}>+</Text>
                  </View>
                  <Text style={styles.addText}>New</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoText}>
                Profiles: {profileState.profiles.length} / {profileState.tierLimit}
              </Text>
              <Text style={styles.hintText}>Long-press a profile to edit or delete</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  addCard: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    width: 100,
    margin: 8,
  },
  addIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addIconText: {
    fontSize: 32,
    color: '#999',
  },
  addText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  infoSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
