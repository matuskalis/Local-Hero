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
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { request, helper, userName } = route.params;
  const otherUserName = helper ? helper.name : request.userName;

  // Mock messages data
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: '1',
        text: 'Hi! I can help you with this request.',
        senderId: 'helper',
        senderName: otherUserName,
        timestamp: '2 hours ago',
        isOwn: false,
      },
      {
        id: '2',
        text: 'That would be great! When are you available?',
        senderId: 'user',
        senderName: userName,
        timestamp: '1 hour ago',
        isOwn: true,
      },
      {
        id: '3',
        text: 'I can come tomorrow afternoon around 2 PM. Does that work for you?',
        senderId: 'helper',
        senderName: otherUserName,
        timestamp: '30 minutes ago',
        isOwn: false,
      },
      {
        id: '4',
        text: 'Perfect! That works great. I\'ll see you then.',
        senderId: 'user',
        senderName: userName,
        timestamp: 'Just now',
        isOwn: true,
      },
    ];
    setMessages(mockMessages);
  }, [otherUserName, userName]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      senderId: 'user',
      senderName: userName,
      timestamp: 'Just now',
      isOwn: true,
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
                  msg.isOwn ? styles.ownBubble : styles.otherBubble
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.isOwn ? styles.ownText : styles.otherText
                  ]}
                >
                  {msg.text}
                </Text>
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
});
