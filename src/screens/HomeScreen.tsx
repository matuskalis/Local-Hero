import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../ui/components';

// Shared state for requests - this will be passed between screens
export let sharedRequests: any[] = [
  {
    id: 1,
    userName: 'John Smith',
    body: 'Need help shoveling driveway after snow',
    when: 'This weekend',
    visibility: 'public',
    community: 'Melstone, MT',
    createdAt: '2 hours ago',
    isOwn: false,
    category: 'snow',
    status: 'open',
  },
  {
    id: 2,
    userName: 'Mary Johnson',
    body: 'Help with grocery pickup',
    when: 'Tomorrow',
    visibility: 'public',
    community: 'Melstone, MT',
    createdAt: '1 day ago',
    isOwn: false,
    category: 'grocery',
    status: 'open',
  },
  {
    id: 3,
    userName: 'Your Name',
    body: 'Need help with yard work',
    when: 'Next week',
    visibility: 'public',
    community: 'Melstone, MT',
    createdAt: '3 days ago',
    isOwn: true,
    category: 'yard',
    status: 'open',
  },
];

export const addRequest = (request: any) => {
  const newRequest = {
    ...request,
    id: Date.now(),
    createdAt: 'Just now',
    isOwn: true,
    status: 'open',
  };
  sharedRequests.unshift(newRequest);
};

export const deleteRequest = (requestId: number) => {
  const index = sharedRequests.findIndex(req => req.id === requestId);
  if (index > -1) {
    sharedRequests.splice(index, 1);
  }
};

export default function HomeScreen({ navigation, route }: any) {
  const [requests, setRequests] = useState(sharedRequests);
  const [refreshing, setRefreshing] = useState(false);
  const userName = route?.params?.userName || 'Your Name';

  // Refresh requests from shared state
  const refreshRequests = () => {
    setRequests([...sharedRequests]);
  };

  // Listen for navigation focus to refresh
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshRequests();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    refreshRequests();
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile', { userName, refreshRequests });
  };

  const handleRequestPress = (request: any) => {
    // Navigate to request detail screen
    navigation.navigate('RequestDetail', { request, userName });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'grocery':
        return '🛒';
      case 'snow':
        return '❄️';
      case 'yard':
        return '🌱';
      default:
        return '📋';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* White Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Requests</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.myRequestsButton}
              onPress={() => navigation.navigate('MyRequests', { userName })}
            >
              <Ionicons name="list" size={24} color="#2BB673" />
              <Text style={styles.myRequestsText}>My Requests</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={handleProfilePress}
            >
              <Ionicons name="person" size={32} color="#2BB673" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.headerDivider} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome, {userName}!</Text>
          <Text style={styles.welcomeSubtitle}>
            Here are the latest requests from your community
          </Text>
        </View>

        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>Community Requests</Text>
          
          {requests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No requests yet</Text>
              <Text style={styles.emptySubtext}>
                Be the first to ask for help or wait for others
              </Text>
            </View>
          ) : (
            requests.map((request) => (
              <TouchableOpacity
                key={request.id}
                style={[styles.requestCard, request.isOwn && styles.ownRequestCard]}
                onPress={() => handleRequestPress(request)}
              >
                <View style={styles.requestHeader}>
                  <View style={styles.requestLeft}>
                    <View style={styles.requestTitleRow}>
                      <Avatar 
                        size="small" 
                        name={request.userName}
                        style={styles.requestAvatar}
                      />
                      <Text style={styles.requestTitle}>{request.body}</Text>
                    </View>
                    <Text style={styles.requestTime}>{request.createdAt}</Text>
                  </View>
                  

                </View>
                
                <View style={styles.requestFooter}>
                  <View style={styles.requestMeta}>
                    <Ionicons name="time" size={20} color="#4D4D4D" />
                    <Text style={styles.requestMetaText}>{request.when}</Text>
                  </View>
                  
                  <View style={styles.requestMeta}>
                    <Ionicons 
                      name={request.visibility === 'public' ? 'globe' : 'people'} 
                      size={20} 
                      color="#4D4D4D" 
                    />
                    <Text style={styles.requestMetaText}>
                      {request.visibility === 'public' ? 'Public' : 'Friends'}
                    </Text>
                  </View>
                  
                  <View style={styles.requestMeta}>
                    <Ionicons name="location" size={20} color="#4D4D4D" />
                    <Text style={styles.requestMetaText}>{request.community}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.helpSection}>
          <Text style={styles.sectionTitle}>How to Help</Text>
          <View style={styles.helpCard}>
            <Text style={styles.helpText}>
              Tap on any request to see details and offer help
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  myRequestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7EF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 12,
  },
  myRequestsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2BB673',
  },
  profileButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E6F7EF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    margin: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4D4D4D',
    textAlign: 'center',
    lineHeight: 28,
  },
  requestsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 24,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ownRequestCard: {
    borderLeftWidth: 6,
    borderLeftColor: '#2BB673',
  },
  ownRequestBadge: {
    backgroundColor: '#2BB673',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  ownRequestText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  requestLeft: {
    flex: 1,
  },
  requestTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  requestAvatar: {
    marginRight: 8,
  },
  categoryIcon: {
    fontSize: 24,
  },
  requestUserName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
  },
  requestTime: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7280',
  },
  requestBody: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 28,
    marginBottom: 24,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    minWidth: '30%',
  },
  requestMetaText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4D4D4D',
    marginLeft: 12,
    flexWrap: 'wrap',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    margin: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4D4D4D',
    textAlign: 'center',
    lineHeight: 26,
  },
  helpSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  helpCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    margin: 0,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  helpText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 28,
  },
});
