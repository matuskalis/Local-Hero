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
        <Text style={styles.headerTitle}>🏠 Local Hero - Melstone</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={handleProfilePress}
        >
          <Ionicons name="person" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
              <Ionicons name="people" size={48} color="#ccc" />
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
                  <Text style={styles.requestUserName}>
                    {request.isOwn ? 'You' : request.userName}
                  </Text>
                  <Text style={styles.requestTime}>{request.createdAt}</Text>
                </View>
                
                <Text style={styles.requestBody}>{request.body}</Text>
                
                <View style={styles.requestFooter}>
                  <View style={styles.requestMeta}>
                    <Ionicons name="time" size={18} color="#666" />
                    <Text style={styles.requestMetaText}>{request.when}</Text>
                  </View>
                  
                  <View style={styles.requestMeta}>
                    <Ionicons 
                      name={request.visibility === 'public' ? 'globe' : 'people'} 
                      size={18} 
                      color="#666" 
                    />
                    <Text style={styles.requestMetaText}>
                      {request.visibility === 'public' ? 'Public' : 'Friends'}
                    </Text>
                  </View>
                  
                  <View style={styles.requestMeta}>
                    <Ionicons name="location" size={18} color="#666" />
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
            <Ionicons name="heart" size={28} color="#4CAF50" />
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    lineHeight: 24,
  },
  requestsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 18,
  },
  requestCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ownRequestCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  requestUserName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  requestTime: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  requestBody: {
    fontSize: 18,
    color: '#2c3e50',
    lineHeight: 24,
    marginBottom: 18,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestMetaText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 6,
  },
  ownRequestBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ownRequestText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  helpSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  helpCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpText: {
    fontSize: 18,
    color: '#2c3e50',
    marginLeft: 16,
    flex: 1,
    lineHeight: 24,
  },
});
