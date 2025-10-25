import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface MyNeuraStats {
  thoughts: number;
  sparks: number;
  neuralStrength: number;
}

export default function MyNeuraScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('reflections');

  const { data: statsData, isLoading, refetch } = useQuery<{ success: boolean; data: MyNeuraStats }>({
    queryKey: ['/api/myneura/stats'],
    enabled: !!user,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const stats = statsData?.data;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.green[500]} />
        <Text style={styles.loadingText}>Loading MyNeura...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green[500]} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MyNeura</Text>
        <Text style={styles.headerSubtitle}>Personal Intelligence Space</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard} borderColor={colors.primary[500]} borderWidth={3}>
          <Feather name="lightbulb" size={32} color={colors.primary[500]} />
          <Text style={styles.statValue}>{stats?.thoughts || 0}</Text>
          <Text style={styles.statLabel}>Dots</Text>
        </Card>

        <Card style={styles.statCard} borderColor={colors.primary[500]} borderWidth={3}>
          <Feather name="zap" size={32} color={colors.primary[500]} />
          <Text style={styles.statValue}>{stats?.sparks || 0}</Text>
          <Text style={styles.statLabel}>Sparks</Text>
        </Card>
      </View>

      {/* Neural Strength */}
      <Card style={styles.neuralCard}>
        <View style={styles.neuralHeader}>
          <Feather name="activity" size={24} color={colors.green[500]} />
          <Text style={styles.neuralTitle}>Neural Strength</Text>
        </View>
        <View style={styles.neuralProgressContainer}>
          <View style={styles.neuralProgressBar}>
            <View style={[styles.neuralProgressFill, { width: `${stats?.neuralStrength || 0}%` }]} />
          </View>
          <Text style={styles.neuralProgressText}>{stats?.neuralStrength || 0}%</Text>
        </View>
      </Card>

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
          <Card style={styles.emptyCard}>
            <Feather name="message-circle" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No dots yet</Text>
            <Text style={styles.emptyText}>Start capturing your thoughts and insights</Text>
            <TouchableOpacity style={styles.saveButton}>
              <Feather name="plus-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Thought / Dot</Text>
            </TouchableOpacity>
          </Card>
        </View>
      ) : (
        <View style={styles.content}>
          <Card>
            <View style={styles.settingRow}>
              <Feather name="brain" size={24} color={colors.primary[500]} />
              <Text style={styles.settingTitle}>Cognitive Identity</Text>
            </View>
            <TouchableOpacity style={styles.configButton}>
              <Text style={styles.configButtonText}>Configure Identity</Text>
              <Feather name="chevron-right" size={20} color="#fff" />
            </TouchableOpacity>
          </Card>

          <Card>
            <View style={styles.settingRow}>
              <Feather name="book-open" size={24} color={colors.purple[600]} />
              <Text style={styles.settingTitle}>Learning Engine</Text>
            </View>
            <TouchableOpacity style={[styles.configButton, styles.configButtonSecondary]}>
              <Text style={styles.configButtonText}>Configure Learning</Text>
              <Feather name="chevron-right" size={20} color="#fff" />
            </TouchableOpacity>
          </Card>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  loadingText: {
    marginTop: 12,
    fontSize: typography.sizes.base,
    color: colors.green[700],
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.green[900],
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: typography.sizes.base,
    color: colors.green[700],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  statValue: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.gray[900],
    marginTop: 12,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    marginTop: 4,
  },
  neuralCard: {
    marginBottom: 20,
  },
  neuralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  neuralTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.gray[900],
  },
  neuralProgressContainer: {
    gap: 8,
  },
  neuralProgressBar: {
    height: 12,
    backgroundColor: colors.gray[100],
    borderRadius: 6,
    overflow: 'hidden',
  },
  neuralProgressFill: {
    height: '100%',
    backgroundColor: colors.green[500],
    borderRadius: 6,
  },
  neuralProgressText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.green[500],
    textAlign: 'right',
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
    backgroundColor: colors.purple[600],
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.gray[600],
  },
  tabTextActive: {
    color: '#fff',
  },
  content: {
    gap: 16,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.gray[700],
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    marginBottom: 24,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary[600],
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#fff',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  settingTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.gray[900],
  },
  configButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary[600],
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  configButtonSecondary: {
    backgroundColor: colors.purple[600],
  },
  configButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#fff',
  },
});
