import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import type { MiniGameType } from '../../types';
import { MiniGameManager, HighScores } from '../MiniGameManager';

interface MiniGameMenuProps {
  onSelectGame: (gameType: MiniGameType) => void;
  onClose: () => void;
}

interface GameInfo {
  type: MiniGameType;
  title: string;
  description: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const GAME_INFO: GameInfo[] = [
  {
    type: 'whack-a-mole',
    title: 'Whack-a-Mole',
    description: 'Tap fish as they pop up in a 3x3 grid. Build combos for bonus points!',
    icon: '🐟',
    difficulty: 'Easy',
  },
  {
    type: 'memory-match',
    title: 'Memory Match',
    description: 'Match pairs of prey cards. Fewer moves = higher score!',
    icon: '🎴',
    difficulty: 'Medium',
  },
  {
    type: 'follow-leader',
    title: 'Follow the Leader',
    description: 'Tap checkpoints in the correct order as the leader fish shows the way.',
    icon: '🎯',
    difficulty: 'Medium',
  },
  {
    type: 'bubble-pop',
    title: 'Bubble Pop Frenzy',
    description: 'Pop bubbles for points. Golden = bonus, bombs = penalty!',
    icon: '🫧',
    difficulty: 'Easy',
  },
  {
    type: 'speed-run',
    title: 'Speed Run Challenge',
    description: 'Catch as many prey as possible in 30 seconds. Multiplier increases every 5 catches!',
    icon: '⚡',
    difficulty: 'Hard',
  },
];

export const MiniGameMenu: React.FC<MiniGameMenuProps> = ({ onSelectGame, onClose }) => {
  const [highScores, setHighScores] = useState<HighScores>({});

  useEffect(() => {
    loadHighScores();
  }, []);

  const loadHighScores = async () => {
    const scores = await MiniGameManager.loadHighScores();
    setHighScores(scores);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '#4CAF50';
      case 'Medium':
        return '#FFA500';
      case 'Hard':
        return '#FF3333';
      default:
        return '#888';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mini-Games</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.gameList}>
        {GAME_INFO.map((game) => (
          <TouchableOpacity
            key={game.type}
            style={styles.gameCard}
            onPress={() => onSelectGame(game.type)}
          >
            <View style={styles.gameIconContainer}>
              <Text style={styles.gameIcon}>{game.icon}</Text>
            </View>

            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameDescription}>{game.description}</Text>

              <View style={styles.gameMeta}>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(game.difficulty) }]}>
                  <Text style={styles.difficultyText}>{game.difficulty}</Text>
                </View>

                {highScores[game.type] !== undefined && (
                  <Text style={styles.highScore}>High Score: {highScores[game.type]}</Text>
                )}
              </View>
            </View>

            <Text style={styles.playArrow}>▶</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF3333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  gameList: {
    flex: 1,
    padding: 20,
  },
  gameCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  gameIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  gameIcon: {
    fontSize: 32,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 8,
  },
  gameMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  highScore: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  playArrow: {
    fontSize: 24,
    color: '#4CAF50',
    marginLeft: 12,
  },
});
