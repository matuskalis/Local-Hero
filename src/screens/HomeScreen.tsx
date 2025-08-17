import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AchievementService } from '../services/AchievementService';
import { CustomModal } from '../components/CustomModal';

interface GoodDeed {
  id: string;
  description: string;
  date: string;
}

export const HomeScreen: React.FC = () => {
  const { currentTheme } = useTheme();
  const [dailyStreak, setDailyStreak] = useState(0);
  const [todayDeed, setTodayDeed] = useState<GoodDeed | null>(null);
  const [lastDeedDate, setLastDeedDate] = useState<string>('');
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null);

  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    try {
      const streak = await AsyncStorage.getItem('dailyStreak');
      const today = await AsyncStorage.getItem('todayDeed');
      const lastDate = await AsyncStorage.getItem('lastDeedDate');
      
      if (streak) {
        setDailyStreak(parseInt(streak));
      }
      
      if (today) {
        setTodayDeed(JSON.parse(today));
      }

      if (lastDate) {
        setLastDeedDate(lastDate);
      }

      await checkAndResetStreak();
    } catch (error) {
      console.error('Error loading streak data:', error);
    }
  };

  const checkAndResetStreak = async () => {
    try {
      const today = new Date().toDateString();
      const lastDate = await AsyncStorage.getItem('lastDeedDate');
      
      if (lastDate && lastDate !== today) {
        const lastDateObj = new Date(lastDate);
        const todayObj = new Date();
        const diffTime = Math.abs(todayObj.getTime() - lastDateObj.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
          await AsyncStorage.setItem('dailyStreak', '0');
          setDailyStreak(0);
        }
      }
    } catch (error) {
      console.error('Error checking streak reset:', error);
    }
  };

  const addTodayDeed = async () => {
    const today = new Date().toDateString();
    
    if (lastDeedDate === today) {
      // Allow appending more details to today's good deed without increasing the streak
      Alert.prompt(
        "Add More",
        "Add another kind thing you did today (will be appended to today's entry)",
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: async (extra) => {
              if (!extra || !extra.trim()) return;
              try {
                const current = todayDeed;
                if (!current) return;
                const appended: GoodDeed = {
                  ...current,
                  description: `${current.description}\n• ${extra.trim()}`,
                };
                await AsyncStorage.setItem('todayDeed', JSON.stringify(appended));
                setTodayDeed(appended);
                Alert.alert('Updated', "Added to today's good deed! ✨");
              } catch (e) {
                Alert.alert('Error', 'Failed to update today\'s good deed');
              }
            },
          },
        ],
        'plain-text'
      );
      return;
    }

    Alert.prompt(
      'Today\'s Good Deed',
      'What good thing did you do today?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (description) => {
            if (description && description.trim()) {
              const newDeed: GoodDeed = {
                id: Date.now().toString(),
                description: description.trim(),
                date: new Date().toISOString(),
              };
              
              try {
                await AsyncStorage.setItem('todayDeed', JSON.stringify(newDeed));
                await AsyncStorage.setItem('lastDeedDate', today);
                setTodayDeed(newDeed);
                setLastDeedDate(today);
                
                const newStreak = dailyStreak + 1;
                await AsyncStorage.setItem('dailyStreak', newStreak.toString());
                setDailyStreak(newStreak);

                // Persist in allGoodDeeds to maintain totals for achievements
                try {
                  const allDeedsRaw = await AsyncStorage.getItem('allGoodDeeds');
                  const allDeeds: GoodDeed[] = allDeedsRaw ? JSON.parse(allDeedsRaw) : [];
                  allDeeds.push(newDeed);
                  await AsyncStorage.setItem('allGoodDeeds', JSON.stringify(allDeeds));
                } catch {}
                
                // Check for achievements
                const goodDeedsCount = await getGoodDeedsCount();
                const newGoodDeedsCount = goodDeedsCount + 1;
                
                const newAchievements = await AchievementService.checkAndUpdateAchievements('good_deeds', newGoodDeedsCount);
                const streakAchievements = await AchievementService.checkAndUpdateAchievements('streak', newStreak);
                
                const allNewAchievements = [...newAchievements, ...streakAchievements];
                
                if (allNewAchievements.length > 0) {
                  setNewAchievement(allNewAchievements[0]);
                  setShowAchievementModal(true);
                }
                
                Alert.alert('Success', 'Good deed recorded! 🐝');
              } catch (error) {
                Alert.alert('Error', 'Failed to save good deed');
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const getGoodDeedsCount = async (): Promise<number> => {
    try {
      const allDeeds = await AsyncStorage.getItem('allGoodDeeds');
      if (allDeeds) {
        return JSON.parse(allDeeds).length;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <View style={styles.header}>
        <Text style={styles.logo}>🐝</Text>
        <Text style={[styles.title, { color: currentTheme.textColor }]}>Bee Good</Text>
        <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>Spreading kindness every day</Text>
      </View>
      
      <View style={[styles.streakCard, { backgroundColor: currentTheme.cardColor }]}>
        <Text style={[styles.streakTitle, { color: currentTheme.textColor }]}>Daily Streak</Text>
        <Text style={[styles.streakNumber, { color: currentTheme.accentColor }]}>{dailyStreak}</Text>
        <Text style={[styles.streakText, { color: currentTheme.textColor }]}>days of kindness</Text>
      </View>
      
      <View style={[styles.todayCard, { backgroundColor: currentTheme.cardColor }]}>
        <Text style={[styles.todayTitle, { color: currentTheme.textColor }]}>Today's Good Deed</Text>
        {todayDeed ? (
          <View style={styles.deedContainer}>
            <Text style={[styles.deedText, { color: currentTheme.textColor }]}>"{todayDeed.description}"</Text>
            <Text style={[styles.deedTime, { color: currentTheme.textColor }]}>
              {new Date(todayDeed.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ) : (
          <TouchableOpacity style={[styles.addButton, { backgroundColor: currentTheme.accentColor }]} onPress={addTodayDeed}>
            <Text style={styles.addButtonText}>+ Add Today's Good Deed</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={[styles.bottomCard, { backgroundColor: currentTheme.cardColor }]}>
        <Text style={[styles.bottomTitle, { color: currentTheme.textColor }]}>Keep the streak alive!</Text>
        <Text style={[styles.bottomText, { color: currentTheme.textColor }]}>
          Every good deed counts. Come back tomorrow to continue your journey of kindness.
        </Text>
      </View>

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
    fontSize: 16,
    color: '#666',
  },
  streakCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  streakTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 8,
  },
  streakText: {
    fontSize: 16,
    color: '#333',
  },
  todayCard: {
    backgroundColor: '#FFFFFF',
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
  todayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deedContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  deedText: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  deedTime: {
    fontSize: 14,
    color: '#666',
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  bottomText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
}); 