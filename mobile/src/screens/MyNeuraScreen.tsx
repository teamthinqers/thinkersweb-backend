import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';

export default function MyNeuraScreen() {
  const [selectedTab, setSelectedTab] = useState('reflections');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MyNeura</Text>
        <Text style={styles.headerSubtitle}>Personal Intelligence Space</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'reflections' && styles.tabActive]}
          onPress={() => setSelectedTab('reflections')}
        >
          <Text style={[styles.tabText, selectedTab === 'reflections' && styles.tabTextActive]}>
            Reflections
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'settings' && styles.tabActive]}
          onPress={() => setSelectedTab('settings')}
        >
          <Text style={[styles.tabText, selectedTab === 'settings' && styles.tabTextActive]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {selectedTab === 'reflections' ? (
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="message-circle" size={24} color="#7c3aed" />
              <Text style={styles.cardTitle}>My Thoughts</Text>
            </View>
            <Text style={styles.emptyText}>Your personal thoughts will appear here</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="zap" size={24} color="#f59e0b" />
              <Text style={styles.cardTitle}>My Sparks</Text>
            </View>
            <Text style={styles.emptyText}>Your saved sparks will appear here</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="eye" size={24} color="#06b6d4" />
              <Text style={styles.cardTitle}>My Perspectives</Text>
            </View>
            <Text style={styles.emptyText}>Your perspectives will appear here</Text>
          </View>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="brain" size={24} color="#f59e0b" />
              <Text style={styles.cardTitle}>Cognitive Identity</Text>
            </View>
            <TouchableOpacity style={styles.configButton}>
              <Text style={styles.configButtonText}>Configure Identity</Text>
              <Feather name="chevron-right" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="book-open" size={24} color="#7c3aed" />
              <Text style={styles.cardTitle}>Learning Engine</Text>
            </View>
            <TouchableOpacity style={[styles.configButton, styles.configButtonSecondary]}>
              <Text style={styles.configButtonText}>Configure Learning</Text>
              <Feather name="chevron-right" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="sliders" size={24} color="#06b6d4" />
              <Text style={styles.cardTitle}>AI Settings</Text>
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Capture Mode</Text>
              <Text style={styles.settingValue}>Hybrid</Text>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Neural Strength</Text>
              <View style={styles.progressBarSmall}>
                <View style={[styles.progressFillSmall, { width: '35%' }]} />
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#14532d',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#15803d',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#7c3aed',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#fff',
  },
  content: {
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 20,
  },
  configButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  configButtonSecondary: {
    backgroundColor: '#7c3aed',
  },
  configButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressBarSmall: {
    width: 100,
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFillSmall: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
});
