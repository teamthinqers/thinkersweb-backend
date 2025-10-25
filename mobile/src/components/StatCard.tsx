import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from './Card';
import { colors } from '../theme/colors';

interface StatCardProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: number;
  color: string;
}

export function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <Card style={styles.container} borderColor={color} borderWidth={3}>
      <Feather name={icon} size={28} color={color} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '47%',
    alignItems: 'center',
    padding: 16,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 4,
  },
});
