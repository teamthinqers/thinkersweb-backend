import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Image, Dimensions, Modal, TextInput } from 'react-native';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import { queryClient, apiRequest } from '../lib/queryClient';

const { width } = Dimensions.get('window');

interface Thought {
  id: number;
  heading: string;
  summary: string;
  contributorType: string;
  guestName?: string;
  guestLinkedInUrl?: string;
  createdAt: string;
  sparksCount?: number;
  perspectivesCount?: number;
  user?: {
    id: number;
    fullName: string;
    avatar?: string;
    linkedinPhotoUrl?: string;
    linkedinProfileUrl?: string;
    email: string;
  };
}

export default function SocialScreenV2() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [heading, setHeading] = useState('');
  const [thought, setThought] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.email === 'aravindhraj1410@gmail.com';

  const { data: thoughtsData, isLoading, refetch } = useQuery<{ thoughts: Thought[] }>({
    queryKey: ['/api/thoughts'],
  });

  const sparkMutation = useMutation({
    mutationFn: (thoughtId: number) => apiRequest('/api/thoughts/spark', 'POST', { thoughtId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/thoughts'] }),
  });

  const perspectiveMutation = useMutation({
    mutationFn: (thoughtId: number) => apiRequest('/api/thoughts/perspective', 'POST', { thoughtId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/thoughts'] }),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const thoughts = thoughtsData?.thoughts || [];

  const handleCreateThought = async () => {
    if (!heading.trim() || !thought.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/api/thoughts', 'POST', { heading, thought });
      await refetch();
      setHeading('');
      setThought('');
      setShowCreateModal(false);
    } catch (error) {
      alert('Failed to create thought');
    } finally {
      setSubmitting(false);
    }
  };

  const getAvatarSource = (thought: Thought) => {
    if (thought.user?.linkedinPhotoUrl) return { uri: thought.user.linkedinPhotoUrl };
    if (thought.user?.avatar) return { uri: thought.user.avatar };
    return require('../../../assets/avatar-placeholder.png');
  };

  const ThoughtCard = ({ t }: { t: Thought }) => (
    <View style={styles.thoughtCard}>
      {/* Author Header */}
      <View style={styles.authorSection}>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>
            {t.user?.fullName || t.guestName || 'Anonymous'}
          </Text>
          <Text style={styles.authorType}>
            {t.contributorType === 'guest' ? '👤 Guest' : '✓ Member'}
          </Text>
        </View>
        {t.user && (
          <Image
            source={getAvatarSource(t)}
            style={styles.avatar}
            defaultSource={require('../../../assets/avatar-placeholder.png')}
          />
        )}
      </View>

      {/* Content */}
      <View style={styles.contentSection}>
        <Text style={styles.thoughtHeading}>{t.heading}</Text>
        <Text style={styles.thoughtText} numberOfLines={3}>{t.summary}</Text>
      </View>

      {/* Metadata */}
      <View style={styles.metadata}>
        <Text style={styles.metadataText}>
          {new Date(t.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: new Date(t.createdAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
          })}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => sparkMutation.mutate(t.id)}
          disabled={sparkMutation.isPending}
        >
          <MaterialCommunityIcons name="lightbulb" size={16} color={colors.amber} />
          <Text style={styles.actionText}>{t.sparksCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => perspectiveMutation.mutate(t.id)}
          disabled={perspectiveMutation.isPending}
        >
          <MaterialCommunityIcons name="comment-outline" size={16} color={colors.blue} />
          <Text style={styles.actionText}>{t.perspectivesCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="share-outline" size={16} color={colors.gray} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="delete-outline" size={16} color="#e74c3c" />
            <Text style={[styles.actionText, { color: '#e74c3c' }]}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.amber}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Social Reflections</Text>
            <Text style={styles.headerSubtitle}>Share your insights with the community</Text>
          </View>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Community Stats */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{thoughts.length}</Text>
            <Text style={styles.statLabel}>Thoughts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {thoughts.reduce((acc, t) => acc + (t.sparksCount || 0), 0)}
            </Text>
            <Text style={styles.statLabel}>Sparks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {thoughts.reduce((acc, t) => acc + (t.perspectivesCount || 0), 0)}
            </Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
        </View>

        {/* Thoughts Feed */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.amber} />
          </View>
        ) : thoughts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="lightbulb-outline" size={64} color={colors.lightGray} />
            <Text style={styles.emptyTitle}>No Thoughts Yet</Text>
            <Text style={styles.emptyText}>Be the first to share your insights!</Text>
          </View>
        ) : (
          <View style={styles.feedContainer}>
            {thoughts.map((t) => (
              <ThoughtCard key={t.id} t={t} />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Create Modal */}
      {showCreateModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Your Thought</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Heading</Text>
              <TextInput
                style={styles.textInput}
                placeholder="What's on your mind?"
                placeholderTextColor={colors.lightGray}
                value={heading}
                onChangeText={setHeading}
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Thought</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Share your insights..."
                placeholderTextColor={colors.lightGray}
                value={thought}
                onChangeText={setThought}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleCreateThought}
              disabled={submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? 'Publishing...' : 'Publish Thought'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.lightGray,
    marginTop: 4,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.orange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
    marginVertical: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.orange,
  },
  statLabel: {
    fontSize: 11,
    color: colors.lightGray,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  feedContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thoughtCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.orange,
  },
  authorSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  authorType: {
    fontSize: 11,
    color: colors.lightGray,
    marginTop: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.lightGray,
  },
  contentSection: {
    marginBottom: 10,
  },
  thoughtHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  thoughtText: {
    fontSize: 12,
    color: colors.lightGray,
    lineHeight: 18,
  },
  metadata: {
    marginBottom: 10,
  },
  metadataText: {
    fontSize: 11,
    color: colors.lightGray,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 11,
    color: colors.lightGray,
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
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
  modal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    height: '100%',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#000',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.orange,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
