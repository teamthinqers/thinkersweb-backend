import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type CircleDetailProps = {
  circleId: number;
  onBack: () => void;
};

export default function CircleDetailScreen({ circleId, onBack }: CircleDetailProps) {
  const { user } = useAuth();

  const { data: circleData, isLoading } = useQuery<{
    success: boolean;
    circle: {
      id: number;
      name: string;
      description?: string;
      createdBy: number;
      members: Array<{
        id: number;
        user: {
          id: number;
          fullName: string;
          linkedinPhotoUrl?: string;
          avatar?: string;
        };
      }>;
      stats: {
        dots: number;
        sparks: number;
        members: number;
      };
    };
  }>({
    queryKey: [`/api/thinq-circles/${circleId}`],
    enabled: !!circleId && !!user,
  });

  const { data: thoughtsData, isLoading: thoughtsLoading } = useQuery<{
    thoughts: any[];
  }>({
    queryKey: [`/api/thinq-circles/${circleId}/thoughts`],
    enabled: !!circleId && !!user,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Loading circle...</Text>
      </View>
    );
  }

  const circle = circleData?.circle;
  const thoughts = thoughtsData?.thoughts || [];

  if (!circle) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={64} color={colors.error} />
        <Text style={styles.errorText}>Circle not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backIconButton}>
          <Feather name="arrow-left" size={24} color={colors.primary[600]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{circle.name}</Text>
      </View>

      {/* Circle Info */}
      <Card style={styles.infoCard}>
        <View style={styles.circleIcon}>
          <Feather name="hexagon" size={32} color="#fff" />
        </View>
        
        {circle.description && (
          <Text style={styles.description}>{circle.description}</Text>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Feather name="circle" size={20} color={colors.primary[500]} />
            <Text style={styles.statValue}>{circle.stats.dots}</Text>
            <Text style={styles.statLabel}>Dots</Text>
          </View>
          <View style={styles.statItem}>
            <Feather name="zap" size={20} color={colors.primary[500]} />
            <Text style={styles.statValue}>{circle.stats.sparks}</Text>
            <Text style={styles.statLabel}>Sparks</Text>
          </View>
          <View style={styles.statItem}>
            <Feather name="users" size={20} color={colors.primary[500]} />
            <Text style={styles.statValue}>{circle.stats.members}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
        </View>
      </Card>

      {/* Members */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Members</Text>
        <Card>
          <View style={styles.membersGrid}>
            {circle.members.slice(0, 6).map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <Avatar
                  name={member.user.fullName}
                  imageUrl={member.user.linkedinPhotoUrl || member.user.avatar}
                  size={40}
                />
                <Text style={styles.memberName} numberOfLines={1}>
                  {member.user.fullName.split(' ')[0]}
                </Text>
              </View>
            ))}
          </View>
          {circle.members.length > 6 && (
            <Text style={styles.moreMembers}>
              +{circle.members.length - 6} more members
            </Text>
          )}
        </Card>
      </View>

      {/* Thoughts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Circle Thoughts</Text>
        {thoughtsLoading ? (
          <Card style={styles.loadingCard}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
          </Card>
        ) : thoughts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Feather name="message-circle" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No thoughts shared yet</Text>
          </Card>
        ) : (
          <Card>
            <Text style={styles.thoughtsCount}>{thoughts.length} thoughts shared</Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.circles,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.circles,
  },
  loadingText: {
    marginTop: 12,
    fontSize: typography.sizes.base,
    color: colors.primary[900],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.circles,
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.error,
  },
  backButton: {
    marginTop: 24,
    backgroundColor: colors.primary[600],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  backIconButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary[900],
    flex: 1,
  },
  infoCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  circleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: typography.sizes.base,
    color: colors.gray[700],
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.gray[900],
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.gray[600],
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.primary[900],
    marginBottom: 12,
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  memberItem: {
    alignItems: 'center',
    width: 60,
  },
  memberName: {
    fontSize: typography.sizes.xs,
    color: colors.gray[700],
    marginTop: 6,
    textAlign: 'center',
  },
  moreMembers: {
    marginTop: 16,
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
    textAlign: 'center',
  },
  loadingCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: typography.sizes.base,
    color: colors.gray[600],
  },
  thoughtsCount: {
    fontSize: typography.sizes.base,
    color: colors.gray[700],
    textAlign: 'center',
    paddingVertical: 16,
  },
});
