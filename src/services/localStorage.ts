import AsyncStorage from '@react-native-async-storage/async-storage';

// Local storage service to replace Supabase
export interface UserData {
  id: string;
  email?: string;
  name?: string;
  createdAt: string;
  // Add any other user data fields you need
}

export interface AppData {
  // Add any other app data you want to store locally
  settings?: any;
  userPreferences?: any;
}

class LocalStorageService {
  private static instance: LocalStorageService;
  
  private constructor() {}
  
  static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  // User management
  async saveUser(user: UserData): Promise<void> {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('isAuthenticated', 'true');
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  async getUser(): Promise<UserData | null> {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const authStatus = await AsyncStorage.getItem('isAuthenticated');
      return authStatus === 'true';
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('isAuthenticated');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  // App data management
  async saveAppData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }

  async getAppData(key: string): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  async removeAppData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
}

export const localStorageService = LocalStorageService.getInstance();
