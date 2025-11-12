import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { SessionStats } from '../game/SessionManager';
import type { FishSpecies } from '../types';

interface SessionCompleteScreenProps {
  stats: SessionStats;
  onContinue: () => void;
  onEnd: () => void;
  catName?: string;
}

export const SessionCompleteScreen: React.FC<SessionCompleteScreenProps> = ({
  stats,
  onContinue,
  onEnd,
  catName = 'Your Cat',
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const getTotalCatches = (): number => {
    return Object.values(stats.fishCaughtBySpecies).reduce((sum, count) => sum + count, 0);
  };

  const getTopSpecies = (): [FishSpecies, number] | null => {
    const entries = Object.entries(stats.fishCaughtBySpecies) as [FishSpecies, number][];
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return sorted[0] && sorted[0][1] > 0 ? sorted[0] : null;
  };

  const totalCatches = getTotalCatches();
  const topSpecies = getTopSpecies();

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>🎉 Great Session!</Text>

        <View style={styles.statsContainer}>
          <Text style={styles.catName}>{catName} played for {formatTime(stats.playTime)}</Text>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Touches:</Text>
            <Text style={styles.statValue}>{stats.touchCount}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Catches per Minute:</Text>
            <Text style={styles.statValue}>{stats.catchRate.toFixed(1)}</Text>
          </View>

          {totalCatches > 0 && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Fish Caught:</Text>
              <Text style={styles.statValue}>{totalCatches}</Text>
            </View>
          )}

          {topSpecies && (
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Favorite Fish:</Text>
              <Text style={styles.statValue}>{topSpecies[0]} ({topSpecies[1]})</Text>
            </View>
          )}
        </View>

        <View style={styles.warningContainer}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningTitle}>IMPORTANT: Complete the Hunt</Text>
          <Text style={styles.warningText}>
            Cats need to catch something real to feel satisfied.
          </Text>

          <View style={styles.suggestionContainer}>
            <Text style={styles.suggestionTitle}>Try:</Text>
            <Text style={styles.suggestion}>• Give them a physical toy to catch</Text>
            <Text style={styles.suggestion}>• Offer a small treat</Text>
            <Text style={styles.suggestion}>• Play with a feather wand</Text>
          </View>

          <Text style={styles.explanation}>
            This prevents frustration from "unrewarded" chases.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable style={styles.continueButton} onPress={onContinue}>
            <Text style={styles.continueButtonText}>Continue Playing</Text>
          </Pressable>

          <Pressable style={styles.endButton} onPress={onEnd}>
            <Text style={styles.endButtonText}>End Session</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 500,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  statsContainer: {
    width: '100%',
    backgroundColor: '#16213e',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  catName: {
    fontSize: 18,
    color: '#00BFFF',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
    color: '#aaa',
  },
  statValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  warningContainer: {
    width: '100%',
    backgroundColor: '#2d1b00',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: '#ff9800',
    marginBottom: 25,
  },
  warningIcon: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 10,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff9800',
    textAlign: 'center',
    marginBottom: 10,
  },
  warningText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  suggestionContainer: {
    marginBottom: 15,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  suggestion: {
    fontSize: 15,
    color: '#ddd',
    marginBottom: 5,
  },
  explanation: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  continueButton: {
    backgroundColor: '#00BFFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  endButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#666',
  },
  endButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
});
