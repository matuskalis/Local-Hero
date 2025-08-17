import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GoodDeed } from '../types';

interface GoodDeedCardProps {
  deed: GoodDeed;
  onPress?: () => void;
}

export const GoodDeedCard: React.FC<GoodDeedCardProps> = ({ deed, onPress }) => {
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
      <View style={styles.content}>
        <Text style={styles.description}>{deed.description}</Text>
        <Text style={styles.date}>{formatDate(deed.created_at)}</Text>
      </View>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🐝</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    lineHeight: 22,
  },
  date: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  iconContainer: {
    marginLeft: 16,
  },
  icon: {
    fontSize: 32,
  },
}); 