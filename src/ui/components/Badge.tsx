import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../theme';

interface BadgeProps {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'medium',
  style,
  textStyle,
}) => {
  const badgeStyle = [
    styles.base,
    styles[variant],
    styles[size],
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    textStyle,
  ];

  return (
    <View style={badgeStyle}>
      <Text style={textStyleCombined} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  default: {
    backgroundColor: theme.colors.borderLight,
  },
  success: {
    backgroundColor: theme.colors.accentMuted,
  },
  warning: {
    backgroundColor: '#FFF7E6',
  },
  error: {
    backgroundColor: '#FEE7E7',
  },
  info: {
    backgroundColor: '#EFF6FF',
  },
  small: {
    paddingVertical: theme.spacing.xs,
    minHeight: 24,
  },
  medium: {
    paddingVertical: theme.spacing.sm,
    minHeight: 32,
  },
  large: {
    paddingVertical: theme.spacing.md,
    minHeight: 40,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  defaultText: {
    color: theme.colors.textSecondary,
  },
  successText: {
    color: theme.colors.accentDark,
  },
  warningText: {
    color: '#B45309',
  },
  errorText: {
    color: '#DC2626',
  },
  infoText: {
    color: '#1D4ED8',
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
});
