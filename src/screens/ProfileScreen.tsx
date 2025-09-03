import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../ui/components';
import { useNotify } from '../ui/notifications/NotificationProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserStats, UserStats } from '../lib/points';

export default function ProfileScreen({ navigation, route }: any) {
  const notify = useNotify();
  const userName = route?.params?.userName || 'Your Name';
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [tempPhoneNumber, setTempPhoneNumber] = useState('');
  const [tempName, setTempName] = useState(userName);
  const [tempLocation, setTempLocation] = useState('Melstone, MT');
  const [userStats, setUserStats] = useState<UserStats>({
    karmaPoints: 0,
    helpedPeople: 0,
    requestsCreated: 0,
    responsesGiven: 0,
  });

  // Load phone number and user stats from storage on component mount
  React.useEffect(() => {
    loadPhoneNumber();
    loadUserStats();
  }, []);

  // Refresh stats when screen comes into focus (e.g., after accepting offers)
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserStats();
    });
    return unsubscribe;
  }, [navigation]);

  const loadPhoneNumber = async () => {
    try {
      const savedPhone = await AsyncStorage.getItem(`phoneNumber_${userName}`);
      if (savedPhone) {
        setPhoneNumber(savedPhone);
      }
    } catch (error) {
      console.log('Error loading phone number:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const stats = await getUserStats(userName);
      setUserStats(stats);
    } catch (error) {
      console.log('Error loading user stats:', error);
    }
  };

  const savePhoneNumber = async (newPhoneNumber: string) => {
    try {
      await AsyncStorage.setItem(`phoneNumber_${userName}`, newPhoneNumber);
      setPhoneNumber(newPhoneNumber);
      setIsEditingPhone(false);
      notify.banner({
        title: 'Phone Number Saved',
        message: 'Your phone number has been updated.',
        type: 'success',
        durationMs: 3000
      });
    } catch (error) {
      notify.banner({
        title: 'Error',
        message: 'Failed to save phone number. Please try again.',
        type: 'error',
        durationMs: 4000
      });
    }
  };

  const handlePhoneNumberPress = () => {
    if (phoneNumber) {
      // Show current phone number with edit option
      setIsEditingPhone(true);
      setTempPhoneNumber(phoneNumber);
    } else {
      // Add new phone number
      setIsEditingPhone(true);
      setTempPhoneNumber('');
    }
  };

  const handleSavePhoneNumber = () => {
    if (tempPhoneNumber.trim()) {
      savePhoneNumber(tempPhoneNumber.trim());
    } else {
      notify.banner({
        title: 'Invalid Phone Number',
        message: 'Please enter a valid phone number.',
        type: 'warning',
        durationMs: 3000
      });
    }
  };

  const handleCancelPhoneEdit = () => {
    setIsEditingPhone(false);
    setTempPhoneNumber('');
  };

  const handleNamePress = () => {
    setIsEditingName(true);
    setTempName(userName);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      // In real app, this would update the user's name in the database
      notify.banner({
        title: 'Name Updated',
        message: 'Your name has been updated successfully.',
        type: 'success',
        durationMs: 3000
      });
      setIsEditingName(false);
    } else {
      notify.banner({
        title: 'Invalid Name',
        message: 'Please enter a valid name.',
        type: 'warning',
        durationMs: 3000
      });
    }
  };

  const handleCancelNameEdit = () => {
    setIsEditingName(false);
    setTempName(userName);
  };

  const handleLocationPress = () => {
    setIsEditingLocation(true);
    setTempLocation('Melstone, MT');
  };

  const handleSaveLocation = () => {
    if (tempLocation.trim()) {
      // In real app, this would update the user's location in the database
      notify.banner({
        title: 'Location Updated',
        message: 'Your location has been updated successfully.',
        type: 'success',
        durationMs: 3000
      });
      setIsEditingLocation(false);
    } else {
      notify.banner({
        title: 'Invalid Location',
        message: 'Please enter a valid location.',
        type: 'warning',
        durationMs: 3000
      });
    }
  };

  const handleCancelLocationEdit = () => {
    setIsEditingLocation(false);
    setTempLocation('Melstone, MT');
  };

  const handleOutsideClick = () => {
    // Cancel all editing modes when clicking outside
    if (isEditingName) {
      handleCancelNameEdit();
    }
    if (isEditingLocation) {
      handleCancelLocationEdit();
    }
    if (isEditingPhone) {
      handleCancelPhoneEdit();
    }
    Keyboard.dismiss();
  };


  const handleBackPress = () => {
    navigation.goBack();
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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userName');
              navigation.reset({
                index: 0,
                routes: [{ name: 'NameInput' }],
              });
            } catch (error) {
              notify.banner({
                title: 'Error',
                message: 'Failed to delete account. Please try again.',
                type: 'error',
                durationMs: 4000
              });
            }
          },
        },
      ],
    );
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

      <TouchableWithoutFeedback onPress={handleOutsideClick}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity
                style={styles.avatar}
                onPress={handleProfilePicturePress}
              >
                <Ionicons name="person" size={64} color="white" />
              </TouchableOpacity>
              
              {/* Name Section */}
              {!isEditingName ? (
                <TouchableOpacity
                  style={styles.nameContainer}
                  onPress={handleNamePress}
                >
                  <Text style={styles.userName}>{tempName}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.editNameContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={tempName}
                    onChangeText={setTempName}
                    placeholder="Enter name"
                    placeholderTextColor="#9CA3AF"
                    autoFocus
                  />
                  <View style={styles.editNameActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancelNameEdit}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleSaveName}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Location Section */}
              {!isEditingLocation ? (
                <TouchableOpacity
                  style={styles.locationContainer}
                  onPress={handleLocationPress}
                >
                  <Text style={styles.userLocation}>📍 {tempLocation}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.editLocationContainer}>
                  <TextInput
                    style={styles.locationInput}
                    value={tempLocation}
                    onChangeText={setTempLocation}
                    placeholder="Enter location"
                    placeholderTextColor="#9CA3AF"
                    autoFocus
                  />
                  <View style={styles.editLocationActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancelLocationEdit}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleSaveLocation}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              
              {/* Phone Number Section */}
              {!isEditingPhone ? (
                phoneNumber ? (
                  <TouchableOpacity
                    style={styles.phoneContainer}
                    onPress={handlePhoneNumberPress}
                  >
                    <Text style={styles.userPhone}>
                      📞 {phoneNumber}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.addPhoneContainer}
                    onPress={handlePhoneNumberPress}
                  >
                    <Text style={styles.addPhoneText}>
                      📞 Add phone number
                    </Text>
                  </TouchableOpacity>
                )
              ) : (
                <View style={styles.editPhoneContainer}>
                  <TextInput
                    style={styles.phoneInput}
                    value={tempPhoneNumber}
                    onChangeText={setTempPhoneNumber}
                    placeholder="Enter phone number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    autoFocus
                  />
                  <View style={styles.editPhoneActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancelPhoneEdit}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={handleSavePhoneNumber}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

                     {/* Stats Section */}
           <View style={styles.statsSection}>
             <View style={styles.karmaCard}>
               <Ionicons name="star" size={32} color="#FFD700" />
               <Text style={styles.karmaNumber}>{userStats.karmaPoints}</Text>
               <Text style={styles.karmaLabel}>Karma Points Collected</Text>
             </View>
             <View style={styles.statsRow}>
               <View style={styles.statCard}>
                 <Text style={styles.statNumber}>{userStats.requestsCreated}</Text>
                 <Text style={styles.statLabel}>Requests</Text>
               </View>
               <View style={styles.statCard}>
                 <Text style={styles.statNumber}>{userStats.responsesGiven}</Text>
                 <Text style={styles.statLabel}>Responses</Text>
               </View>
               <View style={styles.statCard}>
                 <Text style={styles.statNumber}>{userStats.helpedPeople}</Text>
                 <Text style={styles.statLabel}>People Helped</Text>
               </View>
             </View>
           </View>

          {/* Actions Section */}
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCreateNewRequest}>
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
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
              <Ionicons name="trash" size={24} color="white" />
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
  },
  userLocation: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  userPhone: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addPhoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  addPhoneText: {
    fontSize: 16,
    color: '#2BB673',
    fontWeight: '500',
  },
  editPhoneContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  phoneInput: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  editPhoneActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  editNameContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  nameInput: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  editNameActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  editLocationContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  locationInput: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  editLocationActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  karmaCard: {
    backgroundColor: '#FFFFFF',
    padding: 20, // Reduced from 24 to 20
    borderRadius: 20,
    marginBottom: 12, // Reduced from 16 to 12
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  karmaNumber: {
    fontSize: 38, // Reduced from 42 to 38
    fontWeight: '800',
    color: '#FFD700',
    marginTop: 8, // Reduced from 12 to 8
    marginBottom: 6, // Reduced from 8 to 6
    textAlign: 'center',
  },
  karmaLabel: {
    fontSize: 18, // Reduced from 19 to 18
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 22, // Reduced from 24 to 22
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6, // Reduced from 8 to 6
    gap: 0,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    minHeight: 140,
    justifyContent: 'space-between', // Changed from 'center' to 'space-between'
    marginHorizontal: 0,
    paddingTop: 20, // Added top padding
    paddingBottom: 20, // Added bottom padding
  },
  statNumber: {
    fontSize: 30,
    fontWeight: '800',
    color: '#2BB673',
    marginBottom: 0, // Removed margin since we're using space-between
    textAlign: 'center',
    marginTop: 20, // Added top margin to position numbers consistently
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20, // Added bottom margin to position labels consistently
  },
  requestsSection: {
    paddingHorizontal: 20,
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
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  saveButtonText: {
    color: '#6B7280',
    fontSize: 16,
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
