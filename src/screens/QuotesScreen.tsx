import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Linking } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomModal } from '../components/CustomModal';
import { AchievementService } from '../services/AchievementService';

interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
}

export const QuotesScreen: React.FC = () => {
  const { currentTheme } = useTheme();
  const [dailyQuote, setDailyQuote] = useState<Quote | null>(null);
  const [countdown, setCountdown] = useState('');
  const [fadeAnim] = useState(new Animated.Value(1));
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null);

  const allQuotes: Quote[] = [
    { id: '1', text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "motivation" },
    { id: '2', text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "success" },
    { id: '3', text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "dreams" },
    { id: '4', text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "perseverance" },
    { id: '5', text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt", category: "optimism" },
    { id: '6', text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar", category: "growth" },
    { id: '7', text: "The mind is everything. What you think you become.", author: "Buddha", category: "mindfulness" },
    { id: '8', text: "It always seems impossible until it's done.", author: "Nelson Mandela", category: "determination" },
    { id: '9', text: "The best way to predict the future is to create it.", author: "Peter Drucker", category: "action" },
    { id: '10', text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama", category: "happiness" },
    { id: '11', text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi", category: "change" },
    { id: '12', text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "life" },
    { id: '13', text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "perseverance" },
    { id: '14', text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu", category: "journey" },
    { id: '15', text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "belief" },
    { id: '16', text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson", category: "destiny" },
    { id: '17', text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair", category: "courage" },
    { id: '18', text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "action" },
    { id: '19', text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs", category: "authenticity" },
    { id: '20', text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela", category: "resilience" },
  ];

  useEffect(() => {
    loadDailyQuote();
    startCountdown();
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const premiumStatus = await AsyncStorage.getItem('isPremium');
      setIsPremium(premiumStatus === 'true');
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const loadDailyQuote = async () => {
    try {
      const today = new Date().toDateString();
      const savedQuote = await AsyncStorage.getItem('dailyQuote');
      const savedDate = await AsyncStorage.getItem('dailyQuoteDate');

      if (savedQuote && savedDate === today) {
        // Use saved quote for today
        setDailyQuote(JSON.parse(savedQuote));
      } else {
        // Generate new quote for today
        const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
        setDailyQuote(randomQuote);
        
        // Save new quote
        await AsyncStorage.setItem('dailyQuote', JSON.stringify(randomQuote));
        await AsyncStorage.setItem('dailyQuoteDate', today);
      }
    } catch (error) {
      console.error('Error loading daily quote:', error);
      // Fallback to random quote
      const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
      setDailyQuote(randomQuote);
    }
  };

  const refreshQuote = async () => {
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }

    try {
      const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
      setDailyQuote(randomQuote);
      
      // Save new quote
      await AsyncStorage.setItem('dailyQuote', JSON.stringify(randomQuote));
      await AsyncStorage.setItem('dailyQuoteDate', new Date().toDateString());
      
      Alert.alert('Success', 'Quote refreshed! ✨');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh quote');
    }
  };

  const handleGetPremium = () => {
    setShowPremiumModal(false);
    Alert.alert(
      'Get Premium',
      'Visit our website for discounted premium plans!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Visit Website', 
          onPress: () => Linking.openURL('https://beegood.store')
        },
      ]
    );
  };

  const startCountdown = () => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const timeLeft = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      
      setCountdown(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  };

  const addToProfile = async () => {
    if (!dailyQuote) return;

    try {
      const savedQuotes = await AsyncStorage.getItem('profileQuotes');
      const profileQuotes = savedQuotes ? JSON.parse(savedQuotes) : [];
      
      // Add to profile quotes with unique ID to allow duplicates
      const quoteToSave = {
        ...dailyQuote,
        savedId: `${dailyQuote.id}_${Date.now()}`, // Make each save unique
        savedDate: new Date().toISOString(),
        isFavorite: false,
      };
      
      profileQuotes.push(quoteToSave);
      
                    await AsyncStorage.setItem('profileQuotes', JSON.stringify(profileQuotes));
              
              // Check for achievements
              const savedQuotesCount = profileQuotes.length;
              const newAchievements = await AchievementService.checkAndUpdateAchievements('quotes', savedQuotesCount);
              
              if (newAchievements.length > 0) {
                setNewAchievement(newAchievements[0]);
                setShowAchievementModal(true);
              }
              
              Alert.alert('Success', 'Quote added to your profile! 💫');
    } catch (error) {
      Alert.alert('Error', 'Failed to save quote to profile');
    }
  };

  if (!dailyQuote) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: currentTheme.backgroundColor }]}>
        <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>Loading today's quote...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <View style={styles.header}>
        <Text style={styles.logo}>🐝</Text>
        <Text style={[styles.title, { color: currentTheme.textColor }]}>Bee Good</Text>
        <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>Today's Daily Quote</Text>
      </View>
      
      <View style={[styles.quoteCard, { backgroundColor: currentTheme.cardColor }]}>
        <View style={styles.quoteHeader}>
          <Text style={styles.quoteIcon}>💭</Text>
          <Text style={[styles.quoteCategory, { color: currentTheme.textColor }]}>{dailyQuote.category}</Text>
        </View>
        
        <Text style={[styles.quoteText, { color: currentTheme.textColor }]}>
          "{dailyQuote.text}"
        </Text>
        <Text style={[styles.quoteAuthor, { color: currentTheme.textColor }]}>— {dailyQuote.author}</Text>
        
        <View style={styles.countdownContainer}>
          <Text style={[styles.countdownLabel, { color: currentTheme.textColor }]}>Next quote in:</Text>
          <Text style={[styles.countdownText, { color: currentTheme.accentColor }]}>{countdown}</Text>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: currentTheme.accentColor }]} onPress={addToProfile}>
            <Text style={styles.addButtonText}>Add to Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.refreshButton} onPress={refreshQuote}>
            <Text style={styles.refreshButtonText}>
              {isPremium ? '🔄' : '🔒'} Refresh
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={[styles.infoCard, { backgroundColor: currentTheme.cardColor }]}>
        <Text style={[styles.infoTitle, { color: currentTheme.textColor }]}>💡 Daily Inspiration</Text>
        <Text style={[styles.infoText, { color: currentTheme.textColor }]}>
          Each day brings a new motivational quote to inspire your journey. 
          Save your favorites to your profile and revisit them anytime!
          {!isPremium && '\n\n🔒 Get Premium for unlimited quote refreshes!'}
        </Text>
      </View>

      <CustomModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        title="🔒 Premium Feature"
        message="Get unlimited quote refreshes with Premium!\n\n✨ Premium Benefits:\n• Unlimited daily quote refreshes\n• Exclusive premium quotes\n• Priority support\n• Ad-free experience\n• Early access to new features"
        buttons={[
          {
            text: 'Get Premium',
            onPress: handleGetPremium,
            style: 'primary',
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FDEFF2',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
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
  },
  quoteCard: {
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
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quoteIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  quoteCategory: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  quoteText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 26,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginBottom: 20,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  countdownLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  countdownText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#FF6B9D',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
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
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
}); 