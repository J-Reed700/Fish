import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import SoundPreloader, { PreloadProgress } from './SoundPreloader';
import EnvironmentAudioManager, { Environment } from '../environments/EnvironmentAudioManager';

export function AppInitializationExample() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<PreloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await SoundPreloader.preloadCritical((prog) => {
          setProgress(prog);
        });

        await EnvironmentAudioManager.setEnvironment(Environment.OCEAN);

        SoundPreloader.lazyLoadRemaining();

        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize audio:', err);
        setError('Failed to load audio system');
        setLoading(false);
      }
    };

    initializeAudio();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.text}>Loading Audio...</Text>
        {progress && (
          <Text style={styles.progress}>
            {Math.round(progress.percentage)}% - {progress.stage}
          </Text>
        )}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  progress: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  error: {
    fontSize: 16,
    color: '#f44336',
  },
});
