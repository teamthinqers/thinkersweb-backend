import { View, StyleSheet, ViewStyle } from 'react-native';
import { ReactNode } from 'react';
import { colors } from '../theme/colors';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  borderColor?: string;
  borderWidth?: number;
  gradient?: boolean;
}

export function Card({ children, style, borderColor, borderWidth = 0, gradient = false }: CardProps) {
  return (
    <View 
      style={[
        styles.card,
        gradient && styles.gradientCard,
        { borderLeftWidth: borderWidth, borderLeftColor: borderColor },
        style
      ]}
    >
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  gradientCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
});
