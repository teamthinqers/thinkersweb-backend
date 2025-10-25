import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { queryClient, apiRequest } from '../lib/queryClient';

interface MyNeuraStats {
  thoughts: number;
  sparks: number;
  neuralStrength: number;
}

export default function MyNeuraScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('reflections');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [thoughtText, setThoughtText] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleSaveThought = async () => {
    if (!thoughtText.trim()) {
      Alert.alert('Error', 'Please enter your thought');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/api/myneura/thoughts', 'POST', {
        content: thoughtText.trim(),
      });
      
      setThoughtText('');
      setShowSaveModal(false);
      queryClient.invalidateQueries({ queryKey: ['/api/myneura/stats'] });
      Alert.alert('Success', 'Your thought has been saved!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save thought');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfigureCognitiveIdentity = () => {
    Alert.alert(
      '🧠 Cognitive Identity',
      'Define your unique cognitive fingerprint by adjusting parameters like:\n\n• Memory Bandwidth (Short Burst vs Deep Retainer)\n• Thought Complexity (Simple vs Layered)\n• Cognitive Pace (Deep vs Rapid Processing)\n• Signal Focus (Narrow Beam vs Wide Scanner)\n• Decision Making (Intuitive vs Logical)\n\nFull configuration coming in next update!',
      [{ text: 'Got it', style: 'cancel' }]
    );
  };

  const handleConfigureLearningEngine = () => {
    Alert.alert(
      '📚 Learning Engine',
      'Personalize your learning experience by:\n\n• Adding custom learning topics\n• Selecting resource types (books, papers, etc.)\n• Choosing learning formats (notes, infographics)\n• Setting daily learning time\n• Enabling WhatsApp learning prompts\n\nFull configuration coming in next update!',
      [{ text: 'Got it', style: 'cancel' }]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.green[500]} />
        <Text style={styles.loadingText}>Loading MyNeura...</Text>
      </View>
    );
  }

  return (
    <>
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
              <TouchableOpacity style={styles.saveButton} onPress={() => setShowSaveModal(true)}>
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
              <TouchableOpacity style={styles.configButton} onPress={handleConfigureCognitiveIdentity}>
                <Text style={styles.configButtonText}>Configure Identity</Text>
                <Feather name="chevron-right" size={20} color="#fff" />
              </TouchableOpacity>
            </Card>

            <Card>
              <View style={styles.settingRow}>
                <Feather name="book-open" size={24} color={colors.purple[600]} />
                <Text style={styles.settingTitle}>Learning Engine</Text>
              </View>
              <TouchableOpacity style={[styles.configButton, styles.configButtonSecondary]} onPress={handleConfigureLearningEngine}>
                <Text style={styles.configButtonText}>Configure Learning</Text>
                <Feather name="chevron-right" size={20} color="#fff" />
              </TouchableOpacity>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Save Thought Modal */}
      <Modal
        visible={showSaveModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Save Thought / Dot</Text>
              <TouchableOpacity onPress={() => setShowSaveModal(false)}>
                <Feather name="x" size={24} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What's on your mind?"
              value={thoughtText}
              onChangeText={setThoughtText}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              maxLength={1000}
              autoFocus
            />

            <TouchableOpacity 
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
              onPress={handleSaveThought}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Feather name="save" size={18} color="#fff" />
                  <Text style={styles.submitButtonText}>Save Thought</Text>
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
    height: 180,
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
