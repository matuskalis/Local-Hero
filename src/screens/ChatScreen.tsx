import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../ui/components';
import { useNotify } from '../ui/notifications/NotificationProvider';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isOwn: boolean;
  type?: 'text' | 'offer' | 'accept' | 'decline';
  offerId?: string;
  offerNote?: string;
}

interface ChatScreenProps {
  navigation: any;
  route: any;
}

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const notify = useNotify();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [acceptedOffers, setAcceptedOffers] = useState<string[]>([]);
  const [declinedOffers, setDeclinedOffers] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { request, helper, userName, offer } = route.params;
  const otherUserName = helper ? helper.name : request.userName;

  // Mock messages data with offers
  useEffect(() => {
    let mockMessages: Message[] = [];
    
    // If this is an offer chat, start with the offer message
    if (offer) {
      mockMessages.push({
        id: 'offer-1',
        text: `I can help with: ${request.body}`,
        senderId: 'helper',
        senderName: otherUserName,
        timestamp: '2 hours ago',
        isOwn: false,
        type: 'offer',
        offerId: offer.id,
        offerNote: offer.note,
      });
    } else {
      // Regular chat messages
      mockMessages = [
        {
          id: '1',
          text: 'Hi! I can help you with this request.',
          senderId: 'helper',
          senderName: otherUserName,
          timestamp: '2 hours ago',
          isOwn: false,
          type: 'text',
        },
        {
          id: '2',
          text: 'That would be great! When are you available?',
          senderId: 'user',
          senderName: userName,
          timestamp: '1 hour ago',
          isOwn: true,
          type: 'text',
        },
        {
          id: '3',
          text: 'I can come tomorrow afternoon around 2 PM. Does that work for you?',
          senderId: 'helper',
          senderName: otherUserName,
          timestamp: '30 minutes ago',
          isOwn: false,
          type: 'text',
        },
        {
          id: '4',
          text: 'Perfect! That works great. I\'ll see you then.',
          senderId: 'user',
          senderName: userName,
          timestamp: 'Just now',
          isOwn: true,
          type: 'text',
        },
      ];
    }
    
    setMessages(mockMessages);
  }, [otherUserName, userName, offer, request]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      senderId: 'user',
      senderName: userName,
      timestamp: 'Just now',
      isOwn: true,
      type: 'text',
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Show success toast
    notify.toast({ message: 'Message sent!' });
  };

  const handleAcceptOffer = (offerId: string) => {
    if (acceptedOffers.includes(offerId)) return;

    // Add accept message to chat
    const acceptMessage: Message = {
      id: `accept-${Date.now()}`,
      text: 'Offer accepted! I\'ll contact you soon.',
      senderId: 'user',
      senderName: userName,
      timestamp: 'Just now',
      isOwn: true,
      type: 'accept',
      offerId: offerId,
    };

    setMessages(prev => [...prev, acceptMessage]);
    setAcceptedOffers(prev => [...prev, offerId]);
    
    // Show success notification
    notify.banner({
      title: 'Offer Accepted!',
      message: `${otherUserName} will contact you soon. They earned +10 karma points!`,
      type: 'success',
      durationMs: 5000
    });

    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleDeclineOffer = (offerId: string) => {
    if (declinedOffers.includes(offerId)) return;

    // Add decline message to chat
    const declineMessage: Message = {
      id: `decline-${Date.now()}`,
      text: 'Thank you for your offer, but I\'ve decided to go with someone else.',
      senderId: 'user',
      senderName: userName,
      timestamp: 'Just now',
      isOwn: true,
      type: 'decline',
      offerId: offerId,
    };

    setMessages(prev => [...prev, declineMessage]);
    setDeclinedOffers(prev => [...prev, offerId]);
    
    // Show info notification
    notify.banner({
      title: 'Offer Declined',
      message: 'You have declined this offer.',
      type: 'info',
      durationMs: 4000
    });

    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (timestamp: string) => {
    if (timestamp === 'Just now') return 'Now';
    return timestamp;
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#2BB673" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Avatar 
              size={40} 
              name={otherUserName} 
              style={styles.headerAvatar}
            />
            <View style={styles.headerText}>
              <Text style={styles.headerName}>{otherUserName}</Text>
              <Text style={styles.headerStatus}>Active now</Text>
            </View>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.headerDivider} />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageContainer,
                msg.isOwn ? styles.ownMessage : styles.otherMessage
              ]}
            >
              {!msg.isOwn && (
                <Avatar 
                  size={32} 
                  name={msg.senderName} 
                  style={styles.messageAvatar}
                />
              )}
              <View
                style={[
                  styles.messageBubble,
                  msg.isOwn ? styles.ownBubble : styles.otherBubble,
                  msg.type === 'offer' && styles.offerBubble,
                  msg.type === 'accept' && styles.acceptBubble,
                  msg.type === 'decline' && styles.declineBubble,
                ]}
              >
                {msg.type === 'offer' && (
                  <View style={styles.offerContent}>
                    <Text style={styles.offerTitle}>Help Offer</Text>
                    <Text style={styles.offerText}>{msg.offerNote}</Text>
                    {!msg.isOwn && (
                      <View style={styles.offerActions}>
                        {!acceptedOffers.includes(msg.offerId!) && !declinedOffers.includes(msg.offerId!) && (
                          <>
                            <TouchableOpacity
                              style={styles.acceptButton}
                              onPress={() => handleAcceptOffer(msg.offerId!)}
                            >
                              <Text style={styles.acceptButtonText}>Accept</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.declineButton}
                              onPress={() => handleDeclineOffer(msg.offerId!)}
                            >
                              <Text style={styles.declineButtonText}>Decline</Text>
                            </TouchableOpacity>
                          </>
                        )}
                        {acceptedOffers.includes(msg.offerId!) && (
                          <View style={styles.acceptedButton}>
                            <Text style={styles.acceptedButtonText}>Accepted</Text>
                          </View>
                        )}
                        {declinedOffers.includes(msg.offerId!) && (
                          <View style={styles.declinedButton}>
                            <Text style={styles.declinedButtonText}>Declined</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}
                
                {msg.type !== 'offer' && (
                  <Text
                    style={[
                      styles.messageText,
                      msg.isOwn ? styles.ownText : styles.otherText,
                      msg.type === 'accept' && styles.acceptText,
                      msg.type === 'decline' && styles.declineText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                )}
                
                <Text
                  style={[
                    styles.messageTime,
                    msg.isOwn ? styles.ownTime : styles.otherTime
                  ]}
                >
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={message.trim() ? "#FFFFFF" : "#9CA3AF"} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: 44,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  headerAvatar: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  headerStatus: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  headerSpacer: {
    width: 40,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 16,
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  ownBubble: {
    backgroundColor: '#2BB673',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  ownText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#000000',
  },
  messageTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  ownTime: {
    color: '#FFFFFF',
    textAlign: 'right',
  },
  otherTime: {
    color: '#6B7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#F9FAFB',
  },
  sendButton: {
    backgroundColor: '#2BB673',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  offerBubble: {
    backgroundColor: '#E0F2FE', // Light blue background for offers
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 4,
    padding: 12,
    marginBottom: 8,
    width: '100%', // Full width for offer messages
  },
  offerContent: {
    backgroundColor: '#E0F2FE',
    borderRadius: 10,
    padding: 12,
    width: '100%', // Full width
  },
  offerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  offerText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  offerActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%', // Full width
  },
  acceptButton: {
    backgroundColor: '#2BB673',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptText: {
    color: '#2BB673',
  },
  declineText: {
    color: '#EF4444',
  },
  acceptedButton: {
    backgroundColor: '#2BB673',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%', // Full width
    alignItems: 'center',
  },
  acceptedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  declinedButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%', // Full width
    alignItems: 'center',
  },
  declinedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
