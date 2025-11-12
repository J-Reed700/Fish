import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import SoundManager, { SoundId } from '../../audio/SoundManager';
import HapticManager, { HapticPattern } from '../../haptics/HapticManager';

export const AudioSettings: React.FC = () => {
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [soundEffectsVolume, setSoundEffectsVolume] = useState(0.8);
  const [ambientVolume, setAmbientVolume] = useState(0.3);
  const [hapticIntensity, setHapticIntensity] = useState(0.8);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const soundConfig = SoundManager.getConfig();
    const hapticConfig = HapticManager.getConfig();

    setSoundsEnabled(soundConfig.enableSounds);
    setMasterVolume(soundConfig.masterVolume);
    setSoundEffectsVolume(soundConfig.soundEffectsVolume);
    setAmbientVolume(soundConfig.ambientVolume);
    setHapticsEnabled(hapticConfig.enabled);
    setHapticIntensity(hapticConfig.intensity);
  };

  const handleSoundsToggle = async (value: boolean) => {
    setSoundsEnabled(value);
    await SoundManager.setEnabled(value);
    if (value) {
      await SoundManager.play(SoundId.SUCCESS);
    }
  };

  const handleHapticsToggle = async (value: boolean) => {
    setHapticsEnabled(value);
    await HapticManager.setEnabled(value);
    if (value) {
      await HapticManager.trigger(HapticPattern.SUCCESS);
    }
  };

  const handleMasterVolumeChange = async (value: number) => {
    setMasterVolume(value);
    await SoundManager.setMasterVolume(value);
  };

  const handleSoundEffectsVolumeChange = async (value: number) => {
    setSoundEffectsVolume(value);
    await SoundManager.setSoundEffectsVolume(value);
  };

  const handleAmbientVolumeChange = async (value: number) => {
    setAmbientVolume(value);
    await SoundManager.setAmbientVolume(value);
  };

  const handleHapticIntensityChange = async (value: number) => {
    setHapticIntensity(value);
    await HapticManager.setIntensity(value);
  };

  const testSound = async () => {
    await HapticManager.trigger(HapticPattern.LIGHT);
    await SoundManager.play(SoundId.CATCH);
  };

  const testHaptic = async () => {
    await HapticManager.trigger(HapticPattern.MEDIUM);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sound Effects</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Sounds</Text>
          <Switch
            value={soundsEnabled}
            onValueChange={handleSoundsToggle}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={soundsEnabled ? '#2196F3' : '#f4f3f4'}
          />
        </View>

        {soundsEnabled && (
          <>
            <View style={styles.sliderContainer}>
              <Text style={styles.settingLabel}>
                Master Volume: {Math.round(masterVolume * 100)}%
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={masterVolume}
                onValueChange={handleMasterVolumeChange}
                minimumTrackTintColor="#2196F3"
                maximumTrackTintColor="#ddd"
                thumbTintColor="#2196F3"
              />
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.settingLabel}>
                Sound Effects: {Math.round(soundEffectsVolume * 100)}%
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={soundEffectsVolume}
                onValueChange={handleSoundEffectsVolumeChange}
                minimumTrackTintColor="#2196F3"
                maximumTrackTintColor="#ddd"
                thumbTintColor="#2196F3"
              />
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.settingLabel}>
                Ambient Sounds: {Math.round(ambientVolume * 100)}%
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={ambientVolume}
                onValueChange={handleAmbientVolumeChange}
                minimumTrackTintColor="#2196F3"
                maximumTrackTintColor="#ddd"
                thumbTintColor="#2196F3"
              />
            </View>

            <TouchableOpacity style={styles.testButton} onPress={testSound}>
              <Text style={styles.testButtonText}>Test Sound</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Haptic Feedback</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Enable Haptics</Text>
          <Switch
            value={hapticsEnabled}
            onValueChange={handleHapticsToggle}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={hapticsEnabled ? '#2196F3' : '#f4f3f4'}
          />
        </View>

        {hapticsEnabled && HapticManager.hasSupport() && (
          <>
            <View style={styles.sliderContainer}>
              <Text style={styles.settingLabel}>
                Intensity: {Math.round(hapticIntensity * 100)}%
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={hapticIntensity}
                onValueChange={handleHapticIntensityChange}
                minimumTrackTintColor="#2196F3"
                maximumTrackTintColor="#ddd"
                thumbTintColor="#2196F3"
              />
            </View>

            <TouchableOpacity style={styles.testButton} onPress={testHaptic}>
              <Text style={styles.testButtonText}>Test Haptic</Text>
            </TouchableOpacity>
          </>
        )}

        {!HapticManager.hasSupport() && (
          <Text style={styles.notSupported}>
            Haptic feedback is not supported on this device
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.info}>
          Changes are saved automatically and will apply immediately.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  sliderContainer: {
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  testButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notSupported: {
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  info: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AudioSettings;
