import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AchievementService } from '../services/AchievementService';
import { CustomModal } from '../components/CustomModal';

interface GratitudeEntry {
  id: string;
  content: string;
  date: string;
}

export const GratitudeScreen: React.FC = () => {
  const { currentTheme } = useTheme();
  const [gratitudes, setGratitudes] = useState<GratitudeEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGratitude, setNewGratitude] = useState('');
  const [showInitialPrompt, setShowInitialPrompt] = useState(true);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null);

  useEffect(() => {
    loadGratitudes();
    checkTodayGratitude();
  }, []);

  useEffect(() => {
    // Check theme usage achievement when user explores themes
    const checkThemeExplorer = async () => {
      try {
        const selectedTheme = await AsyncStorage.getItem('selectedThemeHistory');
        if (selectedTheme) {
          const used = JSON.parse(selectedTheme) as string[];
          if (used.length >= 3) {
            await AchievementService.unlockSpecialAchievement('theme_explorer');
          }
        }
      } catch {}
    };
    checkThemeExplorer();
  }, []);

  const loadGratitudes = async () => {
    try {
      const storedGratitudes = await AsyncStorage.getItem('gratitudes');
      if (storedGratitudes) {
        setGratitudes(JSON.parse(storedGratitudes));
      }
    } catch (error) {
      console.error('Error loading gratitudes:', error);
    }
  };

  const checkTodayGratitude = async () => {
    try {
      const storedGratitudes = await AsyncStorage.getItem('gratitudes');
      if (storedGratitudes) {
        const gratitudeEntries = JSON.parse(storedGratitudes);
        const today = new Date().toDateString();
        const hasTodayGratitude = gratitudeEntries.some((entry: GratitudeEntry) => 
          new Date(entry.date).toDateString() === today
        );
        setShowInitialPrompt(!hasTodayGratitude);
      }
    } catch (error) {
      console.error('Error checking today gratitude:', error);
    }
  };

  const addGratitude = async () => {
    if (newGratitude.trim()) {
      const newEntry: GratitudeEntry = {
        id: Date.now().toString(),
        content: newGratitude.trim(),
        date: new Date().toISOString(),
      };
      try {
        const updatedGratitudes = [newEntry, ...gratitudes];
        await AsyncStorage.setItem('gratitudes', JSON.stringify(updatedGratitudes));
        setGratitudes(updatedGratitudes);
        setNewGratitude('');
        setModalVisible(false);
        setShowInitialPrompt(false);
        
        // Check for achievements
        const gratitudeDays = await getGratitudeDays();
        const newAchievements = await AchievementService.checkAndUpdateAchievements('gratitude', gratitudeDays);
        
        if (newAchievements.length > 0) {
          setNewAchievement(newAchievements[0]);
          setShowAchievementModal(true);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to save gratitude');
      }
    }
  };

  const showGratitudePrompt = () => {
    Alert.prompt(
      'Daily Gratitude',
      'What are you grateful for today?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (content) => {
            if (content && content.trim()) {
              const newEntry: GratitudeEntry = {
                id: Date.now().toString(),
                content: content.trim(),
                date: new Date().toISOString(),
              };
              try {
                const updatedGratitudes = [newEntry, ...gratitudes];
                await AsyncStorage.setItem('gratitudes', JSON.stringify(updatedGratitudes));
                setGratitudes(updatedGratitudes);
                setShowInitialPrompt(false);
                Alert.alert('Success', 'Gratitude recorded! 🙏');
              } catch (error) {
                Alert.alert('Error', 'Failed to save gratitude');
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const renderGratitude = ({ item }: { item: GratitudeEntry }) => (
    <View style={styles.gratitudeCard}>
      <View style={styles.gratitudeHeader}>
        <Text style={styles.gratitudeIcon}>🙏</Text>
        <Text style={styles.gratitudeDate}>
          {new Date(item.date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </View>
      <Text style={styles.gratitudeText}>{item.content}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <View style={styles.header}>
        <Text style={styles.logo}>🐝</Text>
        <Text style={[styles.title, { color: currentTheme.textColor }]}>Bee Good</Text>
        <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>Practice gratitude and develop a positive outlook on life</Text>
      </View>
      
      {showInitialPrompt && (
        <View style={[styles.promptCard, { backgroundColor: currentTheme.cardColor }]}>
          <Text style={[styles.promptTitle, { color: currentTheme.textColor }]}>Daily Gratitude Practice</Text>
          <Text style={[styles.promptText, { color: currentTheme.textColor }]}>
            Take a moment to reflect on what you're grateful for today.
          </Text>
          <TouchableOpacity style={[styles.promptButton, { backgroundColor: currentTheme.accentColor }]} onPress={showGratitudePrompt}>
            <Text style={styles.promptButtonText}>Share Your Gratitude</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <FlatList
        data={gratitudes}
        renderItem={renderGratitude}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🙏</Text>
            <Text style={styles.emptyText}>
              No gratitude entries yet.{'\n'}
              Start your gratitude journey today!
            </Text>
          </View>
        }
      />
      
      <TouchableOpacity style={[styles.fab, { backgroundColor: currentTheme.accentColor }]} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentTheme.cardColor }] }>
            <Text style={[styles.modalTitle, { color: currentTheme.textColor }]}>Add Gratitude</Text>
            <TextInput
              style={styles.input}
              placeholder="What are you grateful for today?"
              value={newGratitude}
              onChangeText={setNewGratitude}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton, { backgroundColor: currentTheme.accentColor }]}
                onPress={addGratitude}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomModal
        visible={showAchievementModal}
        onClose={() => setShowAchievementModal(false)}
        title={`🏆 Achievement Unlocked!`}
        message={`Congratulations! You've earned the "${newAchievement?.name}" achievement!\n\n${newAchievement?.description}`}
        buttons={[
          { text: 'Awesome!', onPress: () => setShowAchievementModal(false), style: 'primary' },
        ]}
      />
    </View>
  );
};

const getGratitudeDays = async (): Promise<number> => {
  try {
    const storedGratitudes = await AsyncStorage.getItem('gratitudes');
    if (storedGratitudes) {
      const gratitudeEntries = JSON.parse(storedGratitudes);
      const uniqueDays = new Set();
      gratitudeEntries.forEach((entry: GratitudeEntry) => {
        uniqueDays.add(new Date(entry.date).toDateString());
      });
      return uniqueDays.size;
    }
    return 0;
  } catch (error) {
    return 0;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDEFF2',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  promptCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  promptText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  promptButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  promptButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  gratitudeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gratitudeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  gratitudeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  gratitudeDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  gratitudeText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#FF6B9D',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});