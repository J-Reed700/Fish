import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { ThemeManager } from '../themes/ThemeManager';
import { ThemePreview } from './ThemePreview';
import { Theme } from '../types';

interface ThemeSelectorProps {
  profileId: string;
  onSelectTheme: (themeId: string) => void;
  onClose: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  profileId,
  onSelectTheme,
  onClose,
}) => {
  const [allThemes, setAllThemes] = useState<Theme[]>([]);
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>([]);
  const [currentThemeId, setCurrentThemeId] = useState<string>('ocean');

  useEffect(() => {
    loadThemes();
  }, [profileId]);

  const loadThemes = async () => {
    const themes = ThemeManager.getAllThemes();
    const unlocked = await ThemeManager.getUnlockedThemes(profileId);
    const current = await ThemeManager.getCurrentTheme(profileId);

    setAllThemes(themes);
    setUnlockedThemes(unlocked);
    setCurrentThemeId(current.id);
  };

  const handleThemePress = async (theme: Theme) => {
    const isUnlocked = unlockedThemes.includes(theme.id);

    if (!isUnlocked) {
      const requirement = ThemeManager.getUnlockRequirement(theme.id);
      Alert.alert(
        'Theme Locked',
        `${theme.name}\n\n${theme.description}\n\nUnlock requirement:\n${requirement}`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await ThemeManager.setCurrentTheme(profileId, theme.id);
      setCurrentThemeId(theme.id);
      onSelectTheme(theme.id);
    } catch (error) {
      console.error('Failed to set theme:', error);
      Alert.alert('Error', 'Failed to change theme. Please try again.');
    }
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Theme</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.themesGrid}>
              {allThemes.map((theme) => (
                <ThemePreview
                  key={theme.id}
                  theme={theme}
                  isSelected={theme.id === currentThemeId}
                  isLocked={!unlockedThemes.includes(theme.id)}
                  onPress={() => handleThemePress(theme)}
                />
              ))}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                🔒 Unlock themes by completing challenges or upgrading to Premium!
              </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 24,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
