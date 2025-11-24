import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Linking, Modal, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { ThoughtCard } from '../components/ThoughtCard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { queryClient, apiRequest } from '../lib/queryClient';

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
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [heading, setHeading] = useState('');
  const [thought, setThought] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.email === 'aravindhraj1410@gmail.com';

  const { data: thoughtsData, isLoading, refetch } = useQuery<{ thoughts: Thought[] }>({
    queryKey: ['/api/thoughts'],
  });

  const sparkMutation = useMutation({
    mutationFn: (thoughtId: number) => apiRequest('/api/thoughts/spark', 'POST', { thoughtId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts'] });
    },
  });

  const perspectiveMutation = useMutation({
    mutationFn: (thoughtId: number) => apiRequest('/api/thoughts/perspective', 'POST', { thoughtId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts'] });
    },
  });

  const deleteThoughtMutation = useMutation({
    mutationFn: (thoughtId: number) => apiRequest(`/api/thoughts/${thoughtId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts'] });
      Alert.alert('Success', 'Thought deleted successfully');
    },
  });

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

  const handleSpark = (thoughtId: number) => {
    sparkMutation.mutate(thoughtId);
  };

  const handlePerspective = (thoughtId: number) => {
    perspectiveMutation.mutate(thoughtId);
  };

  const handleDelete = (thoughtId: number) => {
    Alert.alert(
      'Delete Thought',
      'Are you sure you want to delete this thought?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteThoughtMutation.mutate(thoughtId) },
      ]
    );
  };

  const handleShare = async () => {
    if (!heading.trim() || !thought.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/api/thoughts', 'POST', {
        heading: heading.trim(),
        summary: thought.trim(),
      });
      
      setHeading('');
      setThought('');
      setShowShareModal(false);
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts'] });
      Alert.alert('Success', 'Your thought has been shared!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to share thought');
    } finally {
      setSubmitting(false);
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
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.orange[600]} />
        }
      >
        {/* Section Header */}
        <View style={styles.appHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.brainIconContainer}>
              <Feather name="globe" size={28} color="#fff" />
            </View>
            <Text style={styles.appHeaderTitle}>Social</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => alert('Notifications')}>
              <MaterialCommunityIcons name="bell" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => alert('Menu')}>
              <Feather name="menu" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

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
        <TouchableOpacity style={styles.contributeButton} onPress={() => setShowShareModal(true)}>
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
              <TouchableOpacity style={styles.emptyButton} onPress={() => setShowShareModal(true)}>
                <Feather name="sparkles" size={16} color="#fff" />
                <Text style={styles.emptyButtonText}>Share First Thought</Text>
              </TouchableOpacity>
            </View>
          ) : (
            thoughts.map((thought) => (
              <View key={thought.id} style={styles.thoughtWrapper}>
                <ThoughtCard
                  thought={thought}
                  onAvatarPress={() => handleAvatarPress(thought)}
                  showActions={true}
                />
                
                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => handleSpark(thought.id)}
                    disabled={sparkMutation.isPending}
                  >
                    <Feather name="zap" size={16} color={colors.primary[500]} />
                    <Text style={styles.actionText}>Spark</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => handlePerspective(thought.id)}
                    disabled={perspectiveMutation.isPending}
                  >
                    <Feather name="eye" size={16} color={colors.cyan[500]} />
                    <Text style={styles.actionText}>Perspective</Text>
                  </TouchableOpacity>

                  {isAdmin && (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]} 
                      onPress={() => handleDelete(thought.id)}
                      disabled={deleteThoughtMutation.isPending}
                    >
                      <Feather name="trash-2" size={16} color={colors.error} />
                      <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Share Thought Modal */}
      <Modal
        visible={showShareModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Your Thought</Text>
              <TouchableOpacity onPress={() => setShowShareModal(false)}>
                <Feather name="x" size={24} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Thought Heading"
              value={heading}
              onChangeText={setHeading}
              maxLength={100}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Share your insight..."
              value={thought}
              onChangeText={setThought}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />

            <TouchableOpacity 
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
              onPress={handleShare}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Feather name="send" size={18} color="#fff" />
                  <Text style={styles.submitButtonText}>Share Thought</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
  thoughtWrapper: {
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  actionText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.gray[700],
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.gray[900],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: typography.sizes.base,
    marginBottom: 16,
    backgroundColor: colors.gray[50],
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary[600],
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#fff',
  },
});
