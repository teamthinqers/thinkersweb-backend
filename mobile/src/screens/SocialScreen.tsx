import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { ThoughtCard } from '../components/ThoughtCard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { queryClient } from '../lib/queryClient';

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
    avatar?: string;
    linkedinPhotoUrl?: string;
    linkedinProfileUrl?: string;
    email: string;
  };
};

export default function SocialScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { data: thoughtsData, isLoading, refetch } = useQuery<{ thoughts: Thought[] }>({
    queryKey: ['/api/thoughts'],
  });

  // Check admin status
  useEffect(() => {
    fetch('/api/auth/me', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.user?.email === 'aravindhraj1410@gmail.com') {
          setIsAdmin(true);
        }
      })
      .catch(err => console.error('Admin check failed:', err));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const thoughts = thoughtsData?.thoughts || [];

  const handleAvatarPress = (thought: Thought) => {
    let url = '';
    if (thought.contributorType === 'guest' && thought.guestLinkedInUrl) {
      url = thought.guestLinkedInUrl;
    } else if (thought.user?.linkedinProfileUrl) {
      url = thought.user.linkedinProfileUrl;
    }
    
    if (url) {
      Linking.openURL(url);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.orange[600]} />
        <Text style={styles.loadingText}>Loading thoughts...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.orange[600]} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Feather name="users" size={32} color={colors.primary[600]} />
          <Text style={styles.headerTitle}>Social Neura</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          A collective intelligence network where thoughts spark insights
        </Text>
      </View>

      {/* Contribute Button */}
      <TouchableOpacity style={styles.contributeButton}>
        <Feather name="sparkles" size={20} color="#fff" />
        <Text style={styles.contributeButtonText}>Share Your Thought</Text>
      </TouchableOpacity>

      {/* Thoughts Feed */}
      <View style={styles.thoughtsContainer}>
        {thoughts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="message-circle" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No thoughts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share an insight with the community!</Text>
            <TouchableOpacity style={styles.emptyButton}>
              <Feather name="sparkles" size={16} color="#fff" />
              <Text style={styles.emptyButtonText}>Share First Thought</Text>
            </TouchableOpacity>
          </View>
        ) : (
          thoughts.map((thought) => (
            <ThoughtCard
              key={thought.id}
              thought={thought}
              onAvatarPress={() => handleAvatarPress(thought)}
              showActions={true}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.social,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.social,
  },
  loadingText: {
    marginTop: 12,
    fontSize: typography.sizes.base,
    color: colors.orange[900],
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary[600],
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  contributeButton: {
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
  contributeButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#fff',
    marginLeft: 8,
  },
  thoughtsContainer: {
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.gray[700],
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
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
});
