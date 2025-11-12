import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ActiveSeasonalEvent } from '../../types';
import { DateManager } from '../utils/DateManager';

interface SeasonalBannerProps {
  event: ActiveSeasonalEvent;
  onPress?: () => void;
}

export const SeasonalBanner: React.FC<SeasonalBannerProps> = ({ event, onPress }) => {
  const [timeRemaining, setTimeRemaining] = React.useState('');

  React.useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = event.endTime - now;
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h remaining`);
      } else {
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${minutes}m remaining`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [event.endTime]);

  return (
    <TouchableOpacity
      style={[
        styles.banner,
        { backgroundColor: event.event.theme.colors.primary + '20' }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[styles.eventName, { color: event.event.theme.colors.primary }]}>
            {event.event.name}
          </Text>
          <Text style={styles.eventDescription}>{event.event.description}</Text>
        </View>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{timeRemaining}</Text>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: event.event.theme.colors.accent,
              width: `${(event.progress.challengesCompleted / event.progress.totalChallenges) * 100}%`,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  eventName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
  },
  timerContainer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
