import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotify } from '../ui/notifications/NotificationProvider';
import { Avatar } from '../ui/components';

type Announcement = {
  id: number;
  title: string;
  body: string;
  photos?: string[];
  city?: string;
  isPinned?: boolean;
  createdAt: string;
  location?: string;
  startsAt?: string;
  attendeeCount?: number;
};

type Comment = {
  id: number;
  body: string;
  userName: string;
  createdAt: string;
  isOwn: boolean;
};

export default function AnnouncementDetail({ navigation, route }: any) {
  const notify = useNotify();
  const { announcement, userName } = route.params;
  const [isAttending, setIsAttending] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(announcement.attendeeCount || 0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock comments data
  useEffect(() => {
    const mockComments: Comment[] = [
      {
        id: 1,
        body: 'I\'ll be there! Looking forward to meeting everyone.',
        userName: 'Sarah Johnson',
        createdAt: '2 hours ago',
        isOwn: false,
      },
      {
        id: 2,
        body: 'Great initiative! Count me in.',
        userName: 'Mike Chen',
        createdAt: '1 hour ago',
        isOwn: false,
      },
      {
        id: 3,
        body: 'Can I bring my kids?',
        userName: 'Emma Davis',
        createdAt: '30 minutes ago',
        isOwn: false,
      },
    ];
    setComments(mockComments);
  }, []);

  const toggleAttend = () => {
    setIsAttending(prev => {
      const newState = !prev;
      setAttendeeCount(prevCount => newState ? prevCount + 1 : prevCount - 1);
      notify.toast({ 
        message: newState ? 'Marked attending!' : 'Attendance removed' 
      });
      return newState;
    });
  };

  const addComment = () => {
    if (!newComment.trim()) {
      notify.banner({
        title: 'Comment Required',
        message: 'Please write a comment before posting.',
        type: 'warning',
        durationMs: 4000
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const comment: Comment = {
        id: Date.now(),
        body: newComment.trim(),
        userName: userName,
        createdAt: 'Just now',
        isOwn: true,
      };
      
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      setIsSubmitting(false);
      
      notify.banner({
        title: 'Comment Posted!',
        message: 'Your comment has been added successfully.',
        type: 'success',
        durationMs: 3000
      });
    }, 500);
  };

  const deleteComment = (commentId: number) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    notify.toast({ message: 'Comment deleted' });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* White Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#2BB673" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Announcement</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.headerDivider} />
      </View>

      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Announcement Content */}
          <View style={styles.announcementSection}>
            {announcement.isPinned && (
              <View style={styles.pinnedBadge}>
                <Ionicons name="pin" size={16} color="#FFFFFF" />
                <Text style={styles.pinnedText}>PINNED</Text>
              </View>
            )}
            
            <Text style={styles.announcementTitle}>{announcement.title}</Text>
            
            <View style={styles.metaInfo}>
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={20} color="#6B7280" />
                <Text style={styles.metaText}>{announcement.createdAt}</Text>
              </View>
              {announcement.city && (
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={20} color="#6B7280" />
                  <Text style={styles.metaText}>{announcement.city}</Text>
                </View>
              )}
              {announcement.location && (
                <View style={styles.metaRow}>
                  <Ionicons name="map-outline" size={20} color="#6B7280" />
                  <Text style={styles.metaText}>{announcement.location}</Text>
                </View>
              )}
              {announcement.startsAt && (
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                  <Text style={styles.metaText}>{announcement.startsAt}</Text>
                </View>
              )}
            </View>

            {announcement.photos && announcement.photos.length > 0 && (
              <Image
                source={{ uri: announcement.photos[0] }}
                style={styles.announcementImage}
                resizeMode="cover"
              />
            )}

            <Text style={styles.announcementBody}>{announcement.body}</Text>
          </View>

          {/* Attend Section */}
          <View style={styles.attendSection}>
            <View style={styles.attendHeader}>
              <Text style={styles.attendTitle}>Are you attending?</Text>
              <View style={styles.attendeeCount}>
                <Ionicons name="people" size={24} color="#2BB673" />
                <Text style={styles.attendeeCountText}>{attendeeCount} attending</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.attendButton, isAttending && styles.attendButtonActive]}
              onPress={toggleAttend}
            >
              <Ionicons 
                name={isAttending ? "checkmark-circle" : "add-circle-outline"} 
                size={24} 
                color={isAttending ? "#FFFFFF" : "#2BB673"} 
              />
              <Text style={[styles.attendText, isAttending && styles.attendTextActive]}>
                {isAttending ? 'Attending' : 'Attend'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
            
            {/* Add Comment */}
            <View style={styles.addCommentSection}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor="#9CA3AF"
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.postButton, (!newComment.trim() || isSubmitting) && styles.postButtonDisabled]}
                onPress={addComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                <Text style={[styles.postButtonText, (!newComment.trim() || isSubmitting) && styles.postButtonTextDisabled]}>
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            {comments.length === 0 ? (
              <View style={styles.noComments}>
                <Ionicons name="chatbubble-outline" size={48} color="#9CA3AF" />
                <Text style={styles.noCommentsText}>No comments yet</Text>
                <Text style={styles.noCommentsSubtext}>Be the first to comment!</Text>
              </View>
            ) : (
              <View style={styles.commentsList}>
                {comments.map((comment) => (
                  <View key={comment.id} style={styles.commentCard}>
                    <View style={styles.commentHeader}>
                      <View style={styles.commentAuthor}>
                        <Avatar size="small" name={comment.userName} style={styles.commentAvatar} />
                        <View style={styles.commentInfo}>
                          <Text style={styles.commentUserName}>{comment.userName}</Text>
                          <Text style={styles.commentTime}>{formatTime(comment.createdAt)}</Text>
                        </View>
                      </View>
                      {comment.isOwn && (
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => deleteComment(comment.id)}
                        >
                          <Ionicons name="trash-outline" size={20} color="#E5484D" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.commentBody}>{comment.body}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
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
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
    marginRight: 24,
  },
  headerSpacer: {
    width: 24,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 24,
  },
  content: {
    flex: 1,
  },
  announcementSection: {
    backgroundColor: '#FFFFFF',
    margin: 24,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#2BB673',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    gap: 6,
  },
  pinnedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  announcementTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 36,
    marginBottom: 20,
  },
  metaInfo: {
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  metaText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
  },
  announcementImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    marginBottom: 20,
  },
  announcementBody: {
    fontSize: 20,
    color: '#374151',
    lineHeight: 28,
  },
  attendSection: {
    backgroundColor: '#FFFFFF',
    margin: 24,
    marginTop: 0,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  attendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  attendTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
  attendeeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attendeeCountText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2BB673',
  },
  attendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2BB673',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    minHeight: 60,
    gap: 12,
  },
  attendButtonActive: {
    backgroundColor: '#2BB673',
  },
  attendText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2BB673',
  },
  attendTextActive: {
    color: '#FFFFFF',
  },
  commentsSection: {
    backgroundColor: '#FFFFFF',
    margin: 24,
    marginTop: 0,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 32,
  },
  commentsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  addCommentSection: {
    marginBottom: 24,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    color: '#000000',
    backgroundColor: '#F9FAFB',
    minHeight: 80,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: '#2BB673',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
    minHeight: 60,
  },
  postButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  postButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  postButtonTextDisabled: {
    color: '#9CA3AF',
  },
  noComments: {
    alignItems: 'center',
    padding: 32,
  },
  noCommentsText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  noCommentsSubtext: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  commentsList: {
    gap: 16,
  },
  commentCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  commentAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  commentAvatar: {
    marginRight: 0,
  },
  commentInfo: {
    flex: 1,
  },
  commentUserName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 16,
    color: '#6B7280',
  },
  deleteButton: {
    padding: 8,
  },
  commentBody: {
    fontSize: 18,
    color: '#374151',
    lineHeight: 24,
  },
});
