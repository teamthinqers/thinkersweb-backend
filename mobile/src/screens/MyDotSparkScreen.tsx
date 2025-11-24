import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Avatar } from '../components/Avatar';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface DashboardData {
  neuralStrength: {
    percentage: number;
    milestones: {
      cognitiveIdentityCompleted: boolean;
      learningEngineCompleted: boolean;
      hasActivity: boolean;
    };
  };
  myNeuraStats: {
    thoughts: number;
    sparks: number;
  };
  socialStats: {
    thoughts: number;
    sparks: number;
    perspectives: number;
  };
}

export default function MyDotSparkScreen({ navigation }: any) {
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
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Loading your DotSpark...</Text>
      </View>
    );
  }

  const dashboard = dashboardData?.data;
  const cognitiveConfigured = dashboard?.neuralStrength?.milestones?.cognitiveIdentityCompleted || false;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />
      }
    >
      {/* Section Header */}
      <View style={styles.appHeader}>
        <View style={styles.headingBg}>
          <View style={styles.brainIconContainer}>
            <Feather name="home" size={28} color="#fff" />
          </View>
          <Text style={styles.appHeaderTitle}>My DotSpark</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellIcon} onPress={() => alert('Notifications')}>
            <MaterialCommunityIcons name="bell" size={20} color="#fbbf24" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.hamburgerIcon} onPress={() => alert('Menu')}>
            <Feather name="menu" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Header */}
      <View style={styles.profileSection}>
        <View style={styles.profileRow}>
          <Avatar
            name={(user as any)?.fullName || 'User'}
            imageUrl={(user as any)?.linkedinPhotoUrl || (user as any)?.avatar}
            size={48}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{(user as any)?.fullName || 'User'}</Text>
            <Text style={styles.profileHeadline}>
              {(user as any)?.linkedinHeadline || 'Professional Headline'}
            </Text>
          </View>
        </View>
      </View>

      {/* Cognitive Identity Card */}
      <TouchableOpacity style={styles.cognitiveCard} onPress={() => navigation.navigate('CognitiveIdentity')}>
        <View style={styles.cognitiveHeader}>
          <View style={styles.statusBadge}>
            <Feather name="user" size={16} color="#fff" />
            <View style={[styles.statusDot, { backgroundColor: cognitiveConfigured ? colors.green[500] : colors.error }]} />
          </View>
        </View>
        <Text style={styles.cognitiveTitle}>Cognitive Identity</Text>
        <Text style={styles.cognitiveSubtitle}>Your unique thought patterns and intellectual fingerprint</Text>
        {!cognitiveConfigured && (
          <Text style={styles.cognitivePrompt}>
            ✨ Set up your Cognitive Identity
          </Text>
        )}
        <Feather name="arrow-right" size={20} color="#fff" style={styles.cognitiveArrow} />
      </TouchableOpacity>

      {/* Dashboard Grid */}
      <View style={styles.dashboardGrid}>
        {/* My Neura */}
        <TouchableOpacity style={styles.neuraCard} onPress={() => navigation.navigate('MyNeura')}>
          <View style={styles.cardBadge}>
            <Feather name="brain" size={16} color="#fff" />
            <View style={[styles.statusDot, { backgroundColor: (dashboard?.myNeuraStats?.thoughts || 0) > 0 ? colors.green[500] : colors.error }]} />
          </View>
          <Text style={styles.cardTitle}>My Neura</Text>
          <Text style={styles.cardSubtitle}>Personal thoughts & saved insights</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Feather name="lightbulb" size={14} color="#fff" />
              <Text style={styles.statText}>{dashboard?.myNeuraStats?.thoughts || 0}</Text>
            </View>
            <View style={styles.statPill}>
              <Feather name="zap" size={14} color="#fff" />
              <Text style={styles.statText}>{dashboard?.myNeuraStats?.sparks || 0}</Text>
            </View>
          </View>

          <View style={styles.neuralStrengthSection}>
            <View style={styles.neuralStrengthHeader}>
              <Text style={styles.neuralStrengthLabel}>Neural Strength</Text>
              <Text style={styles.neuralStrengthValue}>{dashboard?.neuralStrength?.percentage || 0}%</Text>
            </View>
            <View style={styles.neuralStrengthBar}>
              <View style={[styles.neuralStrengthFill, { width: `${dashboard?.neuralStrength?.percentage || 0}%` }]} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Social Neura */}
        <TouchableOpacity style={styles.socialCard} onPress={() => navigation.navigate('Social')}>
          <View style={styles.cardBadge}>
            <Feather name="users" size={16} color="#fff" />
            <View style={[styles.statusDot, { backgroundColor: colors.green[500] }]} />
          </View>
          <Text style={styles.cardTitle}>Social Neura</Text>
          <Text style={styles.cardSubtitle}>Collective intelligence & shared thoughts</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Feather name="lightbulb" size={14} color="#fff" />
              <Text style={styles.statText}>{dashboard?.socialStats?.thoughts || 0}</Text>
            </View>
            <View style={styles.statPill}>
              <Feather name="zap" size={14} color="#fff" />
              <Text style={styles.statText}>{dashboard?.socialStats?.sparks || 0}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ThinQ Circles */}
        <TouchableOpacity style={styles.circlesCard} onPress={() => navigation.navigate('ThinQCircles')}>
          <View style={styles.cardBadge}>
            <Feather name="users" size={16} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>My ThinQ Circles</Text>
          <Text style={styles.cardSubtitle}>Collaborative spaces</Text>
        </TouchableOpacity>

        {/* Learning Engine */}
        <TouchableOpacity style={styles.learningCard} onPress={() => navigation.navigate('LearningEngine')}>
          <View style={styles.cardBadge}>
            <Feather name="book-open" size={16} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>Learning Engine</Text>
          <Text style={styles.cardSubtitle}>Personalized learning</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  loadingText: {
    marginTop: 12,
    fontSize: typography.sizes.base,
    color: colors.gray[600],
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  brainIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headingBg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.primary[600],
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  appHeaderTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extrabold,
    color: '#fff',
    letterSpacing: 0.3,
  },
  bellIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  hamburgerIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  profileSection: {
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary[900],
  },
  profileHeadline: {
    fontSize: typography.sizes.sm,
    color: colors.primary[700],
    marginTop: 2,
  },
  cognitiveCard: {
    backgroundColor: '#8b5cf6',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  cognitiveHeader: {
    marginBottom: 32,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    position: 'relative',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: -4,
    right: -4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cognitiveTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: '#fff',
    marginBottom: 4,
  },
  cognitiveSubtitle: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  cognitivePrompt: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  cognitiveArrow: {
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 0.8,
  },
  dashboardGrid: {
    gap: 16,
  },
  neuraCard: {
    backgroundColor: colors.primary[500],
    borderRadius: 24,
    padding: 20,
    position: 'relative',
  },
  socialCard: {
    backgroundColor: colors.orange[600],
    borderRadius: 24,
    padding: 20,
    position: 'relative',
  },
  circlesCard: {
    backgroundColor: colors.primary[600],
    borderRadius: 24,
    padding: 20,
    position: 'relative',
  },
  learningCard: {
    backgroundColor: colors.purple[600],
    borderRadius: 24,
    padding: 20,
    position: 'relative',
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  cardTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: '#fff',
  },
  neuralStrengthSection: {
    gap: 6,
  },
  neuralStrengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  neuralStrengthLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#fff',
  },
  neuralStrengthValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#fff',
  },
  neuralStrengthBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  neuralStrengthFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
});
