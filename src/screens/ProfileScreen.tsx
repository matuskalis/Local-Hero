import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserData } from '../services/localStorage';
import * as ImagePicker from 'expo-image-picker';
import { CustomModal } from '../components/CustomModal';
import { ThemeSelector } from '../components/ThemeSelector';
import { useTheme } from '../context/ThemeContext';
import { AchievementService } from '../services/AchievementService';

interface GoodDeed {
  id: string;
  description: string;
  date: string;
}

interface GratitudeEntry {
  id: string;
  content: string;
  date: string;
}

interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  savedDate?: string;
  savedId?: string;
  isFavorite?: boolean;
}

interface ProfileScreenProps {
  user: UserData;
  onSignOut: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onSignOut }) => {
  const { currentTheme } = useTheme();
  const [goodDeedsCount, setGoodDeedsCount] = useState(0);
  const [gratitudeDaysCount, setGratitudeDaysCount] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showDonationSuccessModal, setShowDonationSuccessModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState(0);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null);

  useEffect(() => {
    loadStatistics();
    loadProfileImage();
    loadSavedQuotes();
  }, []);

  const loadProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('profileImage');
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const loadSavedQuotes = async () => {
    try {
      const savedQuotesData = await AsyncStorage.getItem('profileQuotes');
      if (savedQuotesData) {
        const quotes = JSON.parse(savedQuotesData);
        setSavedQuotes(quotes);
      }
    } catch (error) {
      console.error('Error loading saved quotes:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      // Load good deeds count
      const todayDeed = await AsyncStorage.getItem('todayDeed');
      const goodDeeds = await AsyncStorage.getItem('goodDeeds');
      let deedsCount = 0;
      
      if (todayDeed) deedsCount++;
      if (goodDeeds) {
        const deeds = JSON.parse(goodDeeds);
        deedsCount += deeds.length;
      }
      setGoodDeedsCount(deedsCount);

      // Load gratitude days count - count unique days only
      const gratitudes = await AsyncStorage.getItem('gratitudes');
      if (gratitudes) {
        const gratitudeEntries = JSON.parse(gratitudes);
        // Get unique dates by converting to date strings and using Set
        const uniqueDates = new Set(
          gratitudeEntries.map((entry: GratitudeEntry) => 
            new Date(entry.date).toDateString()
          )
        );
        setGratitudeDaysCount(uniqueDates.size);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const pickImage = async () => {
    try {
      // Launch image picker without asking for permissions first
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Simpler experience
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
        
        // Save to AsyncStorage
        try {
          await AsyncStorage.setItem('profileImage', imageUri);
          Alert.alert('Success', 'Profile picture updated!');
        } catch (error) {
          Alert.alert('Error', 'Failed to save profile picture');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeSavedQuote = async (quoteId: string) => {
    Alert.alert(
      'Remove Quote',
      'Are you sure you want to remove this quote from your saved quotes?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const updatedQuotes = savedQuotes.filter(quote => quote.savedId !== quoteId);
              await AsyncStorage.setItem('profileQuotes', JSON.stringify(updatedQuotes));
              setSavedQuotes(updatedQuotes);
              Alert.alert('Success', 'Quote removed from saved quotes!');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove quote');
            }
          }
        },
      ]
    );
  };

  const toggleFavorite = async (quoteId: string) => {
    try {
      const updatedQuotes = savedQuotes.map(quote => 
        quote.savedId === quoteId 
          ? { ...quote, isFavorite: !quote.isFavorite }
          : quote
      );
      await AsyncStorage.setItem('profileQuotes', JSON.stringify(updatedQuotes));
      setSavedQuotes(updatedQuotes);
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const setAsSplashQuote = async (quote: Quote) => {
    try {
      await AsyncStorage.setItem('splashQuote', JSON.stringify(quote));
      
      // Check for splash quote achievement
      const newAchievement = await AchievementService.unlockSpecialAchievement('splash_quote');
      if (newAchievement) {
        setNewAchievement(newAchievement);
        setShowAchievementModal(true);
      }
      
      Alert.alert('Success', 'This quote will now appear on app startup! 🌟');
    } catch (error) {
      Alert.alert('Error', 'Failed to set splash quote');
    }
  };

  const handleDonations = () => {
    setShowDonationModal(true);
  };

  const handleDonationAmount = async (amount: number) => {
    setDonationAmount(amount);
    setShowDonationModal(false);
    
    // Check for donor achievement
    const newAchievement = await AchievementService.unlockSpecialAchievement('donor');
    if (newAchievement) {
      setNewAchievement(newAchievement);
      setShowAchievementModal(true);
    }
    
    setShowDonationSuccessModal(true);
  };

  const handleCustomDonation = () => {
    setShowDonationModal(false);
    Alert.alert(
      'Custom Donation',
      'Visit our website to make a custom donation amount. Every contribution helps us grow!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Visit Website', 
          onPress: () => Linking.openURL('https://beegood.store')
        },
      ]
    );
  };

  const handleDonationSuccess = () => {
    setShowDonationSuccessModal(false);
    Linking.openURL('https://beegood.store');
  };

  const handleLogin = () => {
    Alert.alert(
      'Login',
      'You are already logged in!',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            try {
              onSignOut();
              Alert.alert('Success', 'You have been successfully logged out');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        },
      ]
    );
  };

  const userEmail = user?.email || 'user@example.com';
  const isLoggedIn = !!user;

  if (showThemeSelector) {
    return <ThemeSelector onClose={() => setShowThemeSelector(false)} />;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.logo}>🐝</Text>
        <Text style={[styles.title, { color: currentTheme.textColor }]}>Bee Good</Text>
      </View>
      
      <View style={[styles.profileCard, { backgroundColor: currentTheme.cardColor }]}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <Text style={styles.avatar}>👤</Text>
          )}
        </TouchableOpacity>
        <Text style={[styles.userName, { color: currentTheme.textColor }]}>
          {isLoggedIn ? 'Logged In User' : 'Guest User'}
        </Text>
        <Text style={[styles.userEmail, { color: currentTheme.textColor }]}>{userEmail}</Text>
        {isLoggedIn && (
          <View style={[styles.statusBadge, { backgroundColor: currentTheme.accentColor }]}>
            <Text style={styles.statusText}>✓ Verified</Text>
          </View>
        )}
      </View>
      
      <View style={[styles.statsCard, { backgroundColor: currentTheme.cardColor }]}>
        <Text style={[styles.statsTitle, { color: currentTheme.textColor }]}>Your Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: currentTheme.accentColor }]}>{goodDeedsCount}</Text>
            <Text style={[styles.statLabel, { color: currentTheme.textColor }]}>Good Deeds</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: currentTheme.accentColor }]}>{gratitudeDaysCount}</Text>
            <Text style={[styles.statLabel, { color: currentTheme.textColor }]}>Gratitude Days</Text>
          </View>
        </View>
      </View>
      
      <View style={[styles.savedQuotesCard, { backgroundColor: currentTheme.cardColor }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>Saved Quotes</Text>
        {savedQuotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💭</Text>
            <Text style={[styles.emptyTitle, { color: currentTheme.textColor }]}>No saved quotes yet</Text>
            <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
              Save your favorite quotes from the Quotes tab to see them here!
            </Text>
          </View>
        ) : (
          <View style={styles.quotesList}>
            {savedQuotes.map((quote, index) => (
              <View key={quote.savedId || `quote_${index}`} style={[styles.quoteItem, { backgroundColor: currentTheme.secondaryColor }]}>
                <View style={styles.quoteContent}>
                  <View style={styles.quoteHeader}>
                    <Text style={[styles.quoteText, { color: currentTheme.textColor }]}>"{quote.text}"</Text>
                    <TouchableOpacity 
                      style={styles.favoriteButton}
                      onPress={() => toggleFavorite(quote.savedId || `quote_${index}`)}
                    >
                      <Text style={styles.favoriteIcon}>
                        {quote.isFavorite ? '⭐' : '☆'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.quoteAuthor, { color: currentTheme.textColor }]}>— {quote.author}</Text>
                  {quote.savedDate && (
                    <Text style={[styles.quoteDate, { color: currentTheme.textColor }]}>
                      Saved on {new Date(quote.savedDate).toLocaleDateString()}
                    </Text>
                  )}
                  <View style={styles.quoteActions}>
                    <TouchableOpacity 
                      style={[styles.quoteActionButton, { backgroundColor: currentTheme.secondaryColor }]}
                      onPress={() => setAsSplashQuote(quote)}
                    >
                      <Text style={styles.quoteActionIcon}>🌟</Text>
                      <Text style={[styles.quoteActionText, { color: currentTheme.accentColor }]}>Set as Splash</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeSavedQuote(quote.savedId || `quote_${index}`)}
                    >
                      <Text style={styles.removeButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
      
      <View style={[styles.actionsCard, { backgroundColor: currentTheme.cardColor }]}>
        {!isLoggedIn ? (
          <TouchableOpacity style={styles.actionButton} onPress={handleLogin}>
            <Text style={styles.actionIcon}>🔐</Text>
            <Text style={[styles.actionText, { color: currentTheme.textColor }]}>Login</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <Text style={styles.actionIcon}>🚪</Text>
            <Text style={[styles.actionText, { color: currentTheme.textColor }]}>Logout</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowThemeSelector(true)}>
          <Text style={styles.actionIcon}>🎨</Text>
          <Text style={[styles.actionText, { color: currentTheme.textColor }]}>Themes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleDonations}>
          <Text style={styles.actionIcon}>💝</Text>
          <Text style={[styles.actionText, { color: currentTheme.textColor }]}>Donations</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={[styles.actionText, { color: currentTheme.textColor }]}>Support</Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.premiumCard, { backgroundColor: currentTheme.cardColor }]}>
        <Text style={[styles.premiumTitle, { color: currentTheme.textColor }]}>🌟 Get Premium</Text>
        <Text style={[styles.premiumText, { color: currentTheme.textColor }]}>
          Unlock unlimited quote refreshes and exclusive features!
        </Text>
        <TouchableOpacity 
          style={[styles.premiumButton, { backgroundColor: currentTheme.accentColor }]}
          onPress={() => Linking.openURL('https://beegood.store')}
        >
          <Text style={styles.premiumButtonText}>Visit beegood.store</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.version, { color: currentTheme.textColor }]}>Version 1.0.0</Text>
        <Text style={[styles.copyright, { color: currentTheme.textColor }]}>© 2024 Bee Good App</Text>
      </View>

      <CustomModal
        visible={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        title="💝 Support Bee Good"
        message="Choose your donation amount to help us keep spreading kindness!"
        buttons={[
          {
            text: '$5',
            onPress: () => handleDonationAmount(5),
            style: 'primary',
          },
          {
            text: '$10',
            onPress: () => handleDonationAmount(10),
            style: 'primary',
          },
          {
            text: '$20',
            onPress: () => handleDonationAmount(20),
            style: 'primary',
          },
          {
            text: 'Custom Amount',
            onPress: handleCustomDonation,
            style: 'secondary',
          },
        ]}
      />

      <CustomModal
        visible={showDonationSuccessModal}
        onClose={() => setShowDonationSuccessModal(false)}
        title="Thank You! 💝"
        message={`Your $${donationAmount} donation helps us spread more kindness in the world. Every contribution makes a difference!`}
        buttons={[
          {
            text: 'Visit Website',
            onPress: handleDonationSuccess,
            style: 'primary',
          },
          {
            text: 'OK',
            onPress: () => setShowDonationSuccessModal(false),
            style: 'secondary',
          },
        ]}
      />

      <CustomModal
        visible={showAchievementModal}
        onClose={() => setShowAchievementModal(false)}
        title={`🏆 Achievement Unlocked!`}
        message={`Congratulations! You've earned the "${newAchievement?.name}" achievement!\n\n${newAchievement?.description}`}
        buttons={[
          { text: 'Awesome!', onPress: () => setShowAchievementModal(false), style: 'primary' },
        ]}
      />
    </ScrollView>
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
  profileCard: {
    backgroundColor: '#fff',
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
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    fontSize: 40,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsCard: {
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
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
    color: '#FF6B9D',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  savedQuotesCard: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  quotesList: {
    gap: 16,
  },
  quoteItem: {
    backgroundColor: '#FDEFF2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  quoteContent: {
    flex: 1,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    fontStyle: 'italic',
    flex: 1,
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  quoteDate: {
    fontSize: 12,
    color: '#999',
  },
  quoteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quoteActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFE0E6',
    borderRadius: 12,
  },
  quoteActionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  quoteActionText: {
    fontSize: 14,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 18,
  },
  actionsCard: {
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  premiumCard: {
    backgroundColor: '#fff',
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
  premiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  premiumText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  premiumButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  premiumButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  version: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 14,
    color: '#999',
  },
}); 