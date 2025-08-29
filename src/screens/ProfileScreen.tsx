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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../ui/components';
import { useNotify } from '../ui/notifications/NotificationProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation, route }: any) {
  const notify = useNotify();
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

  const handleProfilePicturePress = () => {
    // Show info about profile picture feature
    notify.banner({
      title: 'Profile Picture',
      message: 'Tap to change your profile picture. This feature will be available soon!',
      type: 'info',
      durationMs: 5000
    });
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
          <Text style={styles.headerTitle}>👤 Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.headerDivider} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={styles.avatar}
              onPress={handleProfilePicturePress}
            >
              <Ionicons name="person" size={64} color="white" />
            </TouchableOpacity>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userLocation}>📍 Melstone, MT</Text>
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
          <Text style={styles.sectionTitle}>My Requests 📋</Text>
          
          {myRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyText}>No requests yet</Text>
              <Text style={styles.emptySubtext}>
                Create your first request to get help from the community
              </Text>
            </View>
          ) : (
            myRequests.map((request) => (
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
                  onPress={() => handleDeleteRequest(request)}
                >
                  <Ionicons name="trash-outline" size={20} color="#E53E3E" />
                  <Text style={styles.deleteButtonText}>Delete Request</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCreateNewRequest}
          >
            <Ionicons name="add-circle" size={32} color="white" />
            <Text style={styles.actionButtonText}>Create New Request</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.leaderboardButton}
            onPress={() => navigation.navigate('Leaderboard', { userName })}
          >
            <Ionicons name="trophy" size={24} color="#2BB673" />
            <Text style={styles.leaderboardButtonText}>View Leaderboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              try {
                await AsyncStorage.removeItem('userName');
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'NameInput' }],
                });
              } catch (error) {
                notify.banner({
                  title: 'Error',
                  message: 'Failed to logout. Please try again.',
                  type: 'error',
                  durationMs: 4000
                });
              }
            }}
          >
            <Ionicons name="log-out" size={24} color="#E5484D" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <View style={styles.popupOverlay}>
          <View style={styles.deletePopup}>
            <Text style={styles.deleteEmoji}>🗑️</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  profileSection: {
    backgroundColor: 'white',
    padding: 28,
    marginBottom: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  userLocation: {
    fontSize: 20,
    color: '#7f8c8d',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 24,
    marginHorizontal: 6,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    fontWeight: '500',
  },
  requestsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
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
  emptyState: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 26,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    marginLeft: 16,
  },
  leaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#2BB673',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  leaderboardButtonText: {
    color: '#2BB673',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#E5484D',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  logoutButtonText: {
    color: '#E5484D',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },

  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  deletePopup: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    maxWidth: 340,
  },
  deleteEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  deleteTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  deleteMessage: {
    fontSize: 20,
    color: '#34495e',
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 28,
  },
  deleteButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 24,
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#34495e',
    fontSize: 18,
    fontWeight: '600',
  },
  confirmDeleteButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 24,
    marginLeft: 12,
  },
  confirmDeleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
