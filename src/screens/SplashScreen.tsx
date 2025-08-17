import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
}

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

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
    loadRandomQuote();
    startAnimation();
  }, []);

  const loadRandomQuote = async () => {
    try {
      // First try to get the saved splash quote
      const savedSplashQuote = await AsyncStorage.getItem('splashQuote');
      if (savedSplashQuote) {
        setQuote(JSON.parse(savedSplashQuote));
        return;
      }

      // If no splash quote, try to get today's quote
      const today = new Date().toDateString();
      const savedQuote = await AsyncStorage.getItem('dailyQuote');
      const savedDate = await AsyncStorage.getItem('dailyQuoteDate');

      if (savedQuote && savedDate === today) {
        setQuote(JSON.parse(savedQuote));
      } else {
        // Fallback to random quote
        const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
        setQuote(randomQuote);
      }
    } catch (error) {
      // Fallback to random quote
      const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
      setQuote(randomQuote);
    }
  };

  const handleTap = () => {
    // Immediately start fade out animation when tapped
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  };

  const startAnimation = () => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      // Wait 3 seconds, then fade out
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => {
          onFinish();
        });
      }, 3000);
    });
  };

  if (!quote) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🐝</Text>
            <Text style={styles.title}>Bee Good</Text>
          </View>
          
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>"{quote.text}"</Text>
            <Text style={styles.quoteAuthor}>— {quote.author}</Text>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Spreading kindness every day</Text>
          </View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDEFF2',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  quoteContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  quoteText: {
    fontSize: 20,
    color: '#333',
    lineHeight: 28,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  quoteAuthor: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
}); 