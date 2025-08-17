import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ThemeSelectorProps {
  onClose: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onClose }) => {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
    onClose();
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.cardColor }]}>
        <Text style={[styles.title, { color: currentTheme.textColor }]}>Choose Theme</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={[styles.closeText, { color: currentTheme.accentColor }]}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.themesContainer} showsVerticalScrollIndicator={false}>
        {availableThemes.map((theme) => (
          <TouchableOpacity
            key={theme.id}
            style={[
              styles.themeCard,
              { backgroundColor: theme.cardColor },
              currentTheme.id === theme.id && { borderColor: theme.accentColor, borderWidth: 2 }
            ]}
            onPress={() => handleThemeSelect(theme.id)}
          >
            <View style={styles.themePreview}>
              <View style={[styles.colorPreview, { backgroundColor: theme.primaryColor }]} />
              <View style={[styles.colorPreview, { backgroundColor: theme.secondaryColor }]} />
              <View style={[styles.colorPreview, { backgroundColor: theme.accentColor }]} />
            </View>
            
            <View style={styles.themeInfo}>
              <Text style={[styles.themeName, { color: theme.textColor }]}>{theme.name}</Text>
              {currentTheme.id === theme.id && (
                <View style={[styles.selectedBadge, { backgroundColor: theme.accentColor }]}>
                  <Text style={styles.selectedText}>✓ Selected</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  themesContainer: {
    flex: 1,
    padding: 20,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  themePreview: {
    flexDirection: 'row',
    marginRight: 16,
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
}); 