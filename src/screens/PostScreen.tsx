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

const SUGGESTED_NEEDS = [
  'Bring firewood',
  'Shovel driveway',
  'Grocery pickup',
  'Yard work',
  'Help with technology',
  'Ride to appointment',
  'Pet care',
  'House cleaning',
  'Meal preparation',
  'Garden maintenance'
];

export default function PostScreen({ navigation, route }: any) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const userName = route?.params?.userName || 'Your Name';
  
  // Form data
  const [body, setBody] = useState('');
  const [whenText, setWhenText] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends'>('public');
  const [community, setCommunity] = useState('Melstone, MT');

  const handleSubmit = () => {
    if (!body.trim()) {
      return;
    }

    if (!community.trim()) {
      return;
    }

    // Create request with automatic contact methods
    const newRequest = {
      userName,
      body: body.trim(),
      when: whenText.trim() || 'No specific time',
      visibility,
      community: community.trim(),
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
    // Reset form and go back to first step
    setBody('');
    setWhenText('');
    setVisibility('public');
    setCommunity('Melstone, MT');
    setCurrentStep(1);
    navigation.navigate('Home');
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What do you need help with?</Text>
      <Text style={styles.stepSubtitle}>Describe what you need clearly</Text>
      
      <TextInput
        style={styles.textInput}
        placeholder="e.g., Need help shoveling driveway after snow"
        value={body}
        onChangeText={setBody}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Quick suggestions:</Text>
        <View style={styles.suggestionsGrid}>
          {SUGGESTED_NEEDS.map((need, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionChip}
              onPress={() => setBody(need)}
            >
              <Text style={styles.suggestionText}>{need}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>When do you need help?</Text>
      <Text style={styles.stepSubtitle}>Optional - add timing details</Text>
      
      <TextInput
        style={styles.textInput}
        placeholder="e.g., This weekend, Next week, ASAP"
        value={whenText}
        onChangeText={setWhenText}
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Who can see this?</Text>
      <Text style={styles.stepSubtitle}>Choose visibility</Text>
      
      <TouchableOpacity
        style={[
          styles.visibilityOption,
          visibility === 'public' && styles.visibilityOptionSelected
        ]}
        onPress={() => setVisibility('public')}
      >
        <Ionicons name="globe" size={24} color={visibility === 'public' ? '#4CAF50' : '#666'} />
        <Text style={[styles.visibilityText, visibility === 'public' && styles.visibilityTextSelected]}>
          Public - Everyone in Melstone can see this
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.visibilityOption,
          visibility === 'friends' && styles.visibilityOptionSelected
        ]}
        onPress={() => setVisibility('friends')}
      >
        <Ionicons name="people" size={24} color={visibility === 'friends' ? '#4CAF50' : '#666'} />
        <Text style={[styles.visibilityText, visibility === 'friends' && styles.visibilityTextSelected]}>
          Friends only - Only your friends can see this
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Where are you located?</Text>
      <Text style={styles.stepSubtitle}>Your community</Text>
      
      <TextInput
        style={styles.textInput}
        placeholder="Community name"
        value={community}
        onChangeText={setCommunity}
      />

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#4CAF50" />
        <Text style={styles.infoText}>
          People can contact you via in-app messages and phone calls
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1: return body.trim().length > 0;
      case 2: return true;
      case 3: return true;
      case 4: return community.trim().length > 0;
      default: return false;
    }
  };

  const canGoBack = () => currentStep > 1;

  const handleNext = () => {
    if (canGoNext()) {
      if (currentStep === 4) {
        // Last step - submit automatically
        handleSubmit();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (canGoBack()) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Post a Request</Text>
          <Text style={styles.headerSubtitle}>Step {currentStep} of 4</Text>
        </View>

        <View style={styles.progressContainer}>
          {[1, 2, 3, 4].map((step) => (
            <View key={step} style={styles.progressStep}>
              <View style={[
                styles.progressCircle,
                step <= currentStep && styles.progressCircleActive
              ]}>
                {step < currentStep ? (
                  <Ionicons name="checkmark" size={16} color="white" />
                ) : (
                  <Text style={styles.progressNumber}>{step}</Text>
                )}
              </View>
              {step < 4 && (
                <View style={[
                  styles.progressLine,
                  step < currentStep && styles.progressLineActive
                ]} />
              )}
            </View>
          ))}
        </View>

        {renderCurrentStep()}

        <View style={styles.buttonContainer}>
          {canGoBack() && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color="#666" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          {currentStep < 4 ? (
            <TouchableOpacity
              style={[styles.nextButton, !canGoNext() && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!canGoNext()}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitButton, !canGoNext() && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!canGoNext()}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.submitButtonText}>Post Request</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Success Popup */}
      {showSuccessPopup && (
        <View style={styles.popupOverlay}>
          <View style={styles.successPopup}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Request Sent Successfully!</Text>
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
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
  },
  progressStep: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  progressCircleActive: {
    backgroundColor: '#4CAF50',
  },
  progressNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: '#4CAF50',
  },
  stepContainer: {
    padding: 20,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  suggestionsContainer: {
    marginTop: 20,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  suggestionChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
    width: '48%',
  },
  suggestionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  visibilityOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f8f0',
  },
  visibilityText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 15,
    flex: 1,
  },
  visibilityTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  nextButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  nextButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginRight: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff9800',
    padding: 15,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
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
  successPopup: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    maxWidth: 320,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 22,
  },
  successButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  successButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
