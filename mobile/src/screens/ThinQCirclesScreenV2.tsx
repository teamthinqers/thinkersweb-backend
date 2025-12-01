import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, FlatList, Dimensions, Modal, TextInput } from 'react-native';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';
import { queryClient, apiRequest } from '../lib/queryClient';

const { width } = Dimensions.get('window');

interface CircleMember {
  id: number;
  fullName: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface Circle {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  memberCount?: number;
  members?: CircleMember[];
  isOwner?: boolean;
}

export default function ThinQCirclesScreenV2() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [circleName, setCircleName] = useState('');
  const [circleDescription, setCircleDescription] = useState('');

  const { data: circlesData, isLoading, refetch } = useQuery<{ circles: Circle[] }>({
    queryKey: ['/api/thinq-circles'],
  });

  const createCircleMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      apiRequest('/api/thinq-circles', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/thinq-circles'] });
      setShowCreateModal(false);
      setCircleName('');
      setCircleDescription('');
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const circles = circlesData?.circles || [];

  const handleCreateCircle = async () => {
    if (!circleName.trim()) {
      alert('Please enter a circle name');
      return;
    }
    await createCircleMutation.mutateAsync({
      name: circleName,
      description: circleDescription,
    });
  };

  const CircleCard = ({ circle }: { circle: Circle }) => (
    <TouchableOpacity 
      style={styles.circleCard}
      onPress={() => setSelectedCircle(circle)}
    >
      <View style={styles.circleCardHeader}>
        <View style={styles.circleBadge}>
          <MaterialCommunityIcons name="circle-outline" size={20} color={colors.blue} />
        </View>
        <View style={styles.circleInfo}>
          <Text style={styles.circleName}>{circle.name}</Text>
          <Text style={styles.circleDate}>
            Created {new Date(circle.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
        {circle.isOwner && (
          <View style={styles.ownerBadge}>
            <Text style={styles.ownerText}>Owner</Text>
          </View>
        )}
      </View>
      
      {circle.description && (
        <Text style={styles.circleDescription} numberOfLines={2}>
          {circle.description}
        </Text>
      )}

      <View style={styles.circleFooter}>
        <View style={styles.memberInfo}>
          <MaterialCommunityIcons name="account-multiple" size={14} color={colors.gray} />
          <Text style={styles.memberCount}>{circle.memberCount || 0} members</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.lightGray} />
      </View>
    </TouchableOpacity>
  );

  const MemberCard = ({ member }: { member: CircleMember }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>
          {member.fullName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.memberDetails}>
        <Text style={styles.memberName}>{member.fullName}</Text>
        <Text style={styles.memberEmail}>{member.email}</Text>
      </View>
      {member.role && (
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{member.role}</Text>
        </View>
      )}
    </View>
  );

  const CircleDetailModal = ({ circle }: { circle: Circle }) => (
    <Modal
      visible={!!circle}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.detailModalBackdrop}>
        <View style={styles.detailModalContent}>
          <View style={styles.detailModalHeader}>
            <TouchableOpacity onPress={() => setSelectedCircle(null)}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.detailModalTitle}>{circle.name}</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.detailModalScroll}>
            {circle.description && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>About</Text>
                <Text style={styles.detailDescription}>{circle.description}</Text>
              </View>
            )}

            {circle.members && circle.members.length > 0 && (
              <View style={styles.detailSection}>
                <View style={styles.detailSectionHeader}>
                  <Text style={styles.detailSectionTitle}>Members</Text>
                  <View style={styles.memberCountBadge}>
                    <Text style={styles.memberCountText}>{circle.members.length}</Text>
                  </View>
                </View>
                {circle.members.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </View>
            )}
          </ScrollView>

          {circle.isOwner && (
            <View style={styles.detailActions}>
              <TouchableOpacity style={styles.detailActionButton}>
                <MaterialCommunityIcons name="account-plus" size={18} color={colors.blue} />
                <Text style={styles.detailActionText}>Add Member</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.detailActionButton}>
                <MaterialCommunityIcons name="pencil" size={18} color={colors.orange} />
                <Text style={styles.detailActionText}>Edit Circle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.blue}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>ThinQ Circles</Text>
            <Text style={styles.headerSubtitle}>Collaborate with your community</Text>
          </View>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Circle Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{circles.length}</Text>
            <Text style={styles.statLabel}>Circles</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {circles.reduce((acc, c) => acc + (c.memberCount || 0), 0)}
            </Text>
            <Text style={styles.statLabel}>Total Members</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {circles.filter(c => c.isOwner).length}
            </Text>
            <Text style={styles.statLabel}>You Own</Text>
          </View>
        </View>

        {/* Circles List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.blue} />
          </View>
        ) : circles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="circle-outline" size={64} color={colors.lightGray} />
            <Text style={styles.emptyTitle}>No Circles Yet</Text>
            <Text style={styles.emptyText}>Create your first circle to collaborate!</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Text style={styles.emptyButtonText}>Create Circle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.circlesContainer}>
            {circles.map((circle) => (
              <CircleCard key={circle.id} circle={circle} />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Create Circle Modal */}
      {showCreateModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Circle</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Circle Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Design Thinkers"
                placeholderTextColor={colors.lightGray}
                value={circleName}
                onChangeText={setCircleName}
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="What's this circle about?"
                placeholderTextColor={colors.lightGray}
                value={circleDescription}
                onChangeText={setCircleDescription}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, createCircleMutation.isPending && styles.submitButtonDisabled]}
              onPress={handleCreateCircle}
              disabled={createCircleMutation.isPending}
            >
              <Text style={styles.submitButtonText}>
                {createCircleMutation.isPending ? 'Creating...' : 'Create Circle'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Circle Detail Modal */}
      {selectedCircle && <CircleDetailModal circle={selectedCircle} />}
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
    backgroundColor: colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.blue,
  },
  statLabel: {
    fontSize: 10,
    color: colors.lightGray,
    marginTop: 4,
  },
  circlesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  circleCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.blue,
  },
  circleCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  circleBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  circleInfo: {
    flex: 1,
  },
  circleName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  circleDate: {
    fontSize: 11,
    color: colors.lightGray,
    marginTop: 2,
  },
  ownerBadge: {
    backgroundColor: colors.lightOrange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ownerText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.orange,
  },
  circleDescription: {
    fontSize: 12,
    color: colors.lightGray,
    lineHeight: 16,
    marginBottom: 10,
  },
  circleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTopWidth: 1,
    paddingTopColor: '#e0e0e0',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberCount: {
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
    color: colors.gray,
    marginTop: 8,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: colors.blue,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
    minHeight: 70,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.blue,
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
  detailModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  detailModalContent: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    fontFamily: typography.bold,
    flex: 1,
    textAlign: 'center',
  },
  detailModalScroll: {
    flex: 1,
  },
  detailSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  detailDescription: {
    fontSize: 13,
    color: colors.gray,
    lineHeight: 20,
  },
  memberCountBadge: {
    backgroundColor: colors.lightBlue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.blue,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.blue,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  memberEmail: {
    fontSize: 11,
    color: colors.gray,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    color: colors.gray,
  },
  detailActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 10,
  },
  detailActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    gap: 6,
  },
  detailActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
});
