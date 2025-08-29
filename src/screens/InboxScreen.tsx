import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../ui/components';
import { useNotify } from '../ui/notifications/NotificationProvider';

export default function InboxScreen({ navigation, route }: any) {
  const notify = useNotify();
  const userName = route?.params?.userName || 'Your Name';
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'offer',
      from: 'Sarah Wilson',
      fromId: 'sarah123',
      subject: 'I can help with yard work!',
      preview: 'Hi! I saw your request for yard work and I\'d be happy to help. I have experience with gardening and I\'m available this weekend.',
      time: '2 hours ago',
      unread: true,
      requestId: 1,
      requestTitle: 'Need help with yard work',
    },
    {
      id: 2,
      type: 'request',
      from: 'Mike Chen',
      fromId: 'mike456',
      subject: 'New request: Help with grocery pickup',
      preview: 'Hi! I just posted a new request for help with grocery pickup. I\'m unable to drive right now due to an injury.',
      time: '1 day ago',
      unread: true,
      requestId: 2,
      requestTitle: 'Help with grocery pickup',
    },
    {
      id: 3,
      type: 'chat',
      from: 'Emma Davis',
      fromId: 'emma789',
      subject: 'Chat: Snow shoveling request',
      preview: 'Great! I can come tomorrow at 2 PM. Does that work for you? I\'ll bring my own shovel.',
      time: '3 hours ago',
      unread: false,
      requestId: 3,
      requestTitle: 'Snow shoveling needed',
    },
    {
      id: 4,
      type: 'offer',
      from: 'Tom Wilson',
      fromId: 'tom101',
      subject: 'Available for snow removal',
      preview: 'Hello! I noticed you need help with snow removal. I have a snow blower and I\'m available this afternoon.',
      time: '4 hours ago',
      unread: true,
      requestId: 4,
      requestTitle: 'Snow removal help needed',
    },
  ]);



  const handleInviteFriends = () => {
    const message = `Need help or want to help people in your neighborhood? Join Local Hero and become my friend: https://localhero.app/download`;
    
    Linking.openURL(`sms:&body=${encodeURIComponent(message)}`);
  };

  const handleMessagePress = (message: any) => {
    // Mark as read
    setMessages(prev => 
      prev.map(msg => 
        msg.id === message.id ? { ...msg, unread: false } : msg
      )
    );

    // Navigate based on message type
    if (message.type === 'chat') {
      // Navigate to chat
      navigation.navigate('Chat', {
        request: { id: message.requestId, title: message.requestTitle, userName: message.from },
        helper: { name: userName },
        userName
      });
    } else if (message.type === 'offer') {
      // Navigate to request detail to see the offer
      navigation.navigate('RequestDetail', {
        request: { id: message.requestId, title: message.requestTitle, userName: message.from },
        userName
      });
    } else if (message.type === 'request') {
      // Navigate to request detail to see the new request
      navigation.navigate('RequestDetail', {
        request: { id: message.requestId, title: message.requestTitle, userName: message.from },
        userName
      });
    }

    notify.toast({ message: `Opening ${message.type}...` });
  };

  const handleReply = (message: any) => {
    // Navigate to chat to reply
    navigation.navigate('Chat', {
      request: { id: message.requestId, title: message.requestTitle, userName: message.from },
      helper: { name: userName },
      userName
    });
    
    notify.toast({ message: 'Opening chat...' });
  };

  const markAllAsRead = () => {
    setMessages(prev => prev.map(msg => ({ ...msg, unread: false })));
    notify.banner({
      title: 'All messages marked as read',
      type: 'success',
      durationMs: 3000
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'offer': return 'Offer';
      case 'request': return 'Request';
      case 'chat': return 'Chat';
      default: return 'Message';
    }
  };

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'offer': return { backgroundColor: '#10B981' }; // Green
      case 'request': return { backgroundColor: '#3B82F6' }; // Blue
      case 'chat': return { backgroundColor: '#8B5CF6' }; // Purple
      default: return { backgroundColor: '#6B7280' }; // Gray
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* White Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>📬 Inbox</Text>
            <Text style={styles.headerSubtitle}>Messages from your community</Text>
          </View>
          <TouchableOpacity
            style={styles.markAllReadButton}
            onPress={markAllAsRead}
          >
            <Ionicons name="checkmark-done" size={20} color="#2BB673" />
            <Text style={styles.markAllReadText}>Mark All Read</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerDivider} />
      </View>

      <ScrollView style={styles.content}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              When people respond to your requests, you\'ll see them here
            </Text>
          </View>
        ) : (
          <View style={styles.messagesSection}>
            {messages.map((message) => (
              <View key={message.id} style={styles.messageCard}>
                <TouchableOpacity
                  style={styles.messageContent}
                  onPress={() => handleMessagePress(message)}
                >
                  <View style={styles.messageHeader}>
                    <View style={styles.messageLeft}>
                      <View style={styles.messageSender}>
                        <Avatar 
                          size={40} 
                          name={message.from} 
                          style={styles.messageAvatar}
                        />
                        <View style={styles.messageInfo}>
                          <Text style={styles.messageFrom}>{message.from}</Text>
                          <Text style={styles.messageSubject}>{message.subject}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.messageRight}>
                      <Text style={styles.messageTime}>{message.time}</Text>
                      <View style={styles.messageBadges}>
                        <View style={[styles.typeBadge, getTypeBadgeStyle(message.type)]}>
                          <Text style={styles.typeBadgeText}>{getTypeLabel(message.type)}</Text>
                        </View>
                        {message.unread && (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>New</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  
                  <Text style={styles.messagePreview}>{message.preview}</Text>
                </TouchableOpacity>

                <View style={styles.messageActions}>
                  <TouchableOpacity
                    style={styles.replyButton}
                    onPress={() => handleReply(message)}
                  >
                    <Ionicons name="chatbubble" size={24} color="white" />
                    <Text style={styles.replyButtonText}>Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.inviteSection}>
          <Text style={styles.sectionTitle}>Grow Your Network 🌱</Text>
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={handleInviteFriends}
          >
            <Ionicons name="people" size={32} color="white" />
            <Text style={styles.inviteButtonText}>Invite Friends</Text>
          </TouchableOpacity>
          <Text style={styles.inviteSubtext}>
            Share Local Hero with friends and neighbors to build a stronger community
          </Text>
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
  },
  headerSubtitle: {
    fontSize: 20,
    color: '#4D4D4D',
  },
  content: {
    flex: 1,
  },
  messagesSection: {
    padding: 20,
  },
  messageCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  messageContent: {
    padding: 24,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  messageLeft: {
    flex: 1,
    marginRight: 20,
  },
  messageRight: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  messageFrom: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  messageSubject: {
    fontSize: 20,
    fontWeight: '500',
    color: '#34495e',
    marginBottom: 6,
  },
  messageTime: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  messagePreview: {
    fontSize: 20,
    color: '#34495e',
    lineHeight: 28,
  },
  unreadBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  unreadText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  messageActions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  replyButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  replyButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 20,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 28,
  },
  inviteSection: {
    padding: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  inviteButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inviteButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    marginLeft: 16,
  },
  inviteSubtext: {
    fontSize: 18,
    color: '#34495e',
    textAlign: 'center',
    lineHeight: 26,
  },
  headerLeft: {
    flex: 1,
  },
  markAllReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2BB673',
  },
  markAllReadText: {
    color: '#2BB673',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  messageSender: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageAvatar: {
    marginRight: 12,
  },
  messageInfo: {
    flex: 1,
  },
  messageBadges: {
    alignItems: 'flex-end',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
