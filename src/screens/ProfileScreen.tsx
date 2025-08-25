import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sharedRequests, deleteRequest } from './HomeScreen';

export default function ProfileScreen({ navigation, route }: any) {
  const [myRequests, setMyRequests] = useState(sharedRequests.filter(req => req.isOwn));
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<any>(null);
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

  const handleDeleteRequest = (request: any) => {
    setRequestToDelete(request);
    setShowDeletePopup(true);
  };

  const confirmDelete = () => {
    if (requestToDelete) {
      deleteRequest(requestToDelete.id);
      setMyRequests(sharedRequests.filter(req => req.isOwn));
      setShowDeletePopup(false);
      setRequestToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setRequestToDelete(null);
  };

  const handleRequestPress = (request: any) => {
    // Simple info display
    console.log('Request details:', request);
  };

  const handleCreateNewRequest = () => {
    // Navigate back to MainTabs and then to Post tab
    navigation.navigate('MainTabs', { screen: 'Post' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color="white" />
            </View>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userLocation}>Melstone, MT</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{myRequests.length}</Text>
            <Text style={styles.statLabel}>Requests Posted</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {myRequests.reduce((sum, req) => sum + (req.responses || 0), 0)}
            </Text>
            <Text style={styles.statLabel}>Total Responses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>People Helped</Text>
          </View>
        </View>

        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>My Requests</Text>
          
          {myRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="add-circle" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No requests yet</Text>
              <Text style={styles.emptySubtext}>
                Create your first request to get help from the community
              </Text>
            </View>
          ) : (
            myRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <TouchableOpacity
                  style={styles.requestContent}
                  onPress={() => handleRequestPress(request)}
                >
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestBody}>{request.body}</Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteRequest(request)}
                    >
                      <Ionicons name="trash" size={20} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.requestFooter}>
                    <View style={styles.requestMeta}>
                      <Ionicons name="time" size={16} color="#666" />
                      <Text style={styles.requestMetaText}>{request.when}</Text>
                    </View>
                    
                    <View style={styles.requestMeta}>
                      <Ionicons 
                        name={request.visibility === 'public' ? 'globe' : 'people'} 
                        size={16} 
                        color="#666" 
                      />
                      <Text style={styles.requestMetaText}>
                        {request.visibility === 'public' ? 'Public' : 'Friends'}
                      </Text>
                    </View>
                    
                    <View style={styles.requestMeta}>
                      <Ionicons name="chatbubble" size={16} color="#666" />
                      <Text style={styles.requestMetaText}>
                        {request.responses || 0} responses
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCreateNewRequest}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.actionButtonText}>Create New Request</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <View style={styles.popupOverlay}>
          <View style={styles.deletePopup}>
            <View style={styles.deleteIcon}>
              <Ionicons name="trash" size={50} color="#e74c3c" />
            </View>
            <Text style={styles.deleteTitle}>Delete Request?</Text>
            <Text style={styles.deleteMessage}>
              Are you sure you want to delete "{requestToDelete?.body}"? This action cannot be undone.
            </Text>
            <View style={styles.deleteButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelDelete}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={confirmDelete}
              >
                <Text style={styles.confirmDeleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    paddingTop: 50, // Add extra padding for status bar
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  userLocation: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  requestsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestContent: {
    padding: 16,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestBody: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 22,
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    padding: 8,
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
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
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
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginLeft: 12,
  },
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  deletePopup: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    maxWidth: 320,
  },
  deleteIcon: {
    marginBottom: 20,
  },
  deleteTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  deleteMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 22,
  },
  deleteButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmDeleteButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    marginLeft: 10,
  },
  confirmDeleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
