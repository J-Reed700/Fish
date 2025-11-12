import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useProfiles } from '../hooks/useProfiles';
import { useProfilePhoto } from '../hooks/useProfilePhoto';
import { PhotoPicker } from '../components/PhotoPicker';
import { PhotoCropper } from '../components/PhotoCropper';
import { DefaultAvatarGrid } from '../components/DefaultAvatarGrid';
import { CatProfile } from '../../types';

interface ProfileEditorScreenProps {
  profileId?: string;
  onSave: () => void;
  onCancel: () => void;
}

const BREEDS = [
  'Abyssinian',
  'American Shorthair',
  'Bengal',
  'British Shorthair',
  'Calico',
  'Maine Coon',
  'Persian',
  'Ragdoll',
  'Siamese',
  'Tabby',
  'Mixed Breed',
  'Other',
];

const PERSONALITY_TAGS = ['playful', 'lazy', 'curious', 'aggressive', 'shy', 'social'] as const;

export const ProfileEditorScreen: React.FC<ProfileEditorScreenProps> = ({ profileId, onSave, onCancel }) => {
  const { profiles, createProfile, updateProfile } = useProfiles();
  const existingProfile = profiles.find(p => p.id === profileId);
  const { takePhoto, pickFromGallery, loading: photoLoading } = useProfilePhoto(profileId || 'temp');

  const [name, setName] = useState(existingProfile?.name || '');
  const [photoUri, setPhotoUri] = useState(existingProfile?.photoUri || '');
  const [breed, setBreed] = useState(existingProfile?.breed || '');
  const [age, setAge] = useState(existingProfile?.age?.toString() || '');
  const [weight, setWeight] = useState(existingProfile?.weight?.toString() || '');
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>(existingProfile?.weightUnit || 'lbs');
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>(existingProfile?.gender || 'unknown');
  const [personalityTags, setPersonalityTags] = useState<string[]>(existingProfile?.personalityTags || []);

  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [showAvatarGrid, setShowAvatarGrid] = useState(false);
  const [tempPhotoUri, setTempPhotoUri] = useState('');
  const [showBreedPicker, setShowBreedPicker] = useState(false);

  const [saving, setSaving] = useState(false);

  const handleTakePhoto = async () => {
    setShowPhotoPicker(false);
    const result = await takePhoto();
    if (result.success && result.photo) {
      setPhotoUri(result.photo.uri);
    } else if (result.error) {
      Alert.alert('Error', result.error);
    }
  };

  const handlePickFromGallery = async () => {
    setShowPhotoPicker(false);
    const result = await pickFromGallery();
    if (result.success && result.photo) {
      setPhotoUri(result.photo.uri);
    } else if (result.error) {
      Alert.alert('Error', result.error);
    }
  };

  const handleSelectDefaultAvatar = () => {
    setShowPhotoPicker(false);
    setShowAvatarGrid(true);
  };

  const handleAvatarSelected = (avatarId: string) => {
    setPhotoUri(`default_avatar_${avatarId}`);
  };

  const togglePersonalityTag = (tag: string) => {
    if (personalityTags.includes(tag)) {
      setPersonalityTags(personalityTags.filter(t => t !== tag));
    } else {
      setPersonalityTags([...personalityTags, tag]);
    }
  };

  const handleSave = async () => {
    if (name.trim().length < 2) {
      Alert.alert('Invalid Name', 'Name must be at least 2 characters');
      return;
    }

    if (name.trim().length > 30) {
      Alert.alert('Invalid Name', 'Name must be less than 30 characters');
      return;
    }

    setSaving(true);

    try {
      const profileData: Partial<CatProfile> = {
        name: name.trim(),
        photoUri: photoUri || undefined,
        breed: breed || undefined,
        age: age ? parseInt(age) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        weightUnit,
        gender,
        personalityTags: personalityTags as any,
      };

      let result;
      if (existingProfile) {
        result = await updateProfile(existingProfile.id, profileData);
      } else {
        result = await createProfile(name.trim(), photoUri || undefined);
        if (result.success && result.profile) {
          await updateProfile(result.profile.id, profileData);
        }
      }

      if (result.success) {
        onSave();
      } else {
        Alert.alert('Error', result.error || 'Failed to save profile');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{existingProfile ? 'Edit Profile' : 'New Profile'}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : (
            <Text style={[styles.headerButtonText, styles.saveButton]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={() => setShowPhotoPicker(true)} activeOpacity={0.7}>
            {photoUri ? (
              <Image
                source={{ uri: photoUri.startsWith('default_avatar_') ? undefined : photoUri }}
                style={styles.photo}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>📷</Text>
                <Text style={styles.photoPlaceholderLabel}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.photoHint}>Tap to change photo</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter cat's name"
            maxLength={30}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Breed (Optional)</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowBreedPicker(!showBreedPicker)}>
            <Text style={breed ? styles.inputText : styles.placeholderText}>
              {breed || 'Select breed'}
            </Text>
          </TouchableOpacity>
          {showBreedPicker && (
            <View style={styles.picker}>
              {BREEDS.map(b => (
                <TouchableOpacity
                  key={b}
                  style={styles.pickerItem}
                  onPress={() => {
                    setBreed(b);
                    setShowBreedPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.row}>
          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Age (Optional)</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Years"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Weight (Optional)</Text>
            <View style={styles.weightContainer}>
              <TextInput
                style={[styles.input, styles.weightInput]}
                value={weight}
                onChangeText={setWeight}
                placeholder="0.0"
                keyboardType="decimal-pad"
              />
              <TouchableOpacity
                style={styles.unitToggle}
                onPress={() => setWeightUnit(weightUnit === 'lbs' ? 'kg' : 'lbs')}
              >
                <Text style={styles.unitText}>{weightUnit}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Gender (Optional)</Text>
          <View style={styles.genderContainer}>
            {(['male', 'female', 'unknown'] as const).map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.genderButton, gender === g && styles.genderButtonActive]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.genderButtonText, gender === g && styles.genderButtonTextActive]}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Personality Tags (Optional)</Text>
          <View style={styles.tagsContainer}>
            {PERSONALITY_TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[styles.tag, personalityTags.includes(tag) && styles.tagActive]}
                onPress={() => togglePersonalityTag(tag)}
              >
                <Text style={[styles.tagText, personalityTags.includes(tag) && styles.tagTextActive]}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <PhotoPicker
        visible={showPhotoPicker}
        onClose={() => setShowPhotoPicker(false)}
        onTakePhoto={handleTakePhoto}
        onPickFromGallery={handlePickFromGallery}
        onSelectDefaultAvatar={handleSelectDefaultAvatar}
      />

      <DefaultAvatarGrid
        visible={showAvatarGrid}
        onClose={() => setShowAvatarGrid(false)}
        onSelectAvatar={handleAvatarSelected}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#757575',
  },
  saveButton: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 48,
  },
  photoPlaceholderLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  photoHint: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputText: {
    fontSize: 16,
    color: '#212121',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9E9E9E',
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#212121',
  },
  weightContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  weightInput: {
    flex: 1,
  },
  unitToggle: {
    width: 60,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  genderButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  genderButtonText: {
    fontSize: 14,
    color: '#757575',
  },
  genderButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tagActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  tagText: {
    fontSize: 14,
    color: '#757575',
  },
  tagTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
