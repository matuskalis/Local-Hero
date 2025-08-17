import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen } from '../screens/HomeScreen';
import { GratitudeScreen } from '../screens/GratitudeScreen';
import { QuotesScreen } from '../screens/QuotesScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { Text } from 'react-native';
import { UserData } from '../services/localStorage';

interface AppNavigatorProps {
  user: UserData;
  onSignOut: () => void;
}

const Tab = createBottomTabNavigator();

export const AppNavigator: React.FC<AppNavigatorProps> = ({ user, onSignOut }) => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#FF6B9D',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
            paddingBottom: 20,
            paddingTop: 10,
            height: 90,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>🏠</Text>,
          }}
        />
        <Tab.Screen
          name="Gratitude"
          component={GratitudeScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>🙏</Text>,
          }}
        />
        <Tab.Screen
          name="Quotes"
          component={QuotesScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>💭</Text>,
          }}
        />
        <Tab.Screen
          name="Achievements"
          component={AchievementsScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>🏆</Text>,
          }}
        />
        <Tab.Screen
          name="Profile"
          options={{
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>👤</Text>,
          }}
        >
          {() => <ProfileScreen user={user} onSignOut={onSignOut} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}; 