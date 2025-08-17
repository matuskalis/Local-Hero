import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GratitudeEntry } from '../types';

interface GratitudeCardProps {
  gratitude: GratitudeEntry;
  onPress?: () => void;
}

export const GratitudeCard: React.FC<GratitudeCardProps> = ({ gratitude, onPress }) => {
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
        <Text style={styles.icon}>🙏</Text>
        <Text style={styles.date}>{formatDate(gratitude.created_at)}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>{gratitude.content}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff7e6',
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
    borderLeftColor: '#ffa726',
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
    color: '#8d6e63',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    color: '#5d4037',
    lineHeight: 24,
    fontStyle: 'italic',
  },
}); 