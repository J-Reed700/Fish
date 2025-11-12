import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import type { ActiveSeasonalEvent } from '../../types';

interface EventDetailsModalProps {
  event: ActiveSeasonalEvent | null;
  visible: boolean;
  onClose: () => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  visible,
  onClose,
}) => {
  if (!event) {
    return null;
  }

  const completionPercentage = (event.progress.challengesCompleted / event.progress.totalChallenges) * 100;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { borderColor: event.event.theme.colors.primary }]}>
          <View style={[styles.header, { backgroundColor: event.event.theme.colors.primary }]}>
            <Text style={styles.headerTitle}>{event.event.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}></Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.description}>{event.event.description}</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Event Progress</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: event.event.theme.colors.accent,
                        width: `${completionPercentage}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {event.progress.challengesCompleted} / {event.progress.totalChallenges} Challenges
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{event.progress.bossesDefeated}</Text>
                  <Text style={styles.statLabel}>Bosses Defeated</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{event.progress.collectiblesFound}</Text>
                  <Text style={styles.statLabel}>Collectibles</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{event.progress.eventCurrency}</Text>
                  <Text style={styles.statLabel}>Event Currency</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Challenges</Text>
              {event.event.challenges.map((challenge, index) => (
                <View
                  key={challenge.id}
                  style={[
                    styles.challengeItem,
                    challenge.completed && styles.challengeCompleted,
                  ]}
                >
                  <Text style={styles.challengeName}>{challenge.name}</Text>
                  <Text style={styles.challengeDescription}>{challenge.description}</Text>
                  <Text style={styles.challengeProgress}>
                    {challenge.current} / {challenge.target}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Prey Variants</Text>
              {event.event.preyVariants.map((variant) => (
                <View key={variant.variantId} style={styles.variantItem}>
                  <Text style={styles.variantName}>{variant.name}</Text>
                  <Text style={styles.variantMultiplier}>
                    {variant.pointsMultiplier}x points
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: width - 40,
    maxHeight: '80%',
    borderWidth: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  challengeItem: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  challengeCompleted: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  challengeProgress: {
    fontSize: 12,
    color: '#999',
  },
  variantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  variantName: {
    fontSize: 14,
    color: '#333',
  },
  variantMultiplier: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
});
