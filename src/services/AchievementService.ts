import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement, defaultAchievements } from '../types';

export class AchievementService {
  static async loadAchievements(): Promise<Achievement[]> {
    try {
      const savedAchievements = await AsyncStorage.getItem('achievements');
      if (savedAchievements) {
        return JSON.parse(savedAchievements);
      }
      return defaultAchievements;
    } catch (error) {
      console.error('Error loading achievements:', error);
      return defaultAchievements;
    }
  }

  static async saveAchievements(achievements: Achievement[]): Promise<void> {
    try {
      await AsyncStorage.setItem('achievements', JSON.stringify(achievements));
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }

  static async checkAndUpdateAchievements(
    type: 'good_deeds' | 'streak' | 'gratitude' | 'quotes' | 'special',
    count: number
  ): Promise<Achievement[]> {
    try {
      const achievements = await this.loadAchievements();
      const updatedAchievements = [...achievements];
      let newUnlocked: Achievement[] = [];

      // Check achievements for the given type
      updatedAchievements.forEach((achievement) => {
        if (achievement.category === type && !achievement.unlocked && count >= achievement.requirement) {
          achievement.unlocked = true;
          achievement.unlockedDate = new Date().toISOString();
          newUnlocked.push(achievement);
        }
      });

      if (newUnlocked.length > 0) {
        await this.saveAchievements(updatedAchievements);
      }

      return newUnlocked;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  static async unlockSpecialAchievement(achievementId: string): Promise<Achievement | null> {
    try {
      const achievements = await this.loadAchievements();
      const achievement = achievements.find(a => a.id === achievementId);
      
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedDate = new Date().toISOString();
        await this.saveAchievements(achievements);
        return achievement;
      }
      
      return null;
    } catch (error) {
      console.error('Error unlocking special achievement:', error);
      return null;
    }
  }

  static async getUnlockedAchievements(): Promise<Achievement[]> {
    try {
      const achievements = await this.loadAchievements();
      return achievements.filter(a => a.unlocked);
    } catch (error) {
      console.error('Error getting unlocked achievements:', error);
      return [];
    }
  }

  static async getAchievementProgress(type: 'good_deeds' | 'streak' | 'gratitude' | 'quotes'): Promise<number> {
    try {
      const achievements = await this.loadAchievements();
      const typeAchievements = achievements.filter(a => a.category === type);
      const unlockedCount = typeAchievements.filter(a => a.unlocked).length;
      return unlockedCount;
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return 0;
    }
  }
} 