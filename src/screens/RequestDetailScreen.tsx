import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../ui/components';
import { useNotify } from '../ui/notifications/NotificationProvider';
import { addPoints, incrementResponseCount } from '../lib/points';
import { logEvent, TELEMETRY_EVENTS } from '../lib/telemetry';

interface Request {
  id: number;
  userName: string;
  body: string;
  when: string;
  visibility: string;
  community: string;
  createdAt: string;
  isOwn: boolean;
  category: string;
  offers?: Offer[]; // Add offers to the interface
}

interface Offer {
  id: string;
  helperName: string;
  note: string;
  createdAt: string;
}

export default function RequestDetailScreen({ navigation, route }: any) {
  const notify = useNotify();
  const [note, setNote] = useState('');
  const [noteHeight, setNoteHeight] = useState(60);
  const [showOffers, setShowOffers] = useState(route.params?.showOffers || false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const request: Request = route.params?.request;
  const userName = route.params?.userName || 'Your Name';

  // Use useMemo to prevent infinite re-renders
  const requestOffers = useMemo(() => {
    return request?.offers || [];
  }, [request?.offers]);
  
  // Mock offers data - fallback if no offers in request
  const mockOffers: Offer[] = [
    {
      id: '1',
      helperName: 'Sarah Wilson',
      note: 'I can help with this! I have experience with yard work and I\'m available this weekend.',
      createdAt: '2 hours ago',
    },
    {
      id: '2',
      helperName: 'Mike Johnson',
      note: 'I\'d be happy to help. I have all the necessary tools.',
      createdAt: '1 day ago',
    },
    {
      id: '3',
      helperName: 'Tom Davis',
      note: 'I\'m retired and have plenty of time to help. I can do this any day this week.',
      createdAt: '3 hours ago',
    },
  ];

  // Initialize offers with request offers or mock offers - only once
  useEffect(() => {
    if (requestOffers.length > 0) {
      setOffers(requestOffers);
    } else {
      setOffers(mockOffers);
    }
  }, [requestOffers.length]); // Only depend on length, not the array itself

  const handleNoteContentSizeChange = (event: any) => {
    const height = Math.max(60, event.nativeEvent.contentSize.height);
    setNoteHeight(height);
  };

  const handleSubmitOffer = async () => {
    if (!note.trim()) {
      notify.banner({
        title: 'Note Required',
        message: 'Please add a note explaining how you can help.',
        type: 'warning',
        durationMs: 4000
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create new offer
      const newOffer: Offer = {
        id: Date.now().toString(),
        helperName: userName,
        note: note.trim(),
        createdAt: 'Just now',
      };

      // Add to local state only - don't modify request data directly
      setOffers(prev => [newOffer, ...prev]);
      
      // Increment response count for the user
      await incrementResponseCount(userName);
      
      logEvent(TELEMETRY_EVENTS.SUBMIT_OFFER, { 
        requestId: request.id,
        requesterName: request.userName,
        offerLength: note.trim().length 
      });
      
      // Reset form
      setNote('');
      setNoteHeight(60);
      
      notify.banner({
        title: 'Offer Submitted!',
        message: 'Your offer has been sent to the requester. They\'ll review it and get back to you.',
        type: 'success',
        durationMs: 5000
      });
      
      // Automatically navigate to chat with the offer
      navigation.navigate('Chat', {
        request: request,
        helper: { name: request.userName },
        userName: userName,
        offer: newOffer,
      });
      
    } catch (error) {
      notify.banner({
        title: 'Error',
        message: 'Failed to submit offer. Please try again.',
        type: 'error',
        durationMs: 4000
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const handleAcceptOffer = async (offerId: string) => {
    // Find the accepted offer
    const acceptedOffer = offers.find(offer => offer.id === offerId);
    if (acceptedOffer) {
      try {
        // Add karma points to the helper
        await addPoints(
          acceptedOffer.helperName, 
          10, 
          'Help Accepted', 
          request.id.toString()
        );
        
        // Increment response count for the helper
        await incrementResponseCount(acceptedOffer.helperName);
        
        logEvent(TELEMETRY_EVENTS.ACCEPT_OFFER, { 
          offerId,
          helperName: acceptedOffer.helperName,
          requestId: request.id,
          karmaPointsAwarded: 10 
        });
        
        notify.banner({
          title: 'Offer Accepted!',
          message: `${acceptedOffer.helperName} will contact you soon. They earned +10 karma points!`,
          type: 'success',
          durationMs: 5000
        });
        
        // Remove other offers since only one can be accepted
        setOffers([acceptedOffer]);
      } catch (error) {
        console.error('Error processing offer acceptance:', error);
        notify.banner({
          title: 'Error',
          message: 'Failed to process offer acceptance. Please try again.',
          type: 'error',
          durationMs: 4000
        });
      }
    }
  };

  const handleDeclineOffer = (offerId: string) => {
    // Find the declined offer for logging
    const declinedOffer = offers.find(offer => offer.id === offerId);
    
    // Remove the offer from the list
    setOffers(prev => prev.filter(offer => offer.id !== offerId));
    
    if (declinedOffer) {
      logEvent(TELEMETRY_EVENTS.DECLINE_OFFER, { 
        offerId,
        helperName: declinedOffer.helperName,
        requestId: request.id 
      });
    }
    
    notify.banner({
      title: 'Offer Declined',
      message: 'You have declined this offer.',
      type: 'info',
      durationMs: 4000
    });
  };

  const toggleOffers = () => {
    setShowOffers(!showOffers);
    // Don't reload offers - they're already loaded from request data or mock
  };



  if (!request) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Request not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* White Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#2BB673" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.headerDivider} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Request Card */}
        <View style={styles.requestCard}>
          <View style={styles.requestHeader}>
            <View style={styles.requestLeft}>
              <View style={styles.requestTitleRow}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('UserProfile', { 
                    userName, 
                    otherUserName: request.userName,
                    isOwnProfile: request.isOwn 
                  })}
                >
                  <Avatar 
                    size="medium" 
                    name={request.userName}
                    style={styles.requestAvatar}
                  />
                </TouchableOpacity>
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
        </View>

        {/* Offers Section */}
        {request.isOwn && (
          <View style={styles.offersSection}>
            <Text style={styles.offersTitle}>
              Offers ({offers.length})
            </Text>
            
            <View style={styles.offersList}>
              {offers.map((offer) => (
                <View key={offer.id} style={styles.offerCard}>
                  <View style={styles.offerHeader}>
                    <Text style={styles.offerHelperName}>{offer.helperName}</Text>
                    <Text style={styles.offerTime}>{offer.createdAt}</Text>
                  </View>
                  
                  <Text style={styles.offerNote}>{offer.note}</Text>
                  
                  <View style={styles.offerActions}>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptOffer(offer.id)}
                    >
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.declineButton}
                      onPress={() => handleDeclineOffer(offer.id)}
                    >
                      <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Submit Offer Section - Only show if not own request */}
        {!request.isOwn && (
          <View style={styles.submitOfferSection}>
            <Text style={styles.sectionTitle}>Offer to Help</Text>
            <Text style={styles.sectionSubtitle}>
              Let {request.userName} know how you can help
            </Text>
            
            <TextInput
              style={[styles.noteInput, { height: noteHeight }]}
              placeholder="Describe how you can help, when you're available, etc."
              value={note}
              onChangeText={setNote}
              multiline
              textAlignVertical="top"
              maxLength={300}
              onContentSizeChange={handleNoteContentSizeChange}
            />
            <Text style={styles.characterCount}>{note.length}/300</Text>
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!note.trim() || isSubmitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitOffer}
              disabled={!note.trim() || isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Offer'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => navigation.navigate('Chat', { 
                request, 
                helper: { name: userName }, 
                userName 
              })}
            >
              <Ionicons name="chatbubble" size={20} color="#2BB673" />
              <Text style={styles.chatButtonText}>Chat with Requester</Text>
            </TouchableOpacity>
          </View>
        )}
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
    fontSize: 20,
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
  requestCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  ownRequestBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#27ae60',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  ownRequestText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  offersSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  offersHeader: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offersTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  offersList: {
    marginTop: 12,
  },
  offerCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerHelperName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  offerTime: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  offerNote: {
    fontSize: 18,
    color: '#34495e',
    lineHeight: 24,
    marginBottom: 16,
  },
  offerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  acceptButton: {
    backgroundColor: '#2BB673',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 2,
    marginRight: 8,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  declineButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  submitOfferSection: {
    backgroundColor: 'white',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  noteInput: {
    borderWidth: 2,
    borderColor: '#ecf0f1',
    borderRadius: 12,
    padding: 20,
    fontSize: 18,
    backgroundColor: 'white',
    textAlign: 'center',
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
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 20,
    borderRadius: 12,
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatButton: {
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
  chatButtonText: {
    color: '#2BB673',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 20,
    color: '#7f8c8d',
  },
});

