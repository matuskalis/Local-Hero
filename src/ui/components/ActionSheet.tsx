import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleActionPress = useCallback((action: ActionSheetAction) => {
    // Close modal and execute action
    handleClose();
    action.onPress();
  }, [handleClose]);

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.content}>
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
                <TouchableOpacity
                  key={index}
                  style={[styles.primaryButton, styles.actionButton]}
                  onPress={() => handleActionPress(action)}
                  accessibilityLabel={action.title}
                  accessibilityRole="button"
                >
                  {action.icon && (
                    <Ionicons 
                      name={action.icon} 
                      size={24} 
                      color="white" 
                      style={styles.actionIcon}
                    />
                  )}
                  <Text style={styles.primaryButtonText}>{action.title}</Text>
                </TouchableOpacity>
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
                      color="#E53E3E" 
                      style={styles.actionIcon}
                    />
                  )}
                  <Text style={styles.destructiveButtonText}>{action.title}</Text>
                </TouchableOpacity>
              );
            } else {
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.secondaryButton, styles.actionButton]}
                  onPress={() => handleActionPress(action)}
                  accessibilityLabel={action.title}
                  accessibilityRole="button"
                >
                  {action.icon && (
                    <Ionicons 
                      name={action.icon} 
                      size={24} 
                      color="#2BB673" 
                      style={styles.actionIcon}
                    />
                  )}
                  <Text style={styles.secondaryButtonText}>{action.title}</Text>
                </TouchableOpacity>
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
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 18,
    color: '#4D4D4D',
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: 16,
    marginBottom: 24,
  },
  actionButton: {
    marginHorizontal: 0,
  },
  primaryButton: {
    backgroundColor: '#2BB673',
    borderRadius: 25,
    minHeight: 60,
    paddingHorizontal: 32,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2BB673',
    borderRadius: 25,
    minHeight: 60,
    paddingHorizontal: 32,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2BB673',
    textAlign: 'center',
  },
  destructiveButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E53E3E',
    borderRadius: 25,
    minHeight: 60,
    paddingHorizontal: 32,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E53E3E',
    textAlign: 'center',
  },
  actionIcon: {
    marginRight: 12,
  },
  cancelSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 24,
  },
  cancelButton: {
    paddingVertical: 20,
    alignItems: 'center',
    minHeight: 44,
  },
  cancelButtonText: {
    fontSize: 18,
    color: '#4D4D4D',
    fontWeight: '600',
  },
});
