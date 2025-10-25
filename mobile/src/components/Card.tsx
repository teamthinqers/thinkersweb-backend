import { View, StyleSheet, ViewStyle } from 'react-native';
import { ReactNode } from 'react';
import { colors } from '../theme/colors';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  borderColor?: string;
  borderWidth?: number;
}

export function Card({ children, style, borderColor, borderWidth = 0 }: CardProps) {
  return (
    <View style={[styles.card, { borderLeftWidth: borderWidth, borderLeftColor: borderColor }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
