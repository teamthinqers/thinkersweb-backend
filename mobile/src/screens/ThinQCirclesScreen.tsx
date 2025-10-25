import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

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
        <Text style={styles.loadingText}>Loading circles...</Text>
      </View>
    );
  }

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
        <View style={styles.headerTop}>
          <Feather name="users" size={32} color="#f59e0b" />
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
      <View style={styles.circlesContainer}>
        {circles.map((circle) => (
          <View key={circle.id} style={styles.circleCard}>
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
                  <Feather name="circle" size={16} color="#f59e0b" />
                  <Text style={styles.statText}>{circle.stats.dots} Dots</Text>
                </View>
                <View style={styles.stat}>
                  <Feather name="zap" size={16} color="#f59e0b" />
                  <Text style={styles.statText}>{circle.stats.sparks} Sparks</Text>
                </View>
                <View style={styles.stat}>
                  <Feather name="users" size={16} color="#f59e0b" />
                  <Text style={styles.statText}>{circle.stats.members} Members</Text>
                </View>
              </View>
            )}

            {/* Action Button */}
            <TouchableOpacity style={styles.enterButton}>
              <Text style={styles.enterButtonText}>Enter Circle</Text>
              <Feather name="arrow-right" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}

        {circles.length === 0 && (
          <View style={styles.emptyContainer}>
            <Feather name="users" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No circles yet</Text>
            <Text style={styles.emptySubtext}>Create or join a circle to get started</Text>
          </View>
        )}
      </View>

      {/* Invites Section */}
      <View style={styles.invitesSection}>
        <Text style={styles.sectionTitle}>Pending Invites</Text>
        <Text style={styles.emptyText}>No pending invites</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbeb',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
  },
  loadingText: {
    fontSize: 16,
    color: '#78716c',
    marginTop: 12,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#78350f',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  circlesContainer: {
    gap: 16,
    marginBottom: 24,
  },
  circleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  circleHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  circleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  circleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  circleDescription: {
    fontSize: 14,
    color: '#6b7280',
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
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  enterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  enterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 4,
  },
  invitesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#78350f',
    marginBottom: 12,
  },
});
