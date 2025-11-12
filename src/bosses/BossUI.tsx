import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Boss } from '../types';

interface BossUIProps {
  boss: Boss;
  timeRemaining: number;
  catchCount: number;
}

export const BossUI: React.FC<BossUIProps> = ({ boss, timeRemaining, catchCount }) => {
  const hpPercentage = (boss.currentHP / boss.maxHP) * 100;
  const timeRemainingSeconds = Math.ceil(timeRemaining / 1000);

  const getPhaseColor = () => {
    if (boss.phase === 3) return '#FF3333';
    if (boss.phase === 2) return '#FFA500';
    return '#4CAF50';
  };

  const getBossName = () => {
    switch (boss.type) {
      case 'giant-fish':
        return 'Giant Fish';
      case 'speed-demon':
        return 'Speed Demon Mouse';
      case 'swarm-leader':
        return 'Swarm Leader Butterfly';
      case 'mega-cockroach':
        return 'Mega Cockroach';
      default:
        return 'Boss';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.bossName}>{getBossName()}</Text>
        <Text style={styles.phase}>Phase {boss.phase}</Text>
      </View>

      <View style={styles.hpBarContainer}>
        <View style={[styles.hpBarFill, { width: `${hpPercentage}%`, backgroundColor: getPhaseColor() }]} />
        <Text style={styles.hpText}>
          {boss.currentHP} / {boss.maxHP} HP
        </Text>
      </View>

      {boss.isEnraged && (
        <View style={styles.enragedBadge}>
          <Text style={styles.enragedText}>⚡ ENRAGED ⚡</Text>
        </View>
      )}

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={styles.statValue}>{timeRemainingSeconds}s</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Catches</Text>
          <Text style={styles.statValue}>{catchCount}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 16,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bossName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  phase: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hpBarContainer: {
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 14,
    transition: 'width 0.3s ease',
  },
  hpText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  enragedBadge: {
    backgroundColor: '#FF3333',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 12,
  },
  enragedText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
