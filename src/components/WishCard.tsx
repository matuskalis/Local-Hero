import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Wish } from '../types';

interface WishCardProps {
  wish: Wish;
  onPress?: () => void;
  onLike?: () => void;
  isLiked?: boolean;
}

export const WishCard: React.FC<WishCardProps> = ({ 
  wish, 
  onPress, 
  onLike, 
  isLiked = false 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sk-SK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.icon}>✨</Text>
        <Text style={styles.date}>{formatDate(wish.created_at)}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>{wish.content}</Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.likeButton} 
          onPress={onLike}
          activeOpacity={0.6}
        >
          <Text style={[styles.likeIcon, isLiked && styles.likedIcon]}>
            {isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={styles.likeCount}>{wish.likes}</Text>
        </TouchableOpacity>
        {wish.user_email && (
          <Text style={styles.userEmail}>od: {wish.user_email}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f3e5f5',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#9c27b0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
  },
  date: {
    fontSize: 14,
    color: '#6a1b9a',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#4a148c',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
  },
  likeIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  likedIcon: {
    transform: [{ scale: 1.1 }],
  },
  likeCount: {
    fontSize: 14,
    color: '#6a1b9a',
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 12,
    color: '#8e24aa',
    fontStyle: 'italic',
  },
}); 