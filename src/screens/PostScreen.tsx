import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addRequest } from './HomeScreen';

export default function PostScreen({ navigation, route }: any) {
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [body, setBody] = useState('');
  const [whenText, setWhenText] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends'>('public');
  const [community, setCommunity] = useState('Melstone, MT');
  const [bodyHeight, setBodyHeight] = useState(60);
  const userName = route?.params?.userName || 'Your Name';

  const handleSubmit = () => {
    if (!body.trim() || !community.trim()) {
      return;
    }

    // Create request with automatic contact methods
    const newRequest = {
      userName,
      body: body.trim(),
      when: whenText.trim() || 'No specific time',
      visibility,
      community: community.trim(),
      category: 'general',
      allowInAppMessages: true,
      allowPhoneCalls: true,
    };

    // Add to shared state
    addRequest(newRequest);

    // Show success popup
    setShowSuccessPopup(true);
  };

  const handleSuccessOK = () => {
    setShowSuccessPopup(false);
    // Reset form
    setBody('');
    setWhenText('');
    setVisibility('public');
    setCommunity('Melstone, MT');
    setBodyHeight(60);
    navigation.navigate('Home');
  };

  const handleBodyContentSizeChange = (event: any) => {
    const height = Math.max(60, event.nativeEvent.contentSize.height);
    setBodyHeight(height);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📝 Create New Request</Text>
          <Text style={styles.headerSubtitle}>Help your community know what you need</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Request Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Describe what you need</Text>
            <TextInput
              style={[styles.textInput, { height: bodyHeight }]}
              placeholder="e.g., Need help shoveling driveway after snow"
              value={body}
              onChangeText={setBody}
              multiline
              textAlignVertical="top"
              maxLength={200}
              onContentSizeChange={handleBodyContentSizeChange}
            />
            <Text style={styles.characterCount}>{body.length}/200</Text>
          </View>

          {/* When */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>When do you need help?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., This weekend, Next week, ASAP"
              value={whenText}
              onChangeText={setWhenText}
              maxLength={50}
            />
            <Text style={styles.characterCount}>{whenText.length}/50</Text>
          </View>

          {/* Visibility */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Who can see this?</Text>
            <TouchableOpacity
              style={[
                styles.visibilityOption,
                visibility === 'public' && styles.visibilityOptionSelected
              ]}
              onPress={() => setVisibility('public')}
            >
              <Text style={styles.visibilityText}>Public - Everyone in Melstone can see this</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.visibilityOption,
                visibility === 'friends' && styles.visibilityOptionSelected
              ]}
              onPress={() => setVisibility('friends')}
            >
              <Text style={styles.visibilityText}>Friends only - Only your friends can see this</Text>
            </TouchableOpacity>
          </View>

          {/* Community */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Where are you located?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Community name"
              value={community}
              onChangeText={setCommunity}
              maxLength={30}
            />
            <Text style={styles.characterCount}>{community.length}/30</Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!body.trim() || !community.trim()) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!body.trim() || !community.trim()}
          >
            <Text style={styles.submitButtonText}>🚀 Post Request</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Popup */}
      {showSuccessPopup && (
        <View style={styles.popupOverlay}>
          <View style={styles.successPopup}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Request Posted Successfully!</Text>
            <Text style={styles.successMessage}>
              Your request for "{body}" has been posted! People in {community} can now see it and offer help.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={handleSuccessOK}
            >
              <Text style={styles.successButtonText}>Great!</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 28,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#ecf0f1',
    borderRadius: 12,
    padding: 20,
    fontSize: 20,
    backgroundColor: 'white',
    textAlignVertical: 'top',
    minHeight: 60,
    maxHeight: 200,
  },
  characterCount: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'right',
    marginTop: 8,
    fontStyle: 'italic',
  },
  visibilityOption: {
    padding: 20,
    borderWidth: 2,
    borderColor: '#ecf0f1',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  visibilityOptionSelected: {
    borderColor: '#27ae60',
    backgroundColor: '#f0f8f0',
  },
  visibilityText: {
    fontSize: 20,
    color: '#2c3e50',
    lineHeight: 26,
  },
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
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
  successPopup: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    maxWidth: 340,
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 20,
    color: '#34495e',
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 28,
  },
  successButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 25,
  },
  successButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
