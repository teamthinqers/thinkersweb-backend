import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type Circle = {
  id: number;
  name: string;
  description?: string;
  createdBy: number;
  memberCount: number;
  stats?: {
    dots: number;
    sparks: number;
    members: number;
  };
};

export default function ThinQCirclesScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: circlesData, isLoading, refetch } = useQuery<{ success: boolean; circles: Circle[] }>({
    queryKey: ['/api/thinq-circles/my-circles'],
    enabled: !!user,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const circles = circlesData?.circles || [];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Loading circles...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Feather name="users" size={32} color={colors.primary[600]} />
          <Text style={styles.headerTitle}>ThinQ Circles</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Collaborative intelligence spaces for shared learning
        </Text>
      </View>

      {/* Create Circle Button */}
      <TouchableOpacity style={styles.createButton}>
        <Feather name="plus-circle" size={20} color="#fff" />
        <Text style={styles.createButtonText}>Create New Circle</Text>
      </TouchableOpacity>

      {/* Circles List */}
      {circles.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Feather name="users" size={64} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>No circles yet</Text>
          <Text style={styles.emptyText}>Create your first circle to collaborate with others</Text>
          
          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Feather name="share-2" size={20} color={colors.primary[500]} />
              <Text style={styles.featureText}>Share thoughts with your team</Text>
            </View>
            <View style={styles.featureItem}>
              <Feather name="zap" size={20} color={colors.primary[500]} />
              <Text style={styles.featureText}>Generate collective sparks</Text>
            </View>
            <View style={styles.featureItem}>
              <Feather name="trending-up" size={20} color={colors.primary[500]} />
              <Text style={styles.featureText}>Track collaborative growth</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.emptyButton}>
            <Feather name="plus-circle" size={16} color="#fff" />
            <Text style={styles.emptyButtonText}>Create Your First Circle</Text>
          </TouchableOpacity>
        </Card>
      ) : (
        <View style={styles.circlesContainer}>
          {circles.map((circle) => (
            <TouchableOpacity key={circle.id} style={styles.circleCard}>
              <Card borderColor={colors.primary[500]} borderWidth={4}>
                <View style={styles.circleHeader}>
                  <View style={styles.circleIcon}>
                    <Feather name="hexagon" size={24} color="#fff" />
                  </View>
                  <View style={styles.circleInfo}>
                    <Text style={styles.circleName}>{circle.name}</Text>
                    {circle.description && (
                      <Text style={styles.circleDescription} numberOfLines={2}>
                        {circle.description}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Stats */}
                {circle.stats && (
                  <View style={styles.statsRow}>
                    <View style={styles.stat}>
                      <Feather name="circle" size={16} color={colors.primary[500]} />
                      <Text style={styles.statText}>{circle.stats.dots} Dots</Text>
                    </View>
                    <View style={styles.stat}>
                      <Feather name="zap" size={16} color={colors.primary[500]} />
                      <Text style={styles.statText}>{circle.stats.sparks} Sparks</Text>
                    </View>
                    <View style={styles.stat}>
                      <Feather name="users" size={16} color={colors.primary[500]} />
                      <Text style={styles.statText}>{circle.stats.members} Members</Text>
                    </View>
                  </View>
                )}

                {/* Enter Button */}
                <View style={styles.enterButton}>
                  <Text style={styles.enterButtonText}>Enter Circle</Text>
                  <Feather name="arrow-right" size={16} color="#fff" />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Pending Invites Section */}
      <View style={styles.invitesSection}>
        <Text style={styles.sectionTitle}>Pending Invites</Text>
        <Card>
          <Text style={styles.emptyInvitesText}>No pending invites</Text>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.circles,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.circles,
  },
  loadingText: {
    marginTop: 12,
    fontSize: typography.sizes.base,
    color: colors.primary[900],
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary[900],
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.primary[700],
    textAlign: 'center',
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[600],
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#fff',
    marginLeft: 8,
  },
  circlesContainer: {
    gap: 16,
    marginBottom: 24,
  },
  circleCard: {
    marginBottom: 0,
  },
  circleHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  circleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  circleName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.gray[900],
    marginBottom: 4,
  },
  circleDescription: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.gray[600],
  },
  enterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[600],
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  enterButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: '#fff',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
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
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[700],
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary[600],
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  emptyButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: '#fff',
  },
  invitesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.primary[900],
    marginBottom: 12,
  },
  emptyInvitesText: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    textAlign: 'center',
    paddingVertical: 20,
  },
});
