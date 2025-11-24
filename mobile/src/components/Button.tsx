import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { colors, gradients } from '../theme/colors';
import { typography } from '../theme/typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: ReactNode;
}

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const isGradient = variant === 'primary' || variant === 'danger';
  const gradientColors = variant === 'danger' ? [colors.red[600], colors.red[700]] : gradients.primary;

  const buttonStyle = [
    styles.base,
    styles[size],
    !isGradient && styles[variant],
    disabled && styles.disabled,
    style,
  ];

  const textStyleArray = [
    styles.text,
    styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}`],
    styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    textStyle,
  ];

  const content = (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={buttonStyle}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={textStyleArray}>{children}</Text>
    </TouchableOpacity>
  );

  if (isGradient && !disabled) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.base, styles[size], style]}
      >
        {content}
      </LinearGradient>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
    overflow: 'hidden',
  },

  // Sizes
  sm: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  lg: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary[600],
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  secondary: {
    backgroundColor: colors.gray[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary[600],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    shadowColor: colors.red[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  disabled: {
    opacity: 0.5,
  },

  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textSm: {
    fontSize: typography.sizes.sm,
  },
  textMd: {
    fontSize: typography.sizes.base,
  },
  textLg: {
    fontSize: typography.sizes.lg,
  },
  textPrimary: {
    color: '#fff',
  },
  textSecondary: {
    color: colors.gray[700],
  },
  textOutline: {
    color: colors.primary[600],
  },
  textGhost: {
    color: colors.primary[600],
  },
  textDanger: {
    color: '#fff',
  },

  icon: {
    fontSize: 18,
  },
});
