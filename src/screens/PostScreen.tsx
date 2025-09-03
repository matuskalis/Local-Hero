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
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* White Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>📝 Create New Request</Text>
            <Text style={styles.headerSubtitle}>Help your community know what you need</Text>
          </View>
          <View style={styles.headerDivider} />
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
            <View style={styles.chipContainer}>
              {['Today', 'This weekend', 'Next week', 'Specific date'].map((chip) => (
                <TouchableOpacity
                  key={chip}
                  style={[
                    styles.chip,
                    whenText === chip && styles.chipSelected
                  ]}
                  onPress={() => setWhenText(chip)}
                >
                  <Text style={[
                    styles.chipText,
                    whenText === chip && styles.chipTextSelected
                  ]}>
                    {chip}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {whenText === 'Specific date' && (
              <TextInput
                style={styles.textInput}
                placeholder="Enter specific date (e.g., Dec 25, 2024)"
                value={whenText}
                onChangeText={setWhenText}
                maxLength={50}
              />
            )}
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
    </SafeAreaView>
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
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
  },
  headerContent: {
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
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 20,
    color: '#4D4D4D',
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipSelected: {
    backgroundColor: '#2BB673',
    borderColor: '#2BB673',
  },
  chipText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  chipTextSelected: {
    color: 'white',
  },
});
