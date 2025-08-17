import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Achievement, defaultAchievements } from '../types';
import { AchievementService } from '../services/AchievementService';
import { AchievementBadge } from '../components/AchievementBadge';
import { useTheme } from '../context/ThemeContext';

type Category = 'all' | 'streak' | 'good_deeds' | 'gratitude' | 'quotes' | 'special';

export const AchievementsScreen: React.FC = () => {
  const { currentTheme } = useTheme();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const loadedAchievements = await AchievementService.loadAchievements();
    setAchievements(loadedAchievements);
    setUnlockedCount(loadedAchievements.filter(a => a.unlocked).length);
  };

  const getFilteredAchievements = () => {
    if (selectedCategory === 'all') {
      return achievements;
    }
    return achievements.filter(a => a.category === selectedCategory);
  };

  const getCategoryStats = (category: Category) => {
    if (category === 'all') {
      return {
        total: achievements.length,
        unlocked: achievements.filter(a => a.unlocked).length,
      };
    }
    const categoryAchievements = achievements.filter(a => a.category === category);
    return {
      total: categoryAchievements.length,
      unlocked: categoryAchievements.filter(a => a.unlocked).length,
    };
  };

  const categories: { key: Category; name: string; icon: string }[] = [
    { key: 'all', name: 'All', icon: '🏆' },
    { key: 'streak', name: 'Streaks', icon: '🔥' },
    { key: 'good_deeds', name: 'Good Deeds', icon: '🌟' },
    { key: 'gratitude', name: 'Gratitude', icon: '🙏' },
    { key: 'quotes', name: 'Quotes', icon: '💭' },
    { key: 'special', name: 'Special', icon: '⭐' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <View style={styles.header}>
        <Text style={styles.logo}>🐝</Text>
        <Text style={[styles.title, { color: currentTheme.textColor }]}>Bee Good</Text>
        <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>Achievements</Text>
      </View>

      <View style={[styles.statsCard, { backgroundColor: currentTheme.cardColor }]}>
        <Text style={[styles.statsTitle, { color: currentTheme.textColor }]}>Progress</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: currentTheme.accentColor }]}>{unlockedCount}</Text>
            <Text style={[styles.statLabel, { color: currentTheme.textColor }]}>Unlocked</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: currentTheme.accentColor }]}>{achievements.length}</Text>
            <Text style={[styles.statLabel, { color: currentTheme.textColor }]}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: currentTheme.accentColor }]}>
              {Math.round((unlockedCount / achievements.length) * 100)}%
            </Text>
            <Text style={[styles.statLabel, { color: currentTheme.textColor }]}>Complete</Text>
          </View>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => {
            const stats = getCategoryStats(category.key);
            return (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryButton,
                  { backgroundColor: currentTheme.cardColor },
                  selectedCategory === category.key && { borderColor: currentTheme.accentColor, borderWidth: 2 }
                ]}
                onPress={() => setSelectedCategory(category.key)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[styles.categoryName, { color: currentTheme.textColor }]}>{category.name}</Text>
                <Text style={[styles.categoryStats, { color: currentTheme.accentColor }]}>
                  {stats.unlocked}/{stats.total}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.achievementsContainer} showsVerticalScrollIndicator={false}>
        {getFilteredAchievements().map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            showAnimation={false}
          />
        ))}
        
        {getFilteredAchievements().length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={[styles.emptyTitle, { color: currentTheme.textColor }]}>No achievements yet</Text>
            <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
              Keep using the app to unlock achievements!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
  },
  statsCard: {
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
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    alignItems: 'center',
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryStats: {
    fontSize: 12,
    fontWeight: '600',
  },
  achievementsContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
}); 