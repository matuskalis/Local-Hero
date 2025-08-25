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
  },
];

export const addRequest = (request: any) => {
  const newRequest = {
    ...request,
    id: Date.now(),
    createdAt: 'Just now',
    isOwn: true,
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
    // Simple info display for now
    console.log('Request details:', request);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Local Hero - Melstone</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={handleProfilePress}
        >
          <Ionicons name="person" size={32} color="white" />
        </TouchableOpacity>
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
                    <Text style={styles.requestUserName}>
                      {request.isOwn ? 'You' : request.userName}
                    </Text>
                    <Text style={styles.requestTime}>{request.createdAt}</Text>
                  </View>
                </View>
                
                <Text style={styles.requestBody}>{request.body}</Text>
                
                <View style={styles.requestFooter}>
                  <View style={styles.requestMeta}>
                    <Ionicons name="time" size={20} color="#2c3e50" />
                    <Text style={styles.requestMetaText}>{request.when}</Text>
                  </View>
                  
                  <View style={styles.requestMeta}>
                    <Ionicons 
                      name={request.visibility === 'public' ? 'globe' : 'people'} 
                      size={20} 
                      color="#2c3e50" 
                    />
                    <Text style={styles.requestMetaText}>
                      {request.visibility === 'public' ? 'Public' : 'Friends'}
                    </Text>
                  </View>
                  
                  <View style={styles.requestMeta}>
                    <Ionicons name="location" size={20} color="#2c3e50" />
                    <Text style={styles.requestMetaText}>{request.community}</Text>
                  </View>
                </View>

                {request.isOwn && (
                  <View style={styles.ownRequestBadge}>
                    <Text style={styles.ownRequestText}>Your Request</Text>
                  </View>
                )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  profileButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    backgroundColor: 'white',
    padding: 28,
    margin: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 20,
    color: '#34495e',
    textAlign: 'center',
    lineHeight: 28,
  },
  requestsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  requestCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ownRequestCard: {
    borderLeftWidth: 6,
    borderLeftColor: '#27ae60',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  requestLeft: {
    flex: 1,
  },
  requestUserName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6,
  },
  requestTime: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  requestBody: {
    fontSize: 20,
    color: '#2c3e50',
    lineHeight: 28,
    marginBottom: 20,
    flexWrap: 'wrap',
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
    marginBottom: 8,
    minWidth: '30%',
  },
  requestMetaText: {
    fontSize: 18,
    color: '#34495e',
    marginLeft: 8,
    fontWeight: '500',
    flexWrap: 'wrap',
    flex: 1,
  },
  ownRequestBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#27ae60',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  ownRequestText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 26,
  },
  helpSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  helpCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  helpText: {
    fontSize: 20,
    color: '#2c3e50',
    lineHeight: 28,
    fontWeight: '500',
  },
});
