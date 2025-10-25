import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';

type Thought = {
  id: number;
  heading: string;
  summary: string;
  contributorType: string;
  guestName?: string;
  guestLinkedInUrl?: string;
  createdAt: string;
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
};

export default function SocialScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: thoughtsData, isLoading, refetch } = useQuery<{ thoughts: Thought[] }>({
    queryKey: ['/api/thoughts'],
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const thoughts = thoughtsData?.thoughts || [];

  const getContributorName = (thought: Thought) => {
    if (thought.contributorType === 'guest') {
      return thought.guestName || 'Guest Contributor';
    }
    return thought.user?.fullName || 'Anonymous';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading thoughts...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ea580c" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Feather name="users" size={32} color="#ea580c" />
          <Text style={styles.headerTitle}>Social Neura</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          A collective intelligence network where thoughts spark insights
        </Text>
      </View>

      {/* Contribute Button */}
      <TouchableOpacity style={styles.contributeButton}>
        <Feather name="plus-circle" size={20} color="#fff" />
        <Text style={styles.contributeButtonText}>Contribute Your Thought</Text>
      </TouchableOpacity>

      {/* Thought Cards */}
      <View style={styles.thoughtsContainer}>
        {thoughts.map((thought) => (
          <View key={thought.id} style={styles.thoughtCard}>
            {/* Author Info */}
            <View style={styles.authorRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(getContributorName(thought))}
                </Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{getContributorName(thought)}</Text>
                {thought.contributorType === 'guest' && (
                  <Text style={styles.guestBadge}>Guest</Text>
                )}
              </View>
              {thought.guestLinkedInUrl && (
                <TouchableOpacity style={styles.linkedInIcon}>
                  <Feather name="linkedin" size={18} color="#0077b5" />
                </TouchableOpacity>
              )}
            </View>

            {/* Thought Content */}
            <Text style={styles.thoughtHeading}>{thought.heading}</Text>
            <Text style={styles.thoughtSummary} numberOfLines={3}>
              {thought.summary}
            </Text>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionButton}>
                <Feather name="zap" size={16} color="#f59e0b" />
                <Text style={styles.actionText}>Spark</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Feather name="eye" size={16} color="#06b6d4" />
                <Text style={styles.actionText}>Perspective</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {thoughts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Feather name="message-circle" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No thoughts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to contribute!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
  },
  loadingText: {
    fontSize: 16,
    color: '#9a3412',
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
    color: '#9a3412',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#c2410c',
    lineHeight: 20,
  },
  contributeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ea580c',
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
  contributeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  thoughtsContainer: {
    gap: 16,
  },
  thoughtCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ea580c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fed7aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9a3412',
  },
  authorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  guestBadge: {
    fontSize: 12,
    color: '#ea580c',
    marginTop: 2,
  },
  linkedInIcon: {
    padding: 4,
  },
  thoughtHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  thoughtSummary: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#78716c',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 4,
  },
});
