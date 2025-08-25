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

  const handleInviteFriends = () => {
    const message = `Need help or want to help people in your neighborhood? Join Local Hero and become my friend: https://localhero.app/download`;
    
    Linking.openURL(`sms:&body=${encodeURIComponent(message)}`);
  };

  const handleMessagePress = (message: any) => {
    // Handle message press
    console.log('Message pressed:', message);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <Text style={styles.headerSubtitle}>Messages from your community</Text>
      </View>

      <ScrollView style={styles.content}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="mail" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              When people respond to your requests, you\'ll see them here
            </Text>
          </View>
        ) : (
          <View style={styles.messagesSection}>
            {messages.map((message) => (
              <TouchableOpacity
                key={message.id}
                style={[styles.messageCard, message.unread && styles.unreadMessage]}
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
            ))}
          </View>
        )}

        <View style={styles.inviteSection}>
          <Text style={styles.sectionTitle}>Grow Your Network</Text>
          <TouchableOpacity
            style={styles.inviteButton}
            onPress={handleInviteFriends}
          >
            <Ionicons name="people" size={28} color="white" />
            <Text style={styles.inviteButtonText}>Invite Friends</Text>
          </TouchableOpacity>
          <Text style={styles.inviteSubtext}>
            Share Local Hero with friends and neighbors to build a stronger community
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  content: {
    flex: 1,
  },
  messagesSection: {
    padding: 20,
  },
  messageCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadMessage: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  messageLeft: {
    flex: 1,
    marginRight: 15,
  },
  messageRight: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  messageFrom: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  messageSubject: {
    fontSize: 16,
    fontWeight: '500',
    color: '#34495e',
    marginBottom: 5,
  },
  messageTime: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  messagePreview: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  unreadBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  unreadText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  inviteSection: {
    padding: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  inviteButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inviteButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginLeft: 12,
  },
  inviteSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
