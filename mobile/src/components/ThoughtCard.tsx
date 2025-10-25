import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from './Card';
import { Avatar } from './Avatar';
import { colors } from '../theme/colors';

interface ThoughtCardProps {
  thought: {
    id: number;
    heading: string;
    summary: string;
    contributorType: string;
    guestName?: string;
    guestLinkedInUrl?: string;
    user?: {
      fullName: string;
      linkedinPhotoUrl?: string;
    };
  };
  onAvatarPress?: () => void;
  onSpark?: () => void;
  onPerspective?: () => void;
  showActions?: boolean;
}

export function ThoughtCard({ thought, onAvatarPress, onSpark, onPerspective, showActions = true }: ThoughtCardProps) {
  const contributorName = thought.contributorType === 'guest'
    ? thought.guestName || 'Guest Contributor'
    : thought.user?.fullName || 'Anonymous';

  return (
    <Card borderColor={colors.orange[600]} borderWidth={4} style={styles.card}>
      {/* Author Info */}
      <View style={styles.authorRow}>
        <Avatar
          name={contributorName}
          imageUrl={thought.user?.linkedinPhotoUrl}
          size={40}
          onPress={onAvatarPress}
          backgroundColor={colors.orange[100]}
        />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{contributorName}</Text>
          {thought.contributorType === 'guest' && (
            <Text style={styles.guestBadge}>Guest</Text>
          )}
        </View>
        {thought.guestLinkedInUrl && (
          <TouchableOpacity style={styles.linkedInIcon} onPress={onAvatarPress}>
            <Feather name="linkedin" size={18} color="#0077b5" />
          </TouchableOpacity>
        )}
      </View>

      {/* Thought Content */}
      <Text style={styles.heading}>{thought.heading}</Text>
      <Text style={styles.summary} numberOfLines={3}>
        {thought.summary}
      </Text>

      {/* Actions */}
      {showActions && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={onSpark}>
            <Feather name="zap" size={16} color={colors.primary[500]} />
            <Text style={styles.actionText}>Spark</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onPerspective}>
            <Feather name="eye" size={16} color={colors.cyan[500]} />
            <Text style={styles.actionText}>Perspective</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  guestBadge: {
    fontSize: 12,
    color: colors.orange[600],
    marginTop: 2,
  },
  linkedInIcon: {
    padding: 4,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 8,
  },
  summary: {
    fontSize: 14,
    color: colors.gray[600],
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
    backgroundColor: colors.primary[50],
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[700],
  },
});
