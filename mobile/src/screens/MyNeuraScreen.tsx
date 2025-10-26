import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput, Alert, FlatList } from 'react-native';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
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

interface Thought {
  id: number;
  heading: string;
  summary: string;
  anchor?: string;
  pulse?: string;
  createdAt: string;
  keywords?: string;
}

type ViewMode = 'cloud' | 'feed';
type SaveMode = 'choose' | 'write' | 'speak' | 'think' | 'reflect' | 'discover';

export default function MyNeuraScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('myneura');
  const [viewMode, setViewMode] = useState<ViewMode>('cloud');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveMode, setSaveMode] = useState<SaveMode>('choose');
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  const [showThoughtDetail, setShowThoughtDetail] = useState(false);
  const [detailTab, setDetailTab] = useState('details');
  const [isFullscreenCloud, setIsFullscreenCloud] = useState(false);
  
  // Form data
  const [heading, setHeading] = useState('');
  const [summary, setSummary] = useState('');
  const [anchor, setAnchor] = useState('');
  const [pulse, setPulse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery<{ success: boolean; data: MyNeuraStats }>({
    queryKey: ['/api/myneura/stats'],
    enabled: !!user,
  });

  const { data: thoughtsData, isLoading: thoughtsLoading, refetch: refetchThoughts } = useQuery<{ success: boolean; data: Thought[] }>({
    queryKey: ['/api/myneura/thoughts'],
    enabled: !!user,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchThoughts()]);
    setRefreshing(false);
  };

  const stats = statsData?.data;
  let thoughts = thoughtsData?.data || [];
  
  // Add test dots for demo (remove when user has real dots)
  if (thoughts.length === 0) {
    thoughts = [
      { id: 1, heading: 'Morning Clarity', summary: 'Best ideas come during quiet mornings', createdAt: new Date().toISOString(), keywords: 'productivity' },
      { id: 2, heading: 'Deep Work', summary: 'Focus blocks unlock creative potential', createdAt: new Date().toISOString(), keywords: 'focus' },
      { id: 3, heading: 'Learning Pace', summary: 'Slow learning leads to deep understanding', createdAt: new Date().toISOString(), keywords: 'learning' },
      { id: 4, heading: 'Creative Flow', summary: 'Constraints boost creative solutions', createdAt: new Date().toISOString(), keywords: 'creativity' },
      { id: 5, heading: 'Mind Reset', summary: 'Breaks fuel productivity and clarity', createdAt: new Date().toISOString(), keywords: 'wellness' },
      { id: 6, heading: 'Pattern Recognition', summary: 'Connecting dots reveals hidden insights', createdAt: new Date().toISOString(), keywords: 'insight' },
      { id: 7, heading: 'Question Everything', summary: 'Best answers start with better questions', createdAt: new Date().toISOString(), keywords: 'curiosity' },
      { id: 8, heading: 'System Thinking', summary: 'See the whole, not just the parts', createdAt: new Date().toISOString(), keywords: 'systems' },
      { id: 9, heading: 'Feedback Loops', summary: 'Quick feedback accelerates learning', createdAt: new Date().toISOString(), keywords: 'growth' },
      { id: 10, heading: 'Mental Models', summary: 'Better models equal better decisions', createdAt: new Date().toISOString(), keywords: 'thinking' },
      { id: 11, heading: 'Compound Effect', summary: 'Small daily actions create massive results', createdAt: new Date().toISOString(), keywords: 'habits' },
      { id: 12, heading: 'First Principles', summary: 'Break down to fundamentals, rebuild anew', createdAt: new Date().toISOString(), keywords: 'reasoning' },
    ];
  }

  const handleSaveThought = async () => {
    if (!summary.trim()) {
      Alert.alert('Error', 'Please enter your thought summary');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/api/myneura/thoughts', 'POST', {
        heading: heading.trim() || 'Untitled',
        summary: summary.trim(),
        anchor: anchor.trim(),
        pulse: pulse.trim(),
      });
      
      resetForm();
      setShowSaveModal(false);
      setSaveMode('choose');
      queryClient.invalidateQueries({ queryKey: ['/api/myneura/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/myneura/thoughts'] });
      Alert.alert('Success', 'Your dot has been saved!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save dot');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setHeading('');
    setSummary('');
    setAnchor('');
    setPulse('');
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

  const renderThoughtCard = ({ item }: { item: Thought }) => (
    <TouchableOpacity 
      onPress={() => {
        setSelectedThought(item);
        setShowThoughtDetail(true);
      }}
    >
      <Card style={styles.thoughtCard}>
        <View style={styles.thoughtHeader}>
          <View style={styles.iconBulb}>
            <Feather name="zap" size={20} color={colors.primary[600]} />
          </View>
          <View style={styles.thoughtContent}>
            <Text style={styles.thoughtHeading} numberOfLines={2}>{item.heading || item.summary}</Text>
            <Text style={styles.thoughtMeta}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.gray[400]} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderCloudDot = ({ item }: { item: Thought }) => (
    <TouchableOpacity 
      style={styles.cloudDot}
      onPress={() => {
        setSelectedThought(item);
        setShowThoughtDetail(true);
      }}
    >
      <View style={styles.cloudDotInner}>
        <Feather name="zap" size={16} color={colors.primary[700]} />
        <Text style={styles.cloudDotText} numberOfLines={2}>
          {item.heading || item.summary}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (statsLoading || thoughtsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />
        }
      >
        {/* Compact Header with Inline Stats */}
        <View style={styles.compactHeader}>
          <View>
            <Text style={styles.headerTitle}>MyNeura</Text>
            <Text style={styles.headerSubtitle}>Your Thought Cloud</Text>
          </View>
        </View>

        {/* Compact Stats Row */}
        <View style={styles.compactStatsRow}>
          <View style={styles.compactStat}>
            <MaterialCommunityIcons name="lightbulb-on" size={20} color={colors.primary[500]} />
            <Text style={styles.compactStatValue}>{stats?.thoughts || 0}</Text>
            <Text style={styles.compactStatLabel}>Dots</Text>
          </View>
          <View style={styles.compactStatDivider} />
          <View style={styles.compactStat}>
            <Feather name="zap" size={20} color={colors.primary[500]} />
            <Text style={styles.compactStatValue}>{stats?.sparks || 0}</Text>
            <Text style={styles.compactStatLabel}>Sparks</Text>
          </View>
          <View style={styles.compactStatDivider} />
          <View style={styles.compactStat}>
            <Feather name="activity" size={20} color={colors.primary[600]} />
            <Text style={styles.compactStatValue}>{stats?.neuralStrength || 10}%</Text>
            <Text style={styles.compactStatLabel}>Neural</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'myneura' && styles.tabActive]}
            onPress={() => setSelectedTab('myneura')}
          >
            <Text style={[styles.tabText, selectedTab === 'myneura' && styles.tabTextActive]}>
              My Neura
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
        {selectedTab === 'myneura' ? (
          <View style={styles.content}>
            {/* View Mode Toggle with Fullscreen */}
            <View style={styles.viewToggleRow}>
              <View style={styles.viewToggle}>
                <TouchableOpacity
                  style={[styles.toggleButton, viewMode === 'cloud' && styles.toggleButtonActive]}
                  onPress={() => setViewMode('cloud')}
                >
                  <Text style={[styles.toggleButtonText, viewMode === 'cloud' && styles.toggleButtonTextActive]}>
                    Cloud
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, viewMode === 'feed' && styles.toggleButtonActive]}
                  onPress={() => setViewMode('feed')}
                >
                  <Text style={[styles.toggleButtonText, viewMode === 'feed' && styles.toggleButtonTextActive]}>
                    Feed
                  </Text>
                </TouchableOpacity>
              </View>
              {viewMode === 'cloud' && thoughts.length > 0 && (
                <TouchableOpacity 
                  style={styles.fullscreenButton}
                  onPress={() => setIsFullscreenCloud(true)}
                >
                  <Feather name="maximize-2" size={20} color={colors.primary[600]} />
                </TouchableOpacity>
              )}
            </View>

            {thoughts.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Feather name="message-circle" size={48} color={colors.gray[300]} />
                <Text style={styles.emptyTitle}>No dots yet</Text>
                <Text style={styles.emptyText}>Start capturing your thoughts and insights</Text>
                <TouchableOpacity style={styles.saveButton} onPress={() => setShowSaveModal(true)}>
                  <Feather name="plus-circle" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Dot</Text>
                </TouchableOpacity>
              </Card>
            ) : viewMode === 'feed' ? (
              <FlatList
                data={thoughts}
                renderItem={renderThoughtCard}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                contentContainerStyle={{ gap: 12 }}
              />
            ) : (
              <View style={styles.cloudContainer}>
                <FlatList
                  data={thoughts}
                  renderItem={renderCloudDot}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={2}
                  scrollEnabled={false}
                  columnWrapperStyle={styles.cloudRow}
                  contentContainerStyle={{ gap: 12 }}
                />
              </View>
            )}

            {thoughts.length > 0 && (
              <TouchableOpacity style={[styles.saveButton, styles.fabButton]} onPress={() => setShowSaveModal(true)}>
                <Feather name="plus" size={24} color="#fff" />
              </TouchableOpacity>
            )}
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

      {/* Save Dot Modal */}
      <Modal
        visible={showSaveModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowSaveModal(false);
          setSaveMode('choose');
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {saveMode === 'choose' ? 'Save a Dot - 5 Ways' : `Save Dot - ${saveMode.charAt(0).toUpperCase() + saveMode.slice(1)} Mode`}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowSaveModal(false);
                setSaveMode('choose');
                resetForm();
              }}>
                <Feather name="x" size={24} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>

            {saveMode === 'choose' ? (
              <View style={styles.fiveWaysContainer}>
                <TouchableOpacity style={styles.wayCard} onPress={() => setSaveMode('write')}>
                  <Feather name="edit-3" size={32} color={colors.primary[600]} />
                  <Text style={styles.wayTitle}>Write</Text>
                  <Text style={styles.wayDescription}>Express in your own words</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.wayCard} onPress={() => Alert.alert('Coming Soon', 'Voice input will be available in the next update!')}>
                  <Feather name="mic" size={32} color={colors.primary[600]} />
                  <Text style={styles.wayTitle}>Speak</Text>
                  <Text style={styles.wayDescription}>Voice your thoughts</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.wayCard} onPress={() => Alert.alert('Coming Soon', 'AI-assisted thinking will be available soon!')}>
                  <Feather name="cpu" size={32} color={colors.primary[600]} />
                  <Text style={styles.wayTitle}>Think</Text>
                  <Text style={styles.wayDescription}>AI helps you think</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.wayCard} onPress={() => Alert.alert('Coming Soon', 'Guided reflection will be available soon!')}>
                  <Feather name="eye" size={32} color={colors.primary[600]} />
                  <Text style={styles.wayTitle}>Reflect</Text>
                  <Text style={styles.wayDescription}>Guided deep reflection</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.wayCard} onPress={() => Alert.alert('Coming Soon', 'Content discovery will be available soon!')}>
                  <Feather name="search" size={32} color={colors.primary[600]} />
                  <Text style={styles.wayTitle}>Discover</Text>
                  <Text style={styles.wayDescription}>Explore and save insights</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={styles.writeForm}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Heading</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Give your dot a title..."
                    value={heading}
                    onChangeText={setHeading}
                    maxLength={100}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Summary *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="What's your thought?"
                    value={summary}
                    onChangeText={setSummary}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    maxLength={1000}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Anchor (Context)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="What helps you recall this?"
                    value={anchor}
                    onChangeText={setAnchor}
                    maxLength={200}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Pulse (Emotion)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="What emotion is associated?"
                    value={pulse}
                    onChangeText={setPulse}
                    maxLength={100}
                  />
                </View>

                <View style={styles.formActions}>
                  <TouchableOpacity 
                    style={styles.secondaryButton}
                    onPress={() => {
                      setSaveMode('choose');
                      resetForm();
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>Back</Text>
                  </TouchableOpacity>

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
                        <Text style={styles.submitButtonText}>Save Dot</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Thought Detail Modal */}
      <Modal
        visible={showThoughtDetail}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowThoughtDetail(false);
          setSelectedThought(null);
          setDetailTab('details');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dot Details</Text>
              <TouchableOpacity onPress={() => {
                setShowThoughtDetail(false);
                setSelectedThought(null);
                setDetailTab('details');
              }}>
                <Feather name="x" size={24} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>

            {/* Detail Tabs */}
            <View style={styles.detailTabs}>
              <TouchableOpacity
                style={[styles.detailTab, detailTab === 'details' && styles.detailTabActive]}
                onPress={() => setDetailTab('details')}
              >
                <Text style={[styles.detailTabText, detailTab === 'details' && styles.detailTabTextActive]}>
                  Details
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.detailTab, detailTab === 'perspectives' && styles.detailTabActive]}
                onPress={() => setDetailTab('perspectives')}
              >
                <Text style={[styles.detailTabText, detailTab === 'perspectives' && styles.detailTabTextActive]}>
                  Perspectives
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.detailTab, detailTab === 'spark' && styles.detailTabActive]}
                onPress={() => setDetailTab('spark')}
              >
                <Text style={[styles.detailTabText, detailTab === 'spark' && styles.detailTabTextActive]}>
                  Spark
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailContent}>
              {detailTab === 'details' && selectedThought && (
                <View style={styles.detailSection}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Heading:</Text>
                    <Text style={styles.detailValue}>{selectedThought.heading || 'Untitled'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Summary:</Text>
                    <Text style={styles.detailValue}>{selectedThought.summary}</Text>
                  </View>
                  {selectedThought.anchor && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Anchor:</Text>
                      <Text style={styles.detailValue}>{selectedThought.anchor}</Text>
                    </View>
                  )}
                  {selectedThought.pulse && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Pulse:</Text>
                      <Text style={styles.detailValue}>{selectedThought.pulse}</Text>
                    </View>
                  )}
                  {selectedThought.keywords && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Keywords:</Text>
                      <Text style={styles.detailValue}>{selectedThought.keywords}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Created:</Text>
                    <Text style={styles.detailValue}>{new Date(selectedThought.createdAt).toLocaleString()}</Text>
                  </View>
                </View>
              )}

              {detailTab === 'perspectives' && (
                <View style={styles.detailSection}>
                  <Text style={styles.comingSoonText}>AI-generated perspectives coming soon!</Text>
                  <Text style={styles.comingSoonDescription}>
                    View your dot from different angles and discover new insights.
                  </Text>
                </View>
              )}

              {detailTab === 'spark' && (
                <View style={styles.detailSection}>
                  <Text style={styles.comingSoonText}>Spark connections coming soon!</Text>
                  <Text style={styles.comingSoonDescription}>
                    See how this dot connects to your other thoughts and goals.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Fullscreen Cloud Modal */}
      <Modal
        visible={isFullscreenCloud}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setIsFullscreenCloud(false)}
      >
        <View style={styles.fullscreenContainer}>
          <View style={styles.fullscreenHeader}>
            <Text style={styles.fullscreenTitle}>Thought Cloud</Text>
            <TouchableOpacity onPress={() => setIsFullscreenCloud(false)}>
              <Feather name="minimize-2" size={24} color={colors.primary[600]} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.fullscreenCloudScroll} contentContainerStyle={styles.fullscreenCloudContent}>
            <FlatList
              data={thoughts}
              renderItem={renderCloudDot}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.cloudRow}
              contentContainerStyle={{ gap: 12 }}
            />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF9E7',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF9E7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: typography.sizes.base,
    color: colors.primary[700],
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary[900],
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: typography.sizes.base,
    color: colors.primary[700],
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
    backgroundColor: colors.primary[600], // Changed from green to amber/orange
    borderRadius: 6,
  },
  neuralProgressText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary[600], // Changed from green to amber/orange
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
    backgroundColor: colors.primary[600], // Changed from purple to amber/orange
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
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary[100],
  },
  toggleButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.gray[600],
  },
  toggleButtonTextActive: {
    color: colors.primary[700],
    fontWeight: typography.weights.semibold,
  },
  thoughtCard: {
    marginBottom: 12,
  },
  thoughtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBulb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  thoughtContent: {
    flex: 1,
  },
  thoughtHeading: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.gray[900],
    marginBottom: 4,
  },
  thoughtMeta: {
    fontSize: typography.sizes.xs,
    color: colors.gray[500],
  },
  cloudContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  cloudRow: {
    gap: 12,
  },
  cloudDot: {
    flex: 1,
    margin: 4,
  },
  cloudDotInner: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary[300],
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  cloudDotText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary[900],
    textAlign: 'center',
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
    textAlign: 'center',
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
  fabButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    maxHeight: '90%',
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
  fiveWaysContainer: {
    gap: 12,
  },
  wayCard: {
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.primary[200],
    alignItems: 'center',
  },
  wayTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary[800],
    marginTop: 12,
    marginBottom: 4,
  },
  wayDescription: {
    fontSize: typography.sizes.sm,
    color: colors.primary[600],
    textAlign: 'center',
  },
  writeForm: {
    maxHeight: 500,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.gray[700],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: typography.sizes.base,
    backgroundColor: colors.gray[50],
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary[600],
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.primary[600],
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary[600],
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#fff',
  },
  detailTabs: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  detailTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  detailTabActive: {
    backgroundColor: '#fff',
  },
  detailTabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.gray[600],
  },
  detailTabTextActive: {
    color: colors.primary[700],
    fontWeight: typography.weights.semibold,
  },
  detailContent: {
    maxHeight: 400,
  },
  detailSection: {
    gap: 16,
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.gray[700],
  },
  detailValue: {
    fontSize: typography.sizes.base,
    color: colors.gray[900],
    lineHeight: 24,
  },
  comingSoonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.primary[700],
    textAlign: 'center',
    marginBottom: 12,
  },
  comingSoonDescription: {
    fontSize: typography.sizes.base,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  // Compact Stats Styles
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  compactStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  compactStat: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  compactStatDivider: {
    width: 1,
    backgroundColor: colors.gray[200],
    marginHorizontal: 8,
  },
  compactStatValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary[700],
  },
  compactStatLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.gray[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  fullscreenButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  // Fullscreen Cloud Styles
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'linear-gradient(135deg, #FEF3C7 0%, #FCD34D 100%)',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[200],
  },
  fullscreenTitle: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary[900],
  },
  fullscreenCloudScroll: {
    flex: 1,
  },
  fullscreenCloudContent: {
    padding: 20,
  },
});
