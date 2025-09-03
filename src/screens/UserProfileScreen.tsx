import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../ui/components';
import { useNotify } from '../ui/notifications/NotificationProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfileProps {
  navigation: any;
  route: any;
}

export default function UserProfileScreen({ navigation, route }: UserProfileProps) {
  const notify = useNotify();
  const { userName, otherUserName, isOwnProfile = false } = route.params;
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [tempName, setTempName] = useState(otherUserName || '');
  const [tempLocation, setTempLocation] = useState('Melstone, MT');

  // Load phone number for the other user
  useEffect(() => {
    loadOtherUserPhoneNumber();
  }, [otherUserName]);

  const loadOtherUserPhoneNumber = async () => {
    try {
      const savedPhone = await AsyncStorage.getItem(`phoneNumber_${otherUserName}`);
      if (savedPhone) {
        setPhoneNumber(savedPhone);
      }
    } catch (error) {
      console.log('Error loading phone number:', error);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
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

  const handleChatPress = () => {
    // Navigate to chat with this user
    navigation.navigate('Chat', {
      request: { id: 1, title: 'Chat', userName: otherUserName },
      helper: { name: otherUserName },
      userName: userName,
    });
  };

  const handleReportUser = () => {
    Alert.alert(
      'Report User',
      `Are you sure you want to report ${otherUserName}? This will be reviewed by our moderation team.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Report', 
          style: 'destructive',
          onPress: () => {
            notify.banner({
              title: 'User Reported',
              message: `${otherUserName} has been reported to our moderation team.`,
              type: 'success',
              durationMs: 4000
            });
          }
        }
      ]
    );
  };

  const handleBlockUser = () => {
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${otherUserName}? You won't see their requests or be able to message them.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Block', 
          style: 'destructive',
          onPress: () => {
            notify.banner({
              title: 'User Blocked',
              message: `${otherUserName} has been blocked.`,
              type: 'success',
              durationMs: 4000
            });
            // Navigate back after blocking
            setTimeout(() => navigation.goBack(), 2000);
          }
        }
      ]
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

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={64} color="white" />
            </View>
            
            {/* Name Section */}
            {!isEditingName ? (
              <TouchableOpacity
                style={styles.nameContainer}
                onPress={() => isOwnProfile && setIsEditingName(true)}
              >
                <Text style={styles.userName}>{tempName}</Text>
                {isOwnProfile && (
                  <Ionicons name="create" size={16} color="#6B7280" />
                )}
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
                    onPress={() => {
                      setIsEditingName(false);
                      setTempName(otherUserName || '');
                    }}
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
                onPress={() => isOwnProfile && setIsEditingLocation(true)}
              >
                <Text style={styles.userLocation}>📍 {tempLocation}</Text>
                {isOwnProfile && (
                  <Ionicons name="create" size={16} color="#6B7280" />
                )}
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
                    onPress={() => {
                      setIsEditingLocation(false);
                      setTempLocation('Melstone, MT');
                    }}
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
          </View>
        </View>

        {/* Phone Number Section - Only show if user has phone number */}
        {phoneNumber && (
          <View style={styles.phoneSection}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.phoneCard}>
              <View style={styles.phoneContent}>
                <Ionicons name="call" size={24} color="#2BB673" />
                <View style={styles.phoneInfo}>
                  <Text style={styles.phoneLabel}>Phone Number</Text>
                  <Text style={styles.phoneNumber}>{phoneNumber}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.karmaCard}>
            <Ionicons name="star" size={32} color="#FFD700" />
            <Text style={styles.karmaNumber}>18</Text>
            <Text style={styles.karmaLabel}>Karma Points Collected</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Requests</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Responses</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>People Helped</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={handleChatPress}
          >
            <Ionicons name="chatbubble" size={32} color="white" />
            <Text style={styles.chatButtonText}>Send Message</Text>
          </TouchableOpacity>
          
          {!isOwnProfile && (
            <View style={styles.moderationSection}>
              <TouchableOpacity
                style={styles.reportButton}
                onPress={handleReportUser}
              >
                <Ionicons name="flag-outline" size={18} color="#6B7280" />
                <Text style={styles.reportButtonText}>Report User</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.blockButton}
                onPress={handleBlockUser}
              >
                <Ionicons name="ban-outline" size={18} color="#6B7280" />
                <Text style={styles.blockButtonText}>Block User</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
  },
  editNameContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
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
  },
  userLocation: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  editLocationContainer: {
    alignItems: 'center',
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
  phoneSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  phoneCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  phoneContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneInfo: {
    marginLeft: 16,
    flex: 1,
  },
  phoneLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4D4D4D',
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  karmaCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
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
    fontSize: 38,
    fontWeight: '800',
    color: '#FFD700',
    marginTop: 8,
    marginBottom: 6,
    textAlign: 'center',
  },
  karmaLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
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
    justifyContent: 'space-between',
    marginHorizontal: 0,
    paddingTop: 20,
    paddingBottom: 20,
  },
  statNumber: {
    fontSize: 30,
    fontWeight: '800',
    color: '#2BB673',
    marginBottom: 0,
    textAlign: 'center',
    marginTop: 20,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  moderationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  reportButton: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reportButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  blockButton: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  blockButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  chatButton: {
    backgroundColor: '#2BB673',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chatButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 24,
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 24,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
