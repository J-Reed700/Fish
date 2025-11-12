import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { StatCard } from './StatCard';
import { StatsManager } from '../analytics/StatsManager';
import type { StatsAggregate, DailyData, FishSpecies } from '../types';
import { format } from 'date-fns';

export interface StatsDashboardProps {
  profileId: string;
  onClose?: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  profileId,
  onClose,
}) => {
  const [stats, setStats] = useState<StatsAggregate | null>(null);
  const [dailyPlayTime, setDailyPlayTime] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [profileId]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const aggregates = await StatsManager.getStats(profileId);
      const playTimeData = await StatsManager.getDailyPlayTime(profileId, 7);

      setStats(aggregates);
      setDailyPlayTime(playTimeData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <Modal visible transparent animationType="fade">
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.loadingText}>Loading statistics...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatCatchRate = (stats: StatsAggregate): string => {
    if (stats.totalPlayTime === 0) return '0.0/m';
    const rate = (stats.totalCatches / stats.totalPlayTime) * 60;
    return `${rate.toFixed(1)}/m`;
  };

  const getTopSpecies = (): Array<{ species: string; count: number }> => {
    const entries = Object.entries(stats.catchesBySpecies)
      .map(([species, count]) => ({ species, count }))
      .filter(entry => entry.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return entries;
  };

  const getFavoriteModeName = (): string => {
    let maxMode = 'free-swim';
    let maxTime = 0;

    for (const [mode, time] of Object.entries(stats.playTimeByMode)) {
      if (time > maxTime) {
        maxTime = time;
        maxMode = mode;
      }
    }

    return maxMode
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const chartWidth = Dimensions.get('window').width - 48;
  const hasPlayTime = dailyPlayTime.some(d => d.value > 0);

  const chartData = {
    labels: dailyPlayTime.map(d => format(new Date(d.date), 'EEE')),
    datasets: [
      {
        data: dailyPlayTime.map(d => Math.max(d.value / 60, 0.1)),
      },
    ],
  };

  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Statistics</Text>
            {onClose && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.cardsRow}>
              <StatCard
                title="Total Play"
                value={formatDuration(stats.totalPlayTime)}
              />
              <StatCard title="Total Catches" value={stats.totalCatches} />
              <StatCard
                title="Catch Rate"
                value={formatCatchRate(stats)}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Daily Play Time (Last 7 Days)</Text>
              {hasPlayTime ? (
                <View style={styles.chartContainer}>
                  <BarChart
                    data={chartData}
                    width={chartWidth}
                    height={180}
                    yAxisLabel=""
                    yAxisSuffix="m"
                    chartConfig={{
                      backgroundColor: '#1a1a2e',
                      backgroundGradientFrom: '#1a1a2e',
                      backgroundGradientTo: '#1a1a2e',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(77, 166, 255, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(136, 136, 170, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      propsForBackgroundLines: {
                        strokeDasharray: '',
                        stroke: '#2a2a4e',
                        strokeWidth: 1,
                      },
                      propsForLabels: {
                        fontSize: 10,
                      },
                    }}
                    style={styles.chart}
                    fromZero
                  />
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No play time recorded yet</Text>
                </View>
              )}
            </View>

            {getTopSpecies().length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Catches by Species</Text>
                {getTopSpecies().map(({ species, count }) => (
                  <View key={species} style={styles.speciesRow}>
                    <Text style={styles.speciesName}>
                      {species.charAt(0).toUpperCase() + species.slice(1)}
                    </Text>
                    <View style={styles.speciesBarContainer}>
                      <View
                        style={[
                          styles.speciesBar,
                          {
                            width: `${(count / stats.totalCatches) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.speciesCount}>{count}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Favorite Mode</Text>
                <Text style={styles.statValue}>{getFavoriteModeName()}</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Sessions</Text>
                <Text style={styles.statValue}>{stats.totalSessions}</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Longest Session</Text>
                <Text style={styles.statValue}>
                  {formatDuration(stats.longestSession)}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Avg Session</Text>
                <Text style={styles.statValue}>
                  {formatDuration(stats.averageSessionDuration)}
                </Text>
              </View>

              {stats.currentStreak > 0 && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Current Streak</Text>
                  <Text style={styles.statValue}>
                    {stats.currentStreak} days 🔥
                  </Text>
                </View>
              )}

              {stats.bestDay.catches > 0 && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Best Day</Text>
                  <Text style={styles.statValue}>
                    {stats.bestDay.catches} catches
                  </Text>
                  <Text style={styles.statSubValue}>
                    {format(new Date(stats.bestDay.date), 'MMM d, yyyy')}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#0f0f1e',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4da6ff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#8888aa',
  },
  scrollView: {
    flex: 1,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8888aa',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chartContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  chart: {
    borderRadius: 12,
  },
  emptyState: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666688',
  },
  speciesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  speciesName: {
    fontSize: 14,
    color: '#8888aa',
    width: 100,
  },
  speciesBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  speciesBar: {
    height: '100%',
    backgroundColor: '#4da6ff',
    borderRadius: 10,
  },
  speciesCount: {
    fontSize: 14,
    color: '#4da6ff',
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  statLabel: {
    fontSize: 11,
    color: '#8888aa',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4da6ff',
  },
  statSubValue: {
    fontSize: 11,
    color: '#666688',
    marginTop: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#8888aa',
  },
});
