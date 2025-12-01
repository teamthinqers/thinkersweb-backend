import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface Dot {
  id: number;
  summary: string;
  anchor?: string;
  pulse?: string;
  createdAt: string;
  isBookmarked?: boolean;
}

interface Wheel {
  id: number;
  heading: string;
  goals?: string;
  createdAt: string;
}

interface UserStats {
  totalDots: number;
  totalWheels: number;
  totalChakras: number;
  sparks: number;
  thisMonthDots: number;
  thisMonthWheels: number;
}

export default function MyNeuraScreenV2() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
  });

  const { data: dotsData, refetch: refetchDots } = useQuery<{ dots: Dot[] }>({
    queryKey: ['/api/dots'],
  });

  const { data: wheelsData, refetch: refetchWheels } = useQuery<{ wheels: Wheel[] }>({
    queryKey: ['/api/wheels'],
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchDots(), refetchWheels()]);
    setRefreshing(false);
  };

  const stats = statsData || { totalDots: 0, totalWheels: 0, totalChakras: 0, sparks: 0, thisMonthDots: 0, thisMonthWheels: 0 };
  const dots = dotsData?.dots || [];
  const wheels = wheelsData?.wheels || [];

  const StatBox = ({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) => (
    <View style={[styles.statBox, { borderLeftColor: color }]}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const DotCard = ({ dot }: { dot: Dot }) => (
    <View style={styles.dotCard}>
      <View style={styles.dotHeader}>
        <MaterialCommunityIcons name="lightbulb" size={16} color={colors.amber} />
        <Text style={styles.dotDate}>
          {new Date(dot.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
      </View>
      <Text style={styles.dotSummary}>{dot.summary}</Text>
      {dot.anchor && <Text style={styles.dotAnchor}>📌 {dot.anchor}</Text>}
      {dot.pulse && <Text style={styles.dotPulse}>💫 {dot.pulse}</Text>}
    </View>
  );

  const WheelCard = ({ wheel }: { wheel: Wheel }) => (
    <View style={styles.wheelCard}>
      <View style={styles.wheelBadge}>
        <MaterialCommunityIcons name="sync" size={14} color="#fff" />
      </View>
      <Text style={styles.wheelHeading}>{wheel.heading}</Text>
      {wheel.goals && <Text style={styles.wheelGoals}>{wheel.goals}</Text>}
      <Text style={styles.wheelDate}>
        {new Date(wheel.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.amber}
        />
      }
    >
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.userName}>{user?.fullName || 'Explorer'}</Text>
        </View>
        <View style={styles.headerStats}>
          <MaterialCommunityIcons name="fire" size={28} color={colors.orange} />
          <Text style={styles.streakValue}>{stats.sparks}</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <StatBox icon="lightbulb" label="Dots" value={stats.totalDots} color={colors.amber} />
        <StatBox icon="sync" label="Wheels" value={stats.totalWheels} color={colors.purple} />
        <StatBox icon="moon-waning-crescent" label="Chakras" value={stats.totalChakras} color={colors.pink} />
        <StatBox icon="star" label="This Month" value={stats.thisMonthDots} color={colors.blue} />
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Your Neural Journey</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Cognitive Growth</Text>
            <Text style={styles.progressValue}>{Math.round((stats.totalDots / 100) * 100)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${Math.min((stats.totalDots / 100) * 100, 100)}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>Keep capturing your insights!</Text>
        </View>
      </View>

      {/* Recent Dots */}
      {dots.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Dots</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {dots.slice(0, 3).map((dot) => (
            <DotCard key={dot.id} dot={dot} />
          ))}
        </View>
      )}

      {/* Recent Wheels */}
      {wheels.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Wheels</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.wheelsGrid}>
            {wheels.slice(0, 2).map((wheel) => (
              <WheelCard key={wheel.id} wheel={wheel} />
            ))}
          </View>
        </View>
      )}

      {/* Empty State */}
      {dots.length === 0 && wheels.length === 0 && !statsLoading && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="lightbulb-outline" size={64} color={colors.lightGray} />
          <Text style={styles.emptyTitle}>No Thoughts Yet</Text>
          <Text style={styles.emptyText}>Start capturing your insights to see them here</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  greeting: {
    fontSize: 14,
    color: colors.lightGray,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  headerStats: {
    alignItems: 'center',
    backgroundColor: colors.lightOrange,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  streakValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.orange,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9f9f9',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: colors.lightGray,
    marginTop: 6,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 4,
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 13,
    color: colors.lightGray,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.amber,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.amber,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.lightGray,
    fontStyle: 'italic',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  seeAll: {
    fontSize: 12,
    color: colors.amber,
    fontWeight: '600',
  },
  dotCard: {
    backgroundColor: '#fffbf0',
    borderLeftWidth: 3,
    borderLeftColor: colors.amber,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  dotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dotDate: {
    fontSize: 11,
    color: colors.lightGray,
    marginLeft: 6,
  },
  dotSummary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  dotAnchor: {
    fontSize: 11,
    color: colors.orange,
    marginBottom: 4,
  },
  dotPulse: {
    fontSize: 11,
    color: colors.purple,
  },
  wheelCard: {
    backgroundColor: '#f8f6ff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e8e0ff',
    marginRight: 10,
    width: (width - 50) / 2,
  },
  wheelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.purple,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  wheelHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.purple,
    marginBottom: 4,
  },
  wheelGoals: {
    fontSize: 11,
    color: colors.lightGray,
    marginBottom: 6,
  },
  wheelDate: {
    fontSize: 10,
    color: colors.lightGray,
  },
  wheelsGrid: {
    flexDirection: 'row',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 13,
    color: colors.lightGray,
    marginTop: 8,
  },
});
