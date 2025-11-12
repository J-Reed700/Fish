import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Profile, GameMode, FishSpecies } from '../types';
import { ImageHandler } from '../profiles/ImageHandler';

interface ProfileEditorProps {
  profileId?: string;
  initialProfile?: Profile;
  onSave: (profile: Omit<Profile, 'id' | 'createdAt' | 'lastPlayedAt'>) => void;
  onCancel: () => void;
  onDelete?: (profileId: string) => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  profileId,
  initialProfile,
  onSave,
  onCancel,
  onDelete,
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [photoUri, setPhotoUri] = useState<string | undefined>(initialProfile?.photoUri);
  const [age, setAge] = useState(initialProfile?.age?.toString() || '');
  const [breed, setBreed] = useState(initialProfile?.breed || '');
  const [favoriteMode, setFavoriteMode] = useState<GameMode | undefined>(
    initialProfile?.preferences.favoriteMode
  );
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | undefined>(
    initialProfile?.preferences.difficulty
  );

  const handlePickImage = async () => {
    const uri = await ImageHandler.pickImage();
    if (uri) {
      try {
        const savedUri = await ImageHandler.saveImage(
          uri,
          profileId || `temp-${Date.now()}`
        );
        setPhotoUri(savedUri);
      } catch (error) {
        Alert.alert('Error', 'Failed to save image');
      }
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Cat name is required');
      return;
    }

    const profileData: Omit<Profile, 'id' | 'createdAt' | 'lastPlayedAt'> = {
      name: name.trim(),
      photoUri,
      age: age ? parseInt(age, 10) : undefined,
      breed: breed.trim() || undefined,
      preferences: {
        favoriteMode,
        difficulty,
      },
    };

    onSave(profileData);
  };

  const handleDelete = () => {
    if (!profileId || !onDelete) return;

    Alert.alert(
      'Delete Profile',
      `Are you sure you want to delete ${name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(profileId),
        },
      ]
    );
  };

  const gameModes: GameMode[] = ['free-swim', 'hunt', 'bubbles', 'frenzy'];
  const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{profileId ? 'Edit Profile' : 'New Profile'}</Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoContainer} onPress={handlePickImage}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : (
              <Text style={styles.photoPlaceholder}>
                {ImageHandler.getDefaultPlaceholder()}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.changePhotoButton} onPress={handlePickImage}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Cat Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter cat's name"
            maxLength={20}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Age (optional)</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="Enter age in years"
            keyboardType="numeric"
            maxLength={2}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Breed (optional)</Text>
          <TextInput
            style={styles.input}
            value={breed}
            onChangeText={setBreed}
            placeholder="e.g., Tabby, Siamese"
            maxLength={30}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Favorite Mode</Text>
          <View style={styles.optionRow}>
            {gameModes.map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.optionButton,
                  favoriteMode === mode && styles.optionButtonActive,
                ]}
                onPress={() => setFavoriteMode(mode)}
              >
                <Text
                  style={[
                    styles.optionText,
                    favoriteMode === mode && styles.optionTextActive,
                  ]}
                >
                  {mode.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Difficulty</Text>
          <View style={styles.optionRow}>
            {difficulties.map((diff) => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.optionButton,
                  difficulty === diff && styles.optionButtonActive,
                ]}
                onPress={() => setDifficulty(diff)}
              >
                <Text
                  style={[
                    styles.optionText,
                    difficulty === diff && styles.optionTextActive,
                  ]}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {profileId && onDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Profile</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
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
    padding: 16,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#e0e0e0',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    fontSize: 48,
  },
  changePhotoButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  changePhotoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#f44336',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  optionButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#ffebee',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '600',
  },
});
