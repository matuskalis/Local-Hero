import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NotificationProvider } from './src/ui/notifications/NotificationProvider';
import { StatusBar } from 'expo-status-bar';
// import { NotificationProvider } from './src/ui/notifications/NotificationProvider';

import NameInputScreen from './src/screens/NameInputScreen';
import HomeScreen from './src/screens/HomeScreen';
import PostScreen from './src/screens/PostScreen';
import InboxScreen from './src/screens/InboxScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RequestDetailScreen from './src/screens/RequestDetailScreen';
import MyRequestsScreen from './src/screens/MyRequestsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs({ route }: any) {
  const userName = route?.params?.userName || 'Your Name';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Post') {
            iconName = 'add-circle';
          } else if (route.name === 'Inbox') {
            iconName = 'mail';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2BB673',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          height: 80,
          paddingBottom: 16,
          paddingTop: 12,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        initialParams={{ userName }}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Post" 
        component={PostScreen}
        initialParams={{ userName }}
        options={{
          tabBarLabel: 'Post Request',
        }}
      />
      <Tab.Screen 
        name="Inbox" 
        component={InboxScreen}
        initialParams={{ userName }}
        options={{
          tabBarLabel: 'Inbox',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [userName, setUserName] = useState('');

  if (!userName) {
    return (
      <SafeAreaProvider>
        <NameInputScreen onNameSubmit={setUserName} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
              <StatusBar style="dark" />
        <NotificationProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="MainTabs" component={MainTabs} initialParams={{ userName }} />
              <Stack.Screen name="Profile" component={ProfileScreen} initialParams={{ userName }} />
              <Stack.Screen name="RequestDetail" component={RequestDetailScreen} initialParams={{ userName }} />
              <Stack.Screen name="MyRequests" component={MyRequestsScreen} initialParams={{ userName }} />
              <Stack.Screen name="Leaderboard" component={LeaderboardScreen} initialParams={{ userName }} />
            </Stack.Navigator>
          </NavigationContainer>
        </NotificationProvider>
    </SafeAreaProvider>
  );
}
