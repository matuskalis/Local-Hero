import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthScreen } from './src/screens/AuthScreen';
import { SplashScreen } from './src/screens/SplashScreen';
import { localStorageService, UserData } from './src/services/localStorage';
import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuth = await localStorageService.isAuthenticated();
      if (isAuth) {
        const userData = await localStorageService.getUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = async (userData: UserData) => {
    try {
      await localStorageService.saveUser(userData);
      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await localStorageService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSplashFinish = () => {
    // Defer state update to avoid scheduling updates during insertion effect
    setTimeout(() => setShowSplash(false), 0);
  };

  if (loading || showSplash) {
    return (
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <SplashScreen onFinish={handleSplashFinish} />
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        {user ? (
          <AppNavigator user={user} onSignOut={handleSignOut} />
        ) : (
          <AuthScreen onAuthSuccess={handleAuthSuccess} />
        )}
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
