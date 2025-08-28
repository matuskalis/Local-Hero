import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme';

const { width: screenWidth } = Dimensions.get('window');

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  onPress?: () => void;
}

interface NotificationContextType {
  notify: {
    banner: (notification: Omit<Notification, 'id'>) => void;
    toast: (notification: Omit<Notification, 'id'>) => void;
  };
  clearNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [banners, setBanners] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const bannerAnimations = useRef<{ [key: string]: Animated.Value }>({});
  const toastAnimations = useRef<{ [key: string]: Animated.Value }>({});

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const showBanner = (notification: Omit<Notification, 'id'>) => {
    const id = generateId();
    const newNotification = { ...notification, id, duration: notification.duration || 5000 };
    
    setBanners(prev => [...prev, newNotification]);
    
    // Animate in
    const animation = new Animated.Value(-100);
    bannerAnimations.current[id] = animation;
    
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    // Auto-dismiss
    setTimeout(() => {
      hideBanner(id);
    }, newNotification.duration);

    // Haptic feedback
    if (newNotification.type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (newNotification.type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const showToast = (notification: Omit<Notification, 'id'>) => {
    const id = generateId();
    const newNotification = { ...notification, id, duration: notification.duration || 3000 };
    
    setToasts(prev => [...prev, newNotification]);
    
    // Animate in from bottom
    const animation = new Animated.Value(100);
    toastAnimations.current[id] = animation;
    
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    // Auto-dismiss
    setTimeout(() => {
      hideToast(id);
    }, newNotification.duration);

    // Light haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const hideBanner = (id: string) => {
    const animation = bannerAnimations.current[id];
    if (animation) {
      Animated.timing(animation, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setBanners(prev => prev.filter(n => n.id !== id));
        delete bannerAnimations.current[id];
      });
    }
  };

  const hideToast = (id: string) => {
    const animation = toastAnimations.current[id];
    if (animation) {
      Animated.timing(animation, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setToasts(prev => prev.filter(n => n.id !== id));
        delete toastAnimations.current[id];
      });
    }
  };

  const clearNotification = (id: string) => {
    if (banners.find(b => b.id === id)) {
      hideBanner(id);
    } else if (toasts.find(t => t.id === id)) {
      hideToast(id);
    }
  };

  const getNotificationStyle = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return { backgroundColor: theme.colors.success, icon: 'checkmark-circle' };
      case 'error':
        return { backgroundColor: theme.colors.error, icon: 'close-circle' };
      case 'warning':
        return { backgroundColor: theme.colors.warning, icon: 'warning' };
      case 'info':
        return { backgroundColor: theme.colors.info, icon: 'information-circle' };
      default:
        return { backgroundColor: theme.colors.accent, icon: 'information-circle' };
    }
  };

  const value: NotificationContextType = {
    notify: {
      banner: showBanner,
      toast: showToast,
    },
    clearNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Banner Notifications */}
      {banners.map((notification) => {
        const style = getNotificationStyle(notification.type);
        const animation = bannerAnimations.current[notification.id];
        
        return (
          <Animated.View
            key={notification.id}
            style={[
              styles.banner,
              { backgroundColor: style.backgroundColor },
              { transform: [{ translateY: animation || new Animated.Value(-100) }] },
            ]}
          >
            <View style={styles.bannerContent}>
              <Ionicons name={style.icon as any} size={28} color="white" />
              <View style={styles.bannerText}>
                {notification.title && (
                  <Text style={styles.bannerTitle}>{notification.title}</Text>
                )}
                <Text style={styles.bannerMessage}>{notification.message}</Text>
              </View>
              <TouchableOpacity
                style={styles.bannerClose}
                onPress={() => hideBanner(notification.id)}
                accessibilityLabel="Close notification"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
      })}
      
      {/* Toast Notifications */}
      {toasts.map((notification) => {
        const style = getNotificationStyle(notification.type);
        const animation = toastAnimations.current[notification.id];
        
        return (
          <Animated.View
            key={notification.id}
            style={[
              styles.toast,
              { backgroundColor: style.backgroundColor },
              { transform: [{ translateY: animation || new Animated.Value(100) }] },
            ]}
          >
            <View style={styles.toastContent}>
              <Ionicons name={style.icon as any} size={24} color="white" />
              <Text style={styles.toastMessage}>{notification.message}</Text>
            </View>
          </Animated.View>
        );
      })}
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: theme.spacing.md,
    ...theme.shadows.lg,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    ...theme.typography.titleSmall,
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  bannerMessage: {
    ...theme.typography.body,
    color: 'white',
    lineHeight: 22,
  },
  bannerClose: {
    padding: theme.spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    zIndex: 1000,
    borderRadius: theme.borderRadius.pill,
    ...theme.shadows.lg,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  toastMessage: {
    ...theme.typography.body,
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
});
