import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, defaultThemes } from '../types';
import { AchievementService } from '../services/AchievementService';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultThemes[0]);
  const [availableThemes] = useState<Theme[]>(defaultThemes);

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem('selectedTheme');
      if (savedThemeId) {
        const theme = availableThemes.find(t => t.id === savedThemeId);
        if (theme) {
          setCurrentTheme(theme);
        }
      }
    } catch (error) {
      console.error('Error loading saved theme:', error);
    }
  };

  const setTheme = async (themeId: string) => {
    try {
      const theme = availableThemes.find(t => t.id === themeId);
      if (theme) {
        setCurrentTheme(theme);
        await AsyncStorage.setItem('selectedTheme', themeId);

        // Track unique themes used for achievements
        try {
          const historyRaw = await AsyncStorage.getItem('selectedThemeHistory');
          const history: string[] = historyRaw ? JSON.parse(historyRaw) : [];
          if (!history.includes(themeId)) {
            const next = [...history, themeId];
            await AsyncStorage.setItem('selectedThemeHistory', JSON.stringify(next));
            if (next.length >= 3) {
              // Unlock theme explorer achievement once
              await AchievementService.unlockSpecialAchievement('theme_explorer');
            }
          }
        } catch {}
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}; 