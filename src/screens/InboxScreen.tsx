import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InboxScreen({ navigation, route }: any) {
  const [messages] = useState([
    {
      id: 1,
      from: 'John Smith',
      subject: 'I can help with shoveling',
      preview: 'Hi! I saw your request for help with shoveling...',
      time: '2 hours ago',
      unread: true,
    },
    {
      id: 2,
      from: 'Mary Johnson',
      subject: 'Grocery pickup available',
      preview: 'Hello! I\'m going to the store tomorrow...',
      time: '1 day ago',
      unread: false,
    },
  ]);

  const insets = useSafeAreaInsets();

  const handleInviteFriends = () => {
    const message = `Need help or want to help people in your neighborhood? Join Local Hero and become my friend: https://localhero.app/download`;
    
    Linking.openURL(`sms:&body=${encodeURIComponent(message)}`);
  };

  const handleMessagePress = (message: any) => {
    // Handle message press
    console.log('Message pressed:', message);
  };

  const handleReply = (message: any) => {
    // Handle reply
    console.log('Reply to:', message);
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>📬 Inbox</Text>
        <Text style={styles.headerSubtitle}>Messages from your community</Text>
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
                      <Text style={styles.messageFrom}>{message.from}</Text>
                      <Text style={styles.messageSubject}>{message.subject}</Text>
                    </View>
                    <View style={styles.messageRight}>
                      <Text style={styles.messageTime}>{message.time}</Text>
                      {message.unread && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>New</Text>
                        </View>
                      )}
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
    backgroundColor: '#2c3e50',
    padding: 28,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
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
});
