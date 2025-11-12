import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { MiniGameState, WhackAMoleState, BubblePopState, SpeedRunState } from '../../types';

interface MiniGameHUDProps {
  state: MiniGameState;
}

export const MiniGameHUD: React.FC<MiniGameHUDProps> = ({ state }) => {
  const renderGameSpecificInfo = () => {
    switch (state.type) {
      case 'whack-a-mole': {
        const whackState = state as WhackAMoleState;
        return (
          <View style={styles.specificInfo}>
            {whackState.comboCount > 0 && (
              <View style={styles.comboBadge}>
                <Text style={styles.comboText}>Combo x{whackState.comboCount}</Text>
              </View>
            )}
          </View>
        );
      }

      case 'bubble-pop': {
        const bubbleState = state as BubblePopState;
        return (
          <View style={styles.specificInfo}>
            {bubbleState.comboMultiplier > 1 && (
              <View style={styles.comboBadge}>
                <Text style={styles.comboText}>Multiplier x{bubbleState.comboMultiplier}</Text>
              </View>
            )}
          </View>
        );
      }

      case 'speed-run': {
        const speedState = state as SpeedRunState;
        return (
          <View style={styles.specificInfo}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Catches</Text>
              <Text style={styles.statValue}>{speedState.totalCatches}</Text>
            </View>
            <View style={styles.multiplierBadge}>
              <Text style={styles.multiplierText}>x{speedState.catchMultiplier.toFixed(1)}</Text>
            </View>
          </View>
        );
      }

      case 'memory-match':
        return (
          <View style={styles.specificInfo}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Moves</Text>
              <Text style={styles.statValue}>{(state as any).moveCount}</Text>
            </View>
          </View>
        );

      case 'follow-leader':
        return (
          <View style={styles.specificInfo}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Round</Text>
              <Text style={styles.statValue}>{state.currentRound}</Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const showTimer = state.type !== 'memory-match' && state.type !== 'follow-leader';

  return (
    <View style={styles.container}>
      <View style={styles.mainStats}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{state.score}</Text>
        </View>

        {showTimer && state.timeRemaining > 0 && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Time</Text>
            <Text style={[
              styles.timerValue,
              state.timeRemaining < 10000 && styles.timerWarning
            ]}>
              {formatTime(state.timeRemaining)}
            </Text>
          </View>
        )}

        {state.highScore > 0 && (
          <View style={styles.highScoreContainer}>
            <Text style={styles.highScoreLabel}>High</Text>
            <Text style={styles.highScoreValue}>{state.highScore}</Text>
          </View>
        )}
      </View>

      {renderGameSpecificInfo()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  mainStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  timerWarning: {
    color: '#FF3333',
  },
  highScoreContainer: {
    alignItems: 'center',
  },
  highScoreLabel: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 4,
  },
  highScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#888',
  },
  specificInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  comboBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  comboText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1,
  },
  multiplierBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  multiplierText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
