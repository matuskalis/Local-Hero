import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Achievement } from '../types';
import { useTheme } from '../context/ThemeContext';

interface AchievementBadgeProps {
  achievement: Achievement;
  showAnimation?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  achievement, 
  showAnimation = false 
}) => {
  const { currentTheme } = useTheme();
  const [scaleAnim] = useState(() => new Animated.Value(showAnimation ? 0 : 1));
  const [opacityAnim] = useState(() => new Animated.Value(showAnimation ? 0 : 1));

  useEffect(() => {
    if (showAnimation) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showAnimation, scaleAnim, opacityAnim]);

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          backgroundColor: achievement.unlocked ? currentTheme.cardColor : '#F0F0F0',
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <View style={styles.iconContainer}>
        <Text style={[
          styles.icon,
          { opacity: achievement.unlocked ? 1 : 0.3 }
        ]}>
          {achievement.icon}
        </Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[
          styles.name,
          { 
            color: achievement.unlocked ? currentTheme.textColor : '#999',
            fontWeight: achievement.unlocked ? 'bold' : 'normal'
          }
        ]}>
          {achievement.name}
        </Text>
        
        <Text style={[
          styles.description,
          { color: achievement.unlocked ? currentTheme.textColor : '#999' }
        ]}>
          {achievement.description}
        </Text>
        
        {achievement.unlocked && achievement.unlockedDate && (
          <Text style={[
            styles.unlockedDate,
            { color: currentTheme.accentColor }
          ]}>
            Unlocked {new Date(achievement.unlockedDate).toLocaleDateString()}
          </Text>
        )}
      </View>
      
      {!achievement.unlocked && (
        <View style={styles.lockedOverlay}>
          <Text style={styles.lockedIcon}>🔒</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  iconContainer: {
    marginRight: 16,
  },
  icon: {
    fontSize: 32,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 4,
  },
  unlockedDate: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
}); 