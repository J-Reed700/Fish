import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import AsyncStorageAdapter from '../storage/AsyncStorageAdapter';
import { ErrorReporting } from '../services/ErrorReporting';

interface SettingsScreenProps {
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const [crashReportingEnabled, setCrashReportingEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const enabled = await AsyncStorageAdapter.get<boolean>('crashReportingEnabled');
      setCrashReportingEnabled(enabled || false);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const openPrivacyPolicy = () => {
    const url = 'https://yourdomain.com/privacy';
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(
          'Privacy Policy',
          'Unable to open link. Please visit:\nhttps://yourdomain.com/privacy',
          [{ text: 'OK' }]
        );
      }
    });
  };

  const openTermsOfService = () => {
    const url = 'https://yourdomain.com/terms';
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(
          'Terms of Service',
          'Unable to open link. Please visit:\nhttps://yourdomain.com/terms',
          [{ text: 'OK' }]
        );
      }
    });
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all cat profiles, game statistics, screenshots, and settings. This action cannot be undone.\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorageAdapter.clear();
              Alert.alert(
                'Data Cleared',
                'All app data has been deleted. The app will now restart.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      onClose();
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Data export feature coming soon!\n\nYou will be able to export your cat profiles, statistics, and screenshots.',
      [{ text: 'OK' }]
    );
  };

  const handleToggleCrashReporting = async (value: boolean) => {
    setCrashReportingEnabled(value);

    try {
      await AsyncStorageAdapter.set('crashReportingEnabled', value);
      await ErrorReporting.setCrashReportingEnabled(value);

      if (value) {
        Alert.alert(
          'Crash Reporting Enabled',
          'Anonymous crash reports will be sent to help improve the app. No personal information is collected.\n\nYou can disable this at any time.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save preference');
      setCrashReportingEnabled(!value);
    }
  };

  const handleContactSupport = () => {
    const email = 'support@fishcatgame.com';
    const subject = 'Fish Cat Game - Support Request';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(
          'Contact Support',
          `Please email us at:\n${email}`,
          [{ text: 'OK' }]
        );
      }
    });
  };

  return (
    <Modal visible={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy</Text>

            <TouchableOpacity style={styles.row} onPress={openPrivacyPolicy}>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Privacy Policy</Text>
                <Text style={styles.rowSubtitle}>How we handle your data</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.row} onPress={openTermsOfService}>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Terms of Service</Text>
                <Text style={styles.rowSubtitle}>App usage terms</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <View style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Crash Reporting</Text>
                <Text style={styles.rowSubtitle}>
                  Send anonymous crash reports
                </Text>
              </View>
              <Switch
                value={crashReportingEnabled}
                onValueChange={handleToggleCrashReporting}
                trackColor={{ false: '#ccc', true: '#4CAF50' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>

            <TouchableOpacity style={styles.row} onPress={handleExportData}>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Export Data</Text>
                <Text style={styles.rowSubtitle}>
                  Export profiles and statistics
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.row}
              onPress={handleClearAllData}
            >
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, styles.dangerText]}>
                  Clear All Data
                </Text>
                <Text style={styles.rowSubtitle}>
                  Delete all profiles and settings
                </Text>
              </View>
              <Text style={[styles.chevron, styles.dangerText]}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>

            <TouchableOpacity style={styles.row} onPress={handleContactSupport}>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Contact Support</Text>
                <Text style={styles.rowSubtitle}>
                  support@fishcatgame.com
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>About Fish Cat Game</Text>
            <Text style={styles.infoText}>Version 1.0.0</Text>
            <Text style={styles.infoText}>
              An interactive game for cats by the Fish Cat Game Team
            </Text>
            <Text style={styles.infoSubtext}>
              All data is stored locally on your device
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 28,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  chevron: {
    fontSize: 24,
    color: '#999',
    marginLeft: 12,
  },
  dangerText: {
    color: '#f44336',
  },
  infoSection: {
    marginTop: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
