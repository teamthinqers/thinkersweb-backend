import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Feather } from '@expo/vector-icons';

interface Thought {
  id: number;
  heading: string;
  summary: string;
  createdAt: string;
  user: {
    fullName: string | null;
    avatar: string | null;
  };
}

export default function SocialFeedScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: thoughts, isLoading, refetch } = useQuery({
    queryKey: ['thoughts'],
    queryFn: async () => {
      const response = await api.get('/thoughts?limit=50');
      return response.data as Thought[];
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderThought = ({ item }: { item: Thought }) => (
    <TouchableOpacity style={styles.thoughtCard} activeOpacity={0.7}>
      <View style={styles.thoughtHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.user.fullName?.[0]?.toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.thoughtInfo}>
          <Text style={styles.userName}>{item.user.fullName || 'Anonymous'}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Text style={styles.thoughtHeading}>{item.heading}</Text>
      <Text style={styles.thoughtSummary} numberOfLines={3}>
        {item.summary}
      </Text>
      <View style={styles.thoughtActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="message-circle" size={18} color="#6b7280" />
          <Text style={styles.actionText}>Perspective</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="bookmark" size={18} color="#6b7280" />
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading thoughts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={thoughts}
        renderItem={renderThought}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f59e0b']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No thoughts yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  thoughtCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  thoughtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  thoughtInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  thoughtHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  thoughtSummary: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  thoughtActions: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});
