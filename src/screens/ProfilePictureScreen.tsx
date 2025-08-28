import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../ui/components';

interface ProfilePictureScreenProps {
  navigation: any;
  route: any;
}

export default function ProfilePictureScreen({ navigation, route }: ProfilePictureScreenProps) {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const userName = route?.params?.userName || 'Your Name';

  const handleAddPicture = () => {
    // In a real app, this would open image picker
    // For now, we'll simulate adding a picture
    Alert.alert(
      'Add Profile Picture',
      'This would open your photo library or camera. For demo purposes, we\'ll simulate adding a picture.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Add',
          onPress: () => {
            // Simulate adding a profile picture
            setProfilePicture('https://via.placeholder.com/150/2BB673/FFFFFF?text=' + userName.charAt(0));
            Alert.alert('Success!', 'Profile picture added (simulated)');
          },
        },
      ]
    );
  };

  const handleRemovePicture = () => {
    setProfilePicture(null);
    Alert.alert('Removed', 'Profile picture removed');
  };

  const handleBackPress = () => {
    navigation.goBack();
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
            <Ionicons name="arrow-back" size={24} color="#2BB673" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Picture</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.headerDivider} />
      </View>

      <View style={styles.content}>
        <View style={styles.pictureSection}>
          <Text style={styles.sectionTitle}>Your Profile Picture</Text>
          <Text style={styles.sectionSubtitle}>
            Add a photo so people can recognize you
          </Text>

          <View style={styles.avatarContainer}>
            <Avatar 
              size="large" 
              source={profilePicture}
              name={userName}
            />
          </View>

          <View style={styles.buttonContainer}>
            {!profilePicture ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddPicture}
              >
                <Ionicons name="camera" size={24} color="white" />
                <Text style={styles.addButtonText}>Add Profile Picture</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={handleAddPicture}
                >
                  <Ionicons name="camera" size={24} color="#2BB673" />
                  <Text style={styles.changeButtonText}>Change Picture</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={handleRemovePicture}
                >
                  <Ionicons name="trash-outline" size={24} color="#E53E3E" />
                  <Text style={styles.removeButtonText}>Remove Picture</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Why add a profile picture?</Text>
          <Text style={styles.infoText}>
            • People are more likely to help someone they can recognize{'\n'}
            • Builds trust in your community{'\n'}
            • Makes it easier to coordinate when meeting in person
          </Text>
        </View>
      </View>
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
    padding: 24,
  },
  pictureSection: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 18,
    color: '#4D4D4D',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  avatarContainer: {
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  addButton: {
    backgroundColor: '#2BB673',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 25,
    gap: 12,
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  changeButton: {
    backgroundColor: '#F0F9FF',
    borderWidth: 2,
    borderColor: '#2BB673',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 25,
    gap: 12,
  },
  changeButtonText: {
    color: '#2BB673',
    fontSize: 20,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#E53E3E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 25,
    gap: 12,
  },
  removeButtonText: {
    color: '#E53E3E',
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 18,
    color: '#4D4D4D',
    lineHeight: 26,
  },
});
