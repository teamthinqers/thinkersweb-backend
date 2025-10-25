import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

interface DashboardData {
  neuralStrength: {
    percentage: number;
    milestones: {
      cognitiveIdentityCompleted: boolean;
      learningEngineCompleted: boolean;
      hasActivity: boolean;
    };
    stats: {
      thoughtsCount: number;
      savedSparksCount: number;
      userSparksCount: number;
      perspectivesCount: number;
    };
  };
  stats: {
    dots: number;
    wheels: number;
    chakras: number;
    thoughts: number;
    savedSparks: number;
    perspectives: number;
  };
  recentActivity: Array<{
    type: 'dot' | 'wheel' | 'thought';
    data: any;
    timestamp: string;
  }>;
}

export default function MyDotSparkScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: dashboardData, isLoading, refetch } = useQuery<{ success: boolean; data: DashboardData }>({
    queryKey: ['/api/dashboard'],
    enabled: !!user,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const stats = dashboardData?.data?.stats;
  const neuralStrength = dashboardData?.data?.neuralStrength;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My DotSpark</Text>
        <Text style={styles.headerSubtitle}>Your Intelligence Network</Text>
      </View>

      {/* Neural Strength Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="zap" size={24} color="#f59e0b" />
          <Text style={styles.cardTitle}>Neural Strength</Text>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${neuralStrength?.percentage || 0}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>{neuralStrength?.percentage || 0}%</Text>
        </View>

        {/* Milestones */}
        <View style={styles.milestonesContainer}>
          <View style={styles.milestone}>
            <Feather
              name={neuralStrength?.milestones.cognitiveIdentityCompleted ? "check-circle" : "circle"}
              size={20}
              color={neuralStrength?.milestones.cognitiveIdentityCompleted ? "#10b981" : "#d1d5db"}
            />
            <Text style={styles.milestoneText}>Cognitive Identity</Text>
          </View>
          <View style={styles.milestone}>
            <Feather
              name={neuralStrength?.milestones.learningEngineCompleted ? "check-circle" : "circle"}
              size={20}
              color={neuralStrength?.milestones.learningEngineCompleted ? "#10b981" : "#d1d5db"}
            />
            <Text style={styles.milestoneText}>Learning Engine</Text>
          </View>
          <View style={styles.milestone}>
            <Feather
              name={neuralStrength?.milestones.hasActivity ? "check-circle" : "circle"}
              size={20}
              color={neuralStrength?.milestones.hasActivity ? "#10b981" : "#d1d5db"}
            />
            <Text style={styles.milestoneText}>Activity Started</Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Dots */}
        <View style={[styles.statCard, styles.dotsCard]}>
          <Feather name="circle" size={28} color="#f59e0b" />
          <Text style={styles.statNumber}>{stats?.dots || 0}</Text>
          <Text style={styles.statLabel}>Dots</Text>
        </View>

        {/* Wheels */}
        <View style={[styles.statCard, styles.wheelsCard]}>
          <Feather name="target" size={28} color="#ea580c" />
          <Text style={styles.statNumber}>{stats?.wheels || 0}</Text>
          <Text style={styles.statLabel}>Wheels</Text>
        </View>

        {/* Chakras */}
        <View style={[styles.statCard, styles.chakrasCard]}>
          <Feather name="hexagon" size={28} color="#dc2626" />
          <Text style={styles.statNumber}>{stats?.chakras || 0}</Text>
          <Text style={styles.statLabel}>Chakras</Text>
        </View>

        {/* Thoughts */}
        <View style={[styles.statCard, styles.thoughtsCard]}>
          <Feather name="message-circle" size={28} color="#7c3aed" />
          <Text style={styles.statNumber}>{stats?.thoughts || 0}</Text>
          <Text style={styles.statLabel}>Thoughts</Text>
        </View>

        {/* Sparks */}
        <View style={[styles.statCard, styles.sparksCard]}>
          <Feather name="zap" size={28} color="#f59e0b" />
          <Text style={styles.statNumber}>{stats?.savedSparks || 0}</Text>
          <Text style={styles.statLabel}>Sparks</Text>
        </View>

        {/* Perspectives */}
        <View style={[styles.statCard, styles.perspectivesCard]}>
          <Feather name="eye" size={28} color="#06b6d4" />
          <Text style={styles.statNumber}>{stats?.perspectives || 0}</Text>
          <Text style={styles.statLabel}>Perspectives</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionButton}>
          <View style={styles.actionIcon}>
            <Feather name="plus-circle" size={24} color="#fff" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Create Dot</Text>
            <Text style={styles.actionSubtitle}>Capture a new insight</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, styles.actionIconSecondary]}>
            <Feather name="settings" size={24} color="#fff" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Neural Settings</Text>
            <Text style={styles.actionSubtitle}>Configure your AI</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef3c7',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
  },
  loadingText: {
    fontSize: 16,
    color: '#78716c',
    marginTop: 12,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#78350f',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#92400e',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    textAlign: 'right',
  },
  milestonesContainer: {
    gap: 12,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  milestoneText: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dotsCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  wheelsCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#ea580c',
  },
  chakrasCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
  },
  thoughtsCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#7c3aed',
  },
  sparksCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  perspectivesCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#06b6d4',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#78350f',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconSecondary: {
    backgroundColor: '#7c3aed',
  },
  actionContent: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
});
