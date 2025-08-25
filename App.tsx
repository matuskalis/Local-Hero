import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import NameInputScreen from './src/screens/NameInputScreen';
import HomeScreen from './src/screens/HomeScreen';
import PostScreen from './src/screens/PostScreen';
import InboxScreen from './src/screens/InboxScreen';
import ProfileScreen from './src/screens/ProfileScreen';

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
        tabBarActiveTintColor: '#27ae60',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarStyle: {
          height: 80,
          paddingBottom: 16,
          paddingTop: 12,
          backgroundColor: '#2c3e50',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.2,
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
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} initialParams={{ userName }} />
          <Stack.Screen name="Profile" component={ProfileScreen} initialParams={{ userName }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
