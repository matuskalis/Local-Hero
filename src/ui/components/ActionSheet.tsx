import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme';
import { PrimaryButton, SecondaryButton } from './index';

const { height: screenHeight } = Dimensions.get('window');

export interface ActionSheetAction {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface ActionSheetProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  actions: ActionSheetAction[];
  showCancel?: boolean;
  cancelTitle?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  isVisible,
  onClose,
  title,
  message,
  actions,
  showCancel = true,
  cancelTitle = 'Cancel',
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '75%'], []);

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
    onClose();
  }, [onClose]);

  const handleActionPress = useCallback((action: ActionSheetAction) => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Close sheet and execute action
    handleClose();
    action.onPress();
  }, [handleClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    []
  );

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  // Auto-open when visible
  React.useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {actions.map((action, index) => {
            if (action.variant === 'primary') {
              return (
                <PrimaryButton
                  key={index}
                  title={action.title}
                  onPress={() => handleActionPress(action)}
                  fullWidth
                  style={styles.actionButton}
                />
              );
            } else if (action.variant === 'destructive') {
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.destructiveButton, styles.actionButton]}
                  onPress={() => handleActionPress(action)}
                  accessibilityLabel={action.title}
                  accessibilityRole="button"
                >
                  {action.icon && (
                    <Ionicons 
                      name={action.icon} 
                      size={24} 
                      color={theme.colors.error} 
                      style={styles.actionIcon}
                    />
                  )}
                  <Text style={styles.destructiveButtonText}>{action.title}</Text>
                </TouchableOpacity>
              );
            } else {
              return (
                <SecondaryButton
                  key={index}
                  title={action.title}
                  onPress={() => handleActionPress(action)}
                  fullWidth
                  style={styles.actionButton}
                />
              );
            }
          })}
        </View>

        {/* Cancel Button */}
        {showCancel && (
          <View style={styles.cancelSection}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              accessibilityLabel={cancelTitle}
              accessibilityRole="button"
            >
              <Text style={styles.cancelButtonText}>{cancelTitle}</Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  handleIndicator: {
    backgroundColor: theme.colors.border,
    width: 40,
    height: 4,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    marginHorizontal: 0,
  },
  destructiveButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.error,
    borderRadius: theme.borderRadius.pill,
    minHeight: 60,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveButtonText: {
    ...theme.typography.button,
    color: theme.colors.error,
    textAlign: 'center',
  },
  actionIcon: {
    marginRight: theme.spacing.sm,
  },
  cancelSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: theme.spacing.lg,
  },
  cancelButton: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    minHeight: 44,
  },
  cancelButtonText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
});
