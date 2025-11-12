import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { ActiveSeasonalEvent } from '../../types';

interface SeasonalIndicatorProps {
  event: ActiveSeasonalEvent;
  onPress?: () => void;
  compact?: boolean;
}

export const SeasonalIndicator: React.FC<SeasonalIndicatorProps> = ({
  event,
  onPress,
  compact = false,
}) => {
  const getEventIcon = (eventId: string): string => {
    const icons: Record<string, string> = {
      halloween: '<ƒ',
      christmas: '<„',
      valentines: '=–',
      easter: '>Z',
      summer: '<Ö',
      autumn: '<B',
      spring: '<8',
    };
    return icons[eventId] || '<‰';
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactIndicator, { backgroundColor: event.event.theme.colors.primary }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>{getEventIcon(event.event.id)}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.indicator,
        { backgroundColor: event.event.theme.colors.primary + '20' }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{getEventIcon(event.event.id)}</Text>
      <View style={styles.textContainer}>
        <Text style={[styles.eventName, { color: event.event.theme.colors.primary }]}>
          {event.event.name}
        </Text>
        <Text style={styles.currency}>
          {event.progress.eventCurrency} coins
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  compactIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  eventName: {
    fontSize: 14,
    fontWeight: '600',
  },
  currency: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
