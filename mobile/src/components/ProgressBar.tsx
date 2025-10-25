import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({ value, color = colors.primary[500], height = 8, showLabel = true }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.bar, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(100, Math.max(0, value))}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color }]}>
          {Math.round(value)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  bar: {
    backgroundColor: colors.gray[100],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  fill: {
    borderRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
});
