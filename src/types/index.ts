export interface User {
  id: string;
  email?: string;
  created_at: string;
}

export interface Theme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  accentColor: string;
  gradient?: {
    start: string;
    end: string;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'good_deeds' | 'gratitude' | 'quotes' | 'special';
  requirement: number;
  unlocked: boolean;
  unlockedDate?: string;
}

export const defaultAchievements: Achievement[] = [
  // Streak Achievements
  {
    id: 'first_deed',
    name: 'First Step',
    description: 'Complete your first good deed',
    icon: '🌟',
    category: 'good_deeds',
    requirement: 1,
    unlocked: false,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    category: 'streak',
    requirement: 7,
    unlocked: false,
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    category: 'streak',
    requirement: 30,
    unlocked: false,
  },
  {
    id: 'streak_100',
    name: 'Century Champion',
    description: 'Maintain a 100-day streak',
    icon: '💎',
    category: 'streak',
    requirement: 100,
    unlocked: false,
  },
  
  // Good Deeds Achievements
  {
    id: 'deeds_10',
    name: 'Kind Beginner',
    description: 'Complete 10 good deeds',
    icon: '🌱',
    category: 'good_deeds',
    requirement: 10,
    unlocked: false,
  },
  {
    id: 'deeds_50',
    name: 'Kind Helper',
    description: 'Complete 50 good deeds',
    icon: '🌿',
    category: 'good_deeds',
    requirement: 50,
    unlocked: false,
  },
  {
    id: 'deeds_100',
    name: 'Kind Hero',
    description: 'Complete 100 good deeds',
    icon: '🌳',
    category: 'good_deeds',
    requirement: 100,
    unlocked: false,
  },
  {
    id: 'deeds_500',
    name: 'Kind Legend',
    description: 'Complete 500 good deeds',
    icon: '🏆',
    category: 'good_deeds',
    requirement: 500,
    unlocked: false,
  },
  
  // Gratitude Achievements
  {
    id: 'gratitude_7',
    name: 'Grateful Heart',
    description: 'Practice gratitude for 7 days',
    icon: '🙏',
    category: 'gratitude',
    requirement: 7,
    unlocked: false,
  },
  {
    id: 'gratitude_30',
    name: 'Gratitude Guru',
    description: 'Practice gratitude for 30 days',
    icon: '💝',
    category: 'gratitude',
    requirement: 30,
    unlocked: false,
  },
  
  // Quote Achievements
  {
    id: 'first_quote',
    name: 'Quote Collector',
    description: 'Save your first quote',
    icon: '💭',
    category: 'quotes',
    requirement: 1,
    unlocked: false,
  },
  {
    id: 'quotes_10',
    name: 'Quote Enthusiast',
    description: 'Save 10 quotes',
    icon: '📚',
    category: 'quotes',
    requirement: 10,
    unlocked: false,
  },
  {
    id: 'quotes_50',
    name: 'Quote Master',
    description: 'Save 50 quotes',
    icon: '📖',
    category: 'quotes',
    requirement: 50,
    unlocked: false,
  },
  
  // Special Achievements
  {
    id: 'theme_explorer',
    name: 'Theme Explorer',
    description: 'Try 3 different themes',
    icon: '🎨',
    category: 'special',
    requirement: 3,
    unlocked: false,
  },
  {
    id: 'donor',
    name: 'Supporter',
    description: 'Make a donation',
    icon: '💝',
    category: 'special',
    requirement: 1,
    unlocked: false,
  },
  {
    id: 'splash_quote',
    name: 'Personal Touch',
    description: 'Set a custom splash quote',
    icon: '⭐',
    category: 'special',
    requirement: 1,
    unlocked: false,
  },
];

export const defaultThemes: Theme[] = [
  {
    id: 'default',
    name: 'Bee Good',
    primaryColor: '#FF6B9D',
    secondaryColor: '#FDEFF2',
    backgroundColor: '#FDEFF2',
    cardColor: '#FFFFFF',
    textColor: '#333333',
    accentColor: '#FF6B9D',
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    primaryColor: '#4A90E2',
    secondaryColor: '#E8F4FD',
    backgroundColor: '#E8F4FD',
    cardColor: '#FFFFFF',
    textColor: '#2C3E50',
    accentColor: '#4A90E2',
  },
  {
    id: 'forest',
    name: 'Forest Green',
    primaryColor: '#27AE60',
    secondaryColor: '#E8F5E8',
    backgroundColor: '#E8F5E8',
    cardColor: '#FFFFFF',
    textColor: '#2C3E50',
    accentColor: '#27AE60',
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    primaryColor: '#F39C12',
    secondaryColor: '#FEF9E7',
    backgroundColor: '#FEF9E7',
    cardColor: '#FFFFFF',
    textColor: '#2C3E50',
    accentColor: '#F39C12',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    primaryColor: '#9B59B6',
    secondaryColor: '#F4F1F8',
    backgroundColor: '#F4F1F8',
    cardColor: '#FFFFFF',
    textColor: '#2C3E50',
    accentColor: '#9B59B6',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    primaryColor: '#34495E',
    secondaryColor: '#ECF0F1',
    backgroundColor: '#ECF0F1',
    cardColor: '#FFFFFF',
    textColor: '#2C3E50',
    accentColor: '#34495E',
  },
];

export interface GoodDeed {
  id: string;
  user_id: string;
  description: string;
  created_at: string;
}

export interface GratitudeEntry {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Wish {
  id: string;
  user_id: string;
  content: string;
  likes: number;
  created_at: string;
  user_email?: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}
