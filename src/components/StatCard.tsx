import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  title: {
    fontSize: 12,
    color: '#8888aa',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4da6ff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#666688',
  },
});
