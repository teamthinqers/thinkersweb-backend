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
  channel?: string;
}

type ViewMode = 'cloud' | 'feed';
type SaveMode = 'choose' | 'write' | 'linkedin' | 'import' | 'whatsapp' | 'ai';

// Organic cloud positioning - seeded random for consistency
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate organic cloud positions for mobile (scaled from web version)
function generateCloudPositions(count: number, containerWidth: number): Array<{ x: number; y: number; size: number }> {
  const positions: Array<{ x: number; y: number; size: number }> = [];
  const dotSize = 120;
  const DOTS_PER_ROW = 3; // 3 dots per row for mobile
  
  // Buffers and margins
  const padding = 16;
  const topBuffer = 80;
  const leftBuffer = dotSize / 2 + padding;
  const rightBuffer = dotSize / 2 + padding;
  
  const availableWidth = containerWidth - leftBuffer - rightBuffer;
  const cellWidth = availableWidth / DOTS_PER_ROW;
  const cellHeight = 200; // Vertical spacing
  
  // Jitter for organic look
  const maxJitterX = cellWidth * 0.25;
  const maxJitterY = cellHeight * 0.2;
  
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / DOTS_PER_ROW);
    const col = i % DOTS_PER_ROW;
    
    // Base grid position
    const baseX = leftBuffer + (col * cellWidth) + (cellWidth / 2);
    const baseY = topBuffer + (row * cellHeight) + (cellHeight / 2);
    
    // Add random jitter
    const jitterX = (seededRandom(i * 2.5) - 0.5) * 2 * maxJitterX;
    const jitterY = (seededRandom(i * 3.7) - 0.5) * 2 * maxJitterY;
    
    positions.push({
      x: Math.max(leftBuffer, Math.min(containerWidth - rightBuffer, baseX + jitterX)),
      y: Math.max(topBuffer, baseY + jitterY),
      size: dotSize
    });
  }
  
  return positions;
}

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
      { id: 1, heading: 'Morning Clarity', summary: 'Best ideas come during quiet mornings', createdAt: new Date().toISOString(), keywords: 'productivity', channel: 'write' },
      { id: 2, heading: 'Deep Work', summary: 'Focus blocks unlock creative potential', createdAt: new Date().toISOString(), keywords: 'focus', channel: 'chatgpt' },
      { id: 3, heading: 'Learning Pace', summary: 'Slow learning leads to deep understanding', createdAt: new Date().toISOString(), keywords: 'learning', channel: 'linkedin' },
      { id: 4, heading: 'Creative Flow', summary: 'Constraints boost creative solutions', createdAt: new Date().toISOString(), keywords: 'creativity', channel: 'write' },
      { id: 5, heading: 'Mind Reset', summary: 'Breaks fuel productivity and clarity', createdAt: new Date().toISOString(), keywords: 'wellness', channel: 'whatsapp' },
      { id: 6, heading: 'Pattern Recognition', summary: 'Connecting dots reveals hidden insights', createdAt: new Date().toISOString(), keywords: 'insight', channel: 'write' },
      { id: 7, heading: 'Question Everything', summary: 'Best answers start with better questions', createdAt: new Date().toISOString(), keywords: 'curiosity', channel: 'chatgpt' },
      { id: 8, heading: 'System Thinking', summary: 'See the whole, not just the parts', createdAt: new Date().toISOString(), keywords: 'systems', channel: 'write' },
      { id: 9, heading: 'Feedback Loops', summary: 'Quick feedback accelerates learning', createdAt: new Date().toISOString(), keywords: 'growth', channel: 'ai' },
      { id: 10, heading: 'Mental Models', summary: 'Better models equal better decisions', createdAt: new Date().toISOString(), keywords: 'thinking', channel: 'write' },
      { id: 11, heading: 'Compound Effect', summary: 'Small daily actions create massive results', createdAt: new Date().toISOString(), keywords: 'habits', channel: 'chatgpt' },
      { id: 12, heading: 'First Principles', summary: 'Break down to fundamentals, rebuild anew', createdAt: new Date().toISOString(), keywords: 'reasoning', channel: 'write' },
      { id: 13, heading: 'Growth Mindset', summary: 'Abilities can be developed through dedication', createdAt: new Date().toISOString(), keywords: 'mindset', channel: 'linkedin' },
      { id: 14, heading: 'Focus Time', summary: 'Deep work requires distraction-free blocks', createdAt: new Date().toISOString(), keywords: 'productivity', channel: 'write' },
      { id: 15, heading: 'Creative Spark', summary: 'Innovation comes from connecting unrelated ideas', createdAt: new Date().toISOString(), keywords: 'creativity', channel: 'ai' },
    ];
  }

  const handleSaveThought = async () => {
    if (!summary.trim()) {
      Alert.alert('Error', 'Please enter your thought summary');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('POST', '/api/myneura/thoughts', {
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

  const renderCloudDot = ({ item }: { item: Thought }) => {
    const dotSize = 120;
    
    // Determine channel icon (5 modes: Write, LinkedIn, ChatGPT, WhatsApp, AI Help)
    const getChannelIcon = () => {
      switch (item.channel) {
        case 'write':
          return <Feather name="edit-3" size={12} color="#fff" />;
        case 'linkedin':
          return <MaterialCommunityIcons name="linkedin" size={12} color="#fff" />;
        case 'chatgpt':
          return <MaterialCommunityIcons name="robot" size={12} color="#fff" />;
        case 'whatsapp':
          return <MaterialCommunityIcons name="whatsapp" size={12} color="#fff" />;
        case 'ai':
          return <Feather name="zap" size={12} color="#fff" />;
        default:
          return <MaterialCommunityIcons name="lightbulb" size={12} color="#fff" />;
      }
    };
    
    return (
      <View style={[styles.cloudDotContainer, { width: dotSize, height: dotSize, margin: 12 }]}>
        {/* Avatar on top */}
        <View style={styles.cloudDotAvatar}>
          <View style={styles.avatarCircle}>
            <Feather name="user" size={16} color="#fff" />
          </View>
        </View>

        {/* Main circular dot */}
        <TouchableOpacity
          style={[styles.cloudDotCircle, { width: dotSize, height: dotSize }]}
          onPress={() => {
            setSelectedThought(item);
            setShowThoughtDetail(true);
          }}
          activeOpacity={0.7}
        >
          {/* Outer pulsing ring */}
          <View style={styles.cloudDotRingOuter} />
          
          {/* Middle glow layer */}
          <View style={styles.cloudDotRingMiddle} />
          
          {/* Inner content circle */}
          <View style={styles.cloudDotContent}>
            <Text style={styles.cloudDotHeading} numberOfLines={3}>
              {item.heading || item.summary}
            </Text>
          </View>
          
          {/* Sparkle particles */}
          <View style={styles.sparkleTop} />
          <View style={styles.sparkleBottom} />
        </TouchableOpacity>

        {/* Channel badge at bottom */}
        <View style={styles.cloudDotBadge}>
          {getChannelIcon()}
        </View>
      </View>
    );
  };

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
              <View style={styles.cloudContainerOrganic}>
                {thoughts.map((item, index) => {
                  const position = generateCloudPositions(thoughts.length, 400)[index];
                  return (
                    <View key={item.id} style={[styles.organicDot, { position: 'absolute', left: position.x, top: position.y, marginLeft: -60, marginTop: -60 }]}>
                      {renderCloudDot({ item })}
                    </View>
                  );
                })}
                
                {/* Fullscreen icon overlay */}
                <TouchableOpacity
                  style={styles.fullscreenIconOverlay}
                  onPress={() => setIsFullscreenCloud(true)}
                >
                  <Feather name="maximize-2" size={24} color={colors.primary[600]} />
                </TouchableOpacity>
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
                <Feather name="activity" size={24} color={colors.primary[500]} />
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
                {/* Write - Amber/Orange */}
                <TouchableOpacity style={[styles.wayCard, styles.wayCardWrite]} onPress={() => setSaveMode('write')}>
                  <Feather name="edit-3" size={48} color="#fff" />
                  <Text style={styles.wayTitleWhite}>Write</Text>
                </TouchableOpacity>

                {/* LinkedIn - Blue */}
                <TouchableOpacity style={[styles.wayCard, styles.wayCardLinkedIn]} onPress={() => Alert.alert('Coming Soon', 'LinkedIn import coming soon!')}>
                  <MaterialCommunityIcons name="linkedin" size={48} color="#fff" />
                  <Text style={styles.wayTitleWhite}>LinkedIn</Text>
                </TouchableOpacity>

                {/* ChatGPT - Teal/Emerald */}
                <TouchableOpacity style={[styles.wayCard, styles.wayCardChatGPT]} onPress={() => Alert.alert('Coming Soon', 'ChatGPT integration coming soon!')}>
                  <MaterialCommunityIcons name="robot" size={48} color="#fff" />
                  <Text style={styles.wayTitleWhite}>ChatGPT</Text>
                </TouchableOpacity>

                {/* WhatsApp - Green */}
                <TouchableOpacity style={[styles.wayCard, styles.wayCardWhatsApp]} onPress={() => Alert.alert('Coming Soon', 'WhatsApp integration coming soon!')}>
                  <MaterialCommunityIcons name="whatsapp" size={48} color="#fff" />
                  <Text style={styles.wayTitleWhite}>WhatsApp</Text>
                </TouchableOpacity>

                {/* AI Help - Purple */}
                <TouchableOpacity style={[styles.wayCard, styles.wayCardAI]} onPress={() => Alert.alert('Coming Soon', 'AI Help coming soon!')}>
                  <Feather name="zap" size={48} color="#fff" />
                  <Text style={styles.wayTitleWhite}>AI Help</Text>
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
            <View style={{ position: 'relative', width: '100%', minHeight: 2000 }}>
              {thoughts.map((item, index) => {
                const position = generateCloudPositions(thoughts.length, 400)[index];
                return (
                  <View key={item.id} style={[styles.organicDot, { position: 'absolute', left: position.x, top: position.y, marginLeft: -60, marginTop: -60 }]}>
                    {renderCloudDot({ item })}
                  </View>
                );
              })}
            </View>
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
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 12,
  },
  cloudContainerOrganic: {
    position: 'relative',
    width: '100%',
    minHeight: 2000,
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  organicDot: {
    width: 120,
    height: 120,
  },
  fullscreenIconOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: colors.primary[300],
  },
  cloudRow: {
    justifyContent: 'space-around',
    gap: 4,
    marginBottom: 8,
  },
  cloudDotContainer: {
    alignItems: 'center',
    position: 'relative',
    width: '30%',
    marginBottom: 20,
  },
  cloudDotAvatar: {
    position: 'absolute',
    top: -10,
    right: -5,
    zIndex: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[600],
    borderWidth: 2,
    borderColor: colors.primary[300],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cloudDotCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cloudDotRingOuter: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 72,
    backgroundColor: '#FB923C', // Web's orange-400 for outer pulsing ring
    opacity: 0.3,
  },
  cloudDotRingMiddle: {
    position: 'absolute',
    width: '110%',
    height: '110%',
    borderRadius: 66,
    backgroundColor: '#FBBF24', // Web's amber-400 for middle glow
    opacity: 0.6,
  },
  cloudDotContent: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    shadowColor: '#F59E0B', // Web's amber-500
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FCD34D', // Web's amber-300 for border
  },
  cloudDotHeading: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.gray[900],
    textAlign: 'center',
    lineHeight: 18,
  },
  cloudDotBadge: {
    position: 'absolute',
    bottom: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  sparkleTop: {
    position: 'absolute',
    top: 4,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FCD34D',
    opacity: 0.75,
  },
  sparkleBottom: {
    position: 'absolute',
    bottom: 8,
    left: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FB923C',
    opacity: 0.6,
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
    gap: 16,
    paddingVertical: 8,
  },
  wayCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 140,
  },
  wayCardWrite: {
    backgroundColor: '#FB923C', // Web's orange-400 (from-amber-400 via-orange-400 to-red-400 gradient)
  },
  wayCardLinkedIn: {
    backgroundColor: '#3B82F6', // Web's blue-500 (from-blue-400 via-blue-500 to-blue-600 gradient)
  },
  wayCardChatGPT: {
    backgroundColor: '#A855F7', // Web's purple-500 (from-purple-400 via-purple-500 to-purple-600 gradient)
  },
  wayCardWhatsApp: {
    backgroundColor: '#22C55E', // Web's green-500 (from-green-400 via-green-500 to-green-600 gradient)
  },
  wayCardAI: {
    backgroundColor: '#E879F9', // Web's fuchsia-400 (from-violet-400 via-fuchsia-400 to-pink-400 gradient)
  },
  wayTitleWhite: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: '#fff',
  },
  wayTitleGrey: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.gray[700],
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
    backgroundColor: '#FEF3C7',
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
