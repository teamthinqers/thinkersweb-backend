import { View, Text, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface BadgeProps {
  name: string;
  description: string;
  icon?: string;
  iconUrl?: string;
  earned?: boolean;
  size?: 'small' | 'large';
}

export function Badge({ name, description, icon, iconUrl, earned = true, size = 'small' }: BadgeProps) {
  const badgeSize = size === 'large' ? 80 : 48;
  const iconSize = size === 'large' ? 40 : 24;

  return (
    <View style={[styles.container, !earned && styles.locked]}>
      <View style={[styles.iconContainer, { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 }]}>
        {iconUrl ? (
          <Image source={{ uri: iconUrl }} style={[styles.icon, { width: iconSize, height: iconSize }]} />
        ) : (
          <Feather name={(icon as any) || 'award'} size={iconSize} color={earned ? colors.primary[500] : colors.gray[400]} />
        )}
      </View>
      <Text style={[styles.name, !earned && styles.lockedText]}>{name}</Text>
      {size === 'large' && (
        <Text style={[styles.description, !earned && styles.lockedText]}>{description}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 12,
  },
  locked: {
    opacity: 0.5,
  },
  iconContainer: {
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    resizeMode: 'contain',
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[900],
    textAlign: 'center',
  },
  description: {
    fontSize: 11,
    color: colors.gray[600],
    textAlign: 'center',
    marginTop: 4,
  },
  lockedText: {
    color: colors.gray[400],
  },
});
