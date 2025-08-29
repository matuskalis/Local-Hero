import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Pressable,
  Text,
  Animated,
  Dimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type NoticeType = 'success' | 'info' | 'warning' | 'error';
type BannerPayload = { title: string; message?: string; type?: NoticeType; durationMs?: number; };
type ToastPayload = { message: string; durationMs?: number; };

type Ctx = { banner: (n: BannerPayload) => void; toast: (t: ToastPayload) => void; };
const NotificationContext = createContext<Ctx | null>(null);

export function useNotify() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotify must be used inside <NotificationProvider/>');
  return ctx;
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [banner, setBanner] = useState<BannerPayload | null>(null);
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const bTimer = useRef<NodeJS.Timeout | null>(null);
  const tTimer = useRef<NodeJS.Timeout | null>(null);

  // Animation values
  const bannerSlideAnim = useRef(new Animated.Value(-200)).current;
  const toastFadeAnim = useRef(new Animated.Value(0)).current;

  const showBanner = useCallback((n: BannerPayload) => {
    if (bTimer.current) clearTimeout(bTimer.current);
    
    setBanner(n);
    
    // Slide in from top
    Animated.spring(bannerSlideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    bTimer.current = setTimeout(() => {
      // Slide out to top
      Animated.spring(bannerSlideAnim, {
        toValue: -200,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start(() => setBanner(null));
    }, n.durationMs ?? 4000);
  }, [bannerSlideAnim]);

  const showToast = useCallback((t: ToastPayload) => {
    if (tTimer.current) clearTimeout(tTimer.current);
    
    setToast(t);
    
    // Fade in
    Animated.spring(toastFadeAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    tTimer.current = setTimeout(() => {
      // Fade out
      Animated.spring(toastFadeAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start(() => setToast(null));
    }, t.durationMs ?? 2500);
  }, [toastFadeAnim]);

  const dismissBanner = useCallback(() => {
    if (bTimer.current) clearTimeout(bTimer.current);
    
    Animated.spring(bannerSlideAnim, {
      toValue: -200,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => setBanner(null));
  }, [bannerSlideAnim]);

  const dismissToast = useCallback(() => {
    if (tTimer.current) clearTimeout(tTimer.current);
    
    Animated.spring(toastFadeAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => setToast(null));
  }, [toastFadeAnim]);

  const value = useMemo(() => ({ 
    banner: showBanner, 
    toast: showToast 
  }), [showBanner, showToast]);

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Banner Notification */}
      {banner && (
        <Animated.View
          style={[
            styles.bannerWrap,
            {
              transform: [{ translateY: bannerSlideAnim }],
            },
          ]}
        >
          <Pressable onPress={dismissBanner} style={[styles.banner, bannerStyle(banner.type)]}>
            <View style={styles.bannerContent}>
              <Ionicons 
                name={getBannerIcon(banner.type)} 
                size={24} 
                color="#FFFFFF" 
                style={styles.bannerIcon}
              />
              <View style={styles.bannerText}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                {!!banner.message && <Text style={styles.bannerMsg}>{banner.message}</Text>}
              </View>
            </View>
          </Pressable>
        </Animated.View>
      )}

      {/* Toast Notification */}
      {toast && (
        <Animated.View
          style={[
            styles.toastWrap,
            {
              opacity: toastFadeAnim,
            },
          ]}
        >
          <Pressable onPress={dismissToast} style={styles.toast}>
            <Text style={styles.toastText}>{toast.message}</Text>
          </Pressable>
        </Animated.View>
      )}
    </NotificationContext.Provider>
  );
};

const getBannerIcon = (type: NoticeType = 'info') => {
  switch (type) {
    case 'success': return 'checkmark-circle';
    case 'warning': return 'warning';
    case 'error': return 'close-circle';
    default: return 'information-circle';
  }
};

const bannerStyle = (type: NoticeType = 'info') => {
  const colors = {
    success: '#2BB673',
    warning: '#FFB020',
    error: '#E5484D',
    info: '#3B82F6',
  };
  return { backgroundColor: colors[type] };
};

const styles = StyleSheet.create({
  bannerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    paddingTop: 50, // Safe area for status bar
  },
  banner: {
    width: '94%',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIcon: {
    marginRight: 12,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerMsg: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
  },

  toastWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 1000,
    paddingBottom: 40, // Safe area for home indicator
  },
  toast: {
    maxWidth: '92%',
    backgroundColor: '#111',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
