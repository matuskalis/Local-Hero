import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface AvatarProps {
  size?: 'small' | 'medium' | 'large';
  source?: string | null;
  name?: string;
  style?: any;
}

export default function Avatar({ size = 'medium', source, name, style }: AvatarProps) {
  const sizeMap = {
    small: 32,
    medium: 48,
    large: 64,
  };

  const fontSizeMap = {
    small: 12,
    medium: 18,
    large: 24,
  };

  const avatarSize = sizeMap[size];
  const fontSize = fontSizeMap[size];

  // If we have a profile picture, display it
  if (source) {
    return (
      <Image
        source={{ uri: source }}
        style={[
          styles.image,
          { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
          style,
        ]}
      />
    );
  }

  // Otherwise, show initials or default avatar
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <View
      style={[
        styles.defaultAvatar,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
        },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  defaultAvatar: {
    backgroundColor: '#2BB673',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: 'white',
    fontWeight: 'bold',
  },
});
