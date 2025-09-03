import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sharedRequests } from './HomeScreen';
import { Avatar } from '../ui/components';

export default function MyRequestsScreen({ navigation, route }: any) {
  const [myRequests, setMyRequests] = useState(sharedRequests.filter(req => req.isOwn));
  const userName = route?.params?.userName || 'Your Name';

  // Refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setMyRequests(sharedRequests.filter(req => req.isOwn));
    });
    return unsubscribe;
  }, [navigation]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleRequestPress = (request: any) => {
    // Navigate to request detail screen
    navigation.navigate('RequestDetail', {
      request: request,
      userName: userName,
      showOffers: true, // Auto-show offers for own requests
    });
  };

  const handleDeleteRequest = (requestId: number) => {
    // Remove from shared state
    const updatedRequests = myRequests.filter(req => req.id !== requestId);
    setMyRequests(updatedRequests);
    
    // Update the shared requests array in HomeScreen
    const globalRequests = sharedRequests.filter(req => req.id !== requestId);
    // Note: In a real app, you'd call a service to delete from database
    console.log('Request deleted:', requestId);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'snow':
        return '❄️';
      case 'grocery':
        return '🛒';
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={28} color="#2BB673" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Requests</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.headerDivider} />
      </View>

      <ScrollView style={styles.content}>
        {myRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyText}>No requests yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first request to get help from your community
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Post' })}
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text style={styles.createButtonText}>Create Request</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.requestsSection}>
            <Text style={styles.sectionTitle}>Your Requests</Text>
            {myRequests.map((request) => (
              <TouchableOpacity
                key={request.id}
                style={styles.requestCard}
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
                      <Text style={styles.categoryIcon}>
                        {getCategoryIcon(request.category)}
                      </Text>
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
                
                {/* Delete Button */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteRequest(request.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#E53E3E" />
                  <Text style={styles.deleteButtonText}>Delete Request</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 24,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4D4D4D',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: '#2BB673',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 25,
    gap: 12,
  },
  createButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  requestLeft: {
    flex: 1,
    marginRight: 20,
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
  requestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  requestTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  requestStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
    fontSize: 16,
    fontWeight: '500',
    color: '#4D4D4D',
    marginLeft: 12,
    flexWrap: 'wrap',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  deleteButtonText: {
    color: '#E53E3E',
    fontSize: 16,
    fontWeight: '600',
  },
});
