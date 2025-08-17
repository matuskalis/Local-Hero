import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal,TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttons: Array<{
    text: string;
    onPress: () => void;
    style?: 'primary' | 'secondary' | 'destructive';
  }>;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  message,
  buttons,
}) => {
  const { currentTheme } = useTheme();
  const messageWithNewlines = message.replace(/\\n/g, '\n');
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.modalContainer, { backgroundColor: currentTheme.cardColor }] }>
              <View style={styles.modalContent}>
                <Text style={[styles.modalTitle, { color: currentTheme.textColor }]}>{title}</Text>
                <Text style={[styles.modalMessage, { color: currentTheme.textColor }]}>{messageWithNewlines}</Text>
                
                <View style={styles.buttonContainer}>
                  {buttons.map((button, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.modalButton,
                        button.style === 'primary' && [styles.primaryButton, { backgroundColor: currentTheme.accentColor, borderColor: currentTheme.accentColor }],
                        button.style === 'secondary' && styles.secondaryButton,
                        button.style === 'destructive' && styles.destructiveButton,
                      ]}
                      onPress={button.onPress}
                    >
                      <Text style={[
                        styles.buttonText,
                        button.style === 'primary' && styles.primaryButtonText,
                        button.style === 'secondary' && styles.secondaryButtonText,
                        button.style === 'destructive' && styles.destructiveButtonText,
                      ]}>
                        {button.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#ddd',
  },
  destructiveButton: {
    backgroundColor: 'transparent',
    borderColor: '#ff4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#666',
  },
  destructiveButtonText: {
    color: '#ff4444',
  },
}); 