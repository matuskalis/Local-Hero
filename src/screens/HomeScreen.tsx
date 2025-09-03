import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotify } from '../ui/notifications/NotificationProvider';
import { Avatar } from '../ui/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { telemetry, logEvent, logScreenView, TELEMETRY_EVENTS } from '../lib/telemetry';

// Shared state for requests - this will be passed between screens
export let sharedRequests: any[] = [
  {
    id: 1,
    userName: 'John Smith',
    body: 'Need help shoveling driveway after snow',
    when: 'This weekend',
    visibility: 'public',
    community: 'Melstone, MT',
    createdAt: '2 hours ago',
    isOwn: false,
    category: 'snow',
    status: 'open',
  },
  {
    id: 2,
    userName: 'Mary Johnson',
    body: 'Help with grocery pickup',
    when: 'Tomorrow',
    visibility: 'public',
    community: 'Melstone, MT',
    createdAt: '1 day ago',
    isOwn: false,
    category: 'grocery',
    status: 'open',
  },
  {
    id: 3,
    userName: 'Your Name',
    body: 'Need help with yard work',
    when: 'Next week',
    visibility: 'public',
    community: 'Melstone, MT',
    createdAt: '3 days ago',
    isOwn: true,
    category: 'yard',
    status: 'open',
    offers: [ // Added offers for your request!
      {
        id: '1',
        helperName: 'Sarah Wilson',
        note: 'I can help with this! I have experience with yard work and I\'m available this weekend.',
        createdAt: '2 hours ago',
      },
      {
        id: '2',
        helperName: 'Mike Johnson',
        note: 'I\'d be happy to help. I have all the necessary tools.',
        createdAt: '1 day ago',
      },
    ],
  },
];

// Mock announcements (no Supabase; crash-safe)
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

export const mockAnnouncements: Announcement[] = [
  {
    id: 101,
    title: 'Town Cleanup – Saturday 10:00',
    body: 'Join us at the Roundup Park for a community cleanup. Gloves and bags provided. All ages welcome!',
    photos: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600'],
    city: 'Roundup',
    location: 'Roundup Park',
    startsAt: 'Saturday 10:00 AM',
    isPinned: true,
    createdAt: '1 hour ago',
    attendeeCount: 23,
  },
  {
    id: 102,
    title: 'Library Tech Help – Tuesday 4PM',
    body: 'Bring your phone or tablet. Volunteers will help install the Local Hero app and answer questions.',
    photos: [],
    city: 'Roundup',
    location: 'Roundup Library',
    startsAt: 'Tuesday 4:00 PM',
    isPinned: false,
    createdAt: 'Yesterday',
    attendeeCount: 8,
  },
  {
    id: 103,
    title: 'Senior Lunch – Thursday 12:00',
    body: 'Free lunch at the Senior Center. All welcome. Great opportunity to meet neighbors!',
    photos: [],
    city: 'Melstone',
    location: 'Senior Center',
    startsAt: 'Thursday 12:00 PM',
    isPinned: false,
    createdAt: '2 days ago',
    attendeeCount: 15,
  },
];

export const addRequest = (request: any) => {
  const newRequest = {
    ...request,
    id: Date.now(),
    createdAt: 'Just now',
    isOwn: true,
    status: 'open',
  };
  sharedRequests.unshift(newRequest);
};

export const deleteRequest = (requestId: number) => {
  const index = sharedRequests.findIndex(req => req.id === requestId);
  if (index > -1) {
    sharedRequests.splice(index, 1);
  }
};

export default function HomeScreen({ navigation, route }: any) {
  const notify = useNotify();
  const [requests, setRequests] = useState(sharedRequests);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isAttending, setIsAttending] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<'announcements' | 'requests'>('announcements');
  const userName = route?.params?.userName || 'Your Name';

  // Cache functions
  const saveToCache = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.log('Error saving to cache:', error);
    }
  };

  const loadFromCache = async (key: string) => {
    try {
      const cached = await AsyncStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.log('Error loading from cache:', error);
      return null;
    }
  };

  // Simulate loading on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Log screen view
        logScreenView('HomeScreen', { 
          activeTab: activeTab,
          userName: userName 
        });
        
        // Try to load from cache first
        const cachedRequests = await loadFromCache('requests_cache');
        const cachedAnnouncements = await loadFromCache('announcements_cache');
        
        if (cachedRequests) {
          setRequests(cachedRequests);
          logEvent('CacheHit', { type: 'requests' });
        }
        if (cachedAnnouncements) {
          setAnnouncements(cachedAnnouncements);
          logEvent('CacheHit', { type: 'announcements' });
        }
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update with fresh data
        const freshRequests = [...sharedRequests];
        const freshAnnouncements = mockAnnouncements;
        
        setRequests(freshRequests);
        setAnnouncements(freshAnnouncements);
        
        // Save to cache
        await saveToCache('requests_cache', freshRequests);
        await saveToCache('announcements_cache', freshAnnouncements);
        
        logEvent('DataLoaded', { 
          requestsCount: freshRequests.length,
          announcementsCount: freshAnnouncements.length 
        });
        
      } catch (err) {
        setError('Failed to load data. Please try again.');
        logEvent('DataLoadError', { error: err });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Refresh requests from shared state
  const refreshRequests = () => {
    setRequests([...sharedRequests]);
  };

  // Listen for navigation focus to refresh
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshRequests();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    refreshRequests();
    logEvent(TELEMETRY_EVENTS.REFRESH_FEED, { 
      activeTab: activeTab,
      requestsCount: requests.length 
    });
    setTimeout(() => {
      setRefreshing(false);
      notify.banner({ 
        title: 'Updated', 
        message: 'Latest content loaded', 
        type: 'success' 
      });
    }, 500);
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonHeader}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.skeletonTextContainer}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonSubtitle} />
            </View>
          </View>
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, { width: '60%' }]} />
          </View>
        </View>
      ))}
    </View>
  );

  // Error state component
  const ErrorState = () => (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle" size={64} color="#E53E3E" />
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => {
        setError(null);
        setLoading(true);
        // Retry loading
        setTimeout(() => {
          setRequests([...sharedRequests]);
          setAnnouncements(mockAnnouncements);
          setLoading(false);
        }, 1000);
      }}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const handleProfilePress = () => {
    navigation.navigate('Profile', { userName, refreshRequests });
  };

  const handleRequestPress = (request: any) => {
    // Navigate to request detail screen
    navigation.navigate('RequestDetail', { request, userName });
    logEvent(TELEMETRY_EVENTS.OPEN_REQUEST, { 
      requestId: request.id,
      requestCategory: request.category,
      isOwnRequest: request.isOwn 
    });
    notify.toast({ message: 'Opening request details...' });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'grocery':
        return '🛒';
      case 'snow':
        return '❄️';
      case 'yard':
        return '🌱';
      default:
        return '📋';
    }
  };

  const openAnnouncement = (a: Announcement) => {
    setSelectedAnnouncement(a);
    notify.banner({ title: 'Announcement', message: a.title, type: 'info' });
  };

  const toggleAttend = (id: number) => {
    setIsAttending(prev => {
      const next = { ...prev, [id]: !prev[id] };
      notify.toast({ message: next[id] ? 'Marked attending' : 'Attendance removed' });
      
      logEvent(TELEMETRY_EVENTS.ANNOUNCEMENT_ATTEND, { 
        announcementId: id,
        isAttending: next[id] 
      });
      
      return next;
    });
  };

  const navigateToAnnouncements = () => {
    navigation.navigate('Announcements', { userName });
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* White Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.myRequestsButton}
            onPress={() => navigation.navigate('MyRequests', { userName })}
          >
            <Ionicons name="list" size={24} color="#2BB673" />
            <Text style={styles.myRequestsText}>My Requests</Text>
          </TouchableOpacity>
          
          <View style={styles.headerSpacer} />
          
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
          >
            <Ionicons name="person" size={32} color="#2BB673" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerDivider} />
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'announcements' && styles.tabButtonActive]}
          onPress={() => {
            setActiveTab('announcements');
            logEvent(TELEMETRY_EVENTS.TAB_SWITCH, { 
              fromTab: activeTab,
              toTab: 'announcements' 
            });
          }}
        >
          <Ionicons 
            name="megaphone" 
            size={20} 
            color={activeTab === 'announcements' ? "#FFFFFF" : "#2BB673"} 
          />
          <Text style={[styles.tabText, activeTab === 'announcements' && styles.tabTextActive]}>
            City
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'requests' && styles.tabButtonActive]}
          onPress={() => {
            setActiveTab('requests');
            logEvent(TELEMETRY_EVENTS.TAB_SWITCH, { 
              fromTab: activeTab,
              toTab: 'requests' 
            });
          }}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={activeTab === 'requests' ? "#FFFFFF" : "#2BB673"} 
          />
          <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
            People
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState />
        ) : (
          <>
            {activeTab === 'announcements' ? (
          /* City Announcements Content */
          <View style={styles.contentSection}>
            {announcements.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="megaphone-outline" size={64} color="#9CA3AF" />
                <Text style={styles.emptyText}>No announcements</Text>
                <Text style={styles.emptySubtext}>Check back later for city updates</Text>
              </View>
            ) : (
              <View style={styles.announcementsContainer}>
                {announcements.map((a) => (
                  <TouchableOpacity
                    key={a.id}
                    style={[styles.annCard, a.isPinned && styles.annPinned]}
                    onPress={() => openAnnouncement(a)}
                  >
                    <View style={styles.annHeader}>
                      {a.isPinned && <Text style={styles.annBadge}>PINNED</Text>}
                      <Text style={styles.annTitle}>{a.title}</Text>
                    </View>
                    <Text style={styles.annMeta}>
                      {a.createdAt}{a.city ? ` • ${a.city}` : ''}
                      {a.location && ` • ${a.location}`}
                    </Text>
                    {!!a.photos?.length && (
                      <Image
                        source={{ uri: a.photos[0] }}
                        style={styles.annImage}
                        resizeMode="cover"
                      />
                    )}
                    <Text style={styles.annBody} numberOfLines={3}>{a.body}</Text>
                    <View style={styles.annActions}>
                      <TouchableOpacity
                        onPress={() => toggleAttend(a.id)}
                        style={[styles.attendBtn, isAttending[a.id] && styles.attendBtnOn]}
                      >
                        <Text style={[styles.attendText, isAttending[a.id] && styles.attendTextOn]}>
                          {isAttending[a.id] ? 'Attending' : 'Attend'}
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.attendeeCount}>
                        <Ionicons name="people" size={20} color="#6B7280" />
                        <Text style={styles.attendeeCountText}>{a.attendeeCount || 0}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          /* People Requests Content */
          <View style={styles.contentSection}>
            {requests.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color="#9CA3AF" />
                <Text style={styles.emptyText}>No requests yet</Text>
                <Text style={styles.emptySubtext}>
                  Be the first to ask for help or wait for others
                </Text>
              </View>
            ) : (
              <View style={styles.requestsContainer}>
                {requests.map((request) => (
                  <TouchableOpacity
                    key={request.id}
                    style={[styles.requestCard, request.isOwn && styles.ownRequestCard]}
                    onPress={() => handleRequestPress(request)}
                  >
                    <View style={styles.requestHeader}>
                      <View style={styles.requestLeft}>
                        <View style={styles.requestTitleRow}>
                          <TouchableOpacity
                            onPress={() => navigation.navigate('UserProfile', { 
                              userName, 
                              otherUserName: request.userName,
                              isOwnProfile: request.isOwn 
                            })}
                          >
                            <Avatar 
                              size="medium" 
                              name={request.userName}
                              style={styles.requestAvatar}
                            />
                          </TouchableOpacity>
                          <Text style={styles.categoryIcon}>
                            {getCategoryIcon(request.category)}
                          </Text>
                          <Text style={styles.requestTitle} numberOfLines={2}>{request.body}</Text>
                        </View>
                        <Text style={styles.requestTime}>{request.createdAt}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.requestFooter}>
                      <View style={styles.requestMeta}>
                        <Ionicons name="time" size={20} color="#4D4D4D" />
                        <Text style={styles.requestMetaText} numberOfLines={2}>{request.when}</Text>
                      </View>
                      
                      <View style={styles.requestMeta}>
                        <Ionicons 
                          name={request.visibility === 'public' ? 'globe' : 'people'} 
                          size={20} 
                          color="#4D4D4D" 
                        />
                        <Text style={styles.requestMetaText} numberOfLines={1}>
                          {request.visibility === 'public' ? 'Public' : 'Friends'}
                        </Text>
                      </View>
                      
                      <View style={styles.requestMeta}>
                        <Ionicons name="location" size={20} color="#4D4D4D" />
                        <Text style={styles.requestMetaText} numberOfLines={2}>{request.community}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.helpSection}>
              <View style={styles.helpCard}>
                <Ionicons name="heart" size={32} color="#2BB673" style={styles.helpIcon} />
                <Text style={styles.helpText}>
                  Tap on any request to see details and offer help
                </Text>
              </View>
            </View>
          </View>
        )}
          </>
        )}
      </ScrollView>

      {/* Announcement Detail Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={!!selectedAnnouncement}
        onRequestClose={() => setSelectedAnnouncement(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedAnnouncement?.title}</Text>
            <Text style={styles.modalMeta}>
              {selectedAnnouncement?.createdAt}{selectedAnnouncement?.city ? ` • ${selectedAnnouncement?.city}` : ''}
              {selectedAnnouncement?.location && ` • ${selectedAnnouncement?.location}`}
            </Text>
            {!!selectedAnnouncement?.photos?.length && (
              <Image
                source={{ uri: selectedAnnouncement?.photos[0] as string }}
                style={styles.modalImage}
                resizeMode="cover"
              />
            )}
            <ScrollView style={{maxHeight: 220}}>
              <Text style={styles.modalBody}>{selectedAnnouncement?.body}</Text>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => selectedAnnouncement && toggleAttend(selectedAnnouncement.id)}
                style={[styles.attendBtn, selectedAnnouncement && isAttending[selectedAnnouncement.id] && styles.attendBtnOn]}
              >
                <Text style={[styles.attendText, selectedAnnouncement && isAttending[selectedAnnouncement.id] && styles.attendTextOn]}>
                  {selectedAnnouncement && isAttending[selectedAnnouncement.id] ? 'Attending' : 'Attend'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedAnnouncement(null)} style={styles.closeBtn}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  myRequestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7EF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 12,
  },
  myRequestsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2BB673',
  },
  profileButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E6F7EF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  tabSwitcher: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 80,
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#2BB673',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2BB673',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  helloSection: {
    backgroundColor: '#FFFFFF',
    padding: 24, // Reduced padding
    margin: 0,
    borderRadius: 20,
    alignItems: 'center',
  },
  helloText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 16, // Reduced from 24 to 16 to move closer to edges
  },
  welcomeSection: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    margin: 0,
    borderRadius: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4D4D4D',
    textAlign: 'center',
    lineHeight: 28,
  },
  annSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    paddingHorizontal: 8, // Small padding for title
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7EF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  seeAllText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2BB673',
  },
  annCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6', // Subtle light gray border
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  annPinned: {
    borderLeftWidth: 6,
    borderLeftColor: '#2BB673',
  },
  annHeader: {
    marginBottom: 8,
  },
  annBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F9F4',
    color: '#2BB673',
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    opacity: 0.8,
  },
  annTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  annMeta: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  annImage: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    marginBottom: 12,
  },
  annBody: {
    fontSize: 18,
    color: '#0B1220',
    marginBottom: 12,
  },
  annActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  attendBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2BB673',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 28,
    minHeight: 48,
  },
  attendBtnOn: {
    backgroundColor: '#2BB673',
  },
  attendText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2BB673',
  },
  attendTextOn: {
    color: '#FFFFFF',
  },
  attendeeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
  },
  attendeeCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  moreBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 28,
  },
  moreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  requestsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6', // Subtle light gray border
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  ownRequestCard: {
    borderLeftWidth: 6,
    borderLeftColor: '#2BB673',
  },
  ownRequestBadge: {
    backgroundColor: '#2BB673',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  ownRequestText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  requestLeft: {
    flex: 1,
  },
  requestTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  requestAvatar: {
    marginRight: 8,
  },
  requestTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    flex: 1,
    lineHeight: 26,
  },
  categoryIcon: {
    fontSize: 24,
  },
  requestUserName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
  },
  requestTime: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  requestBody: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 28,
    marginBottom: 24,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    minWidth: '30%',
  },
  requestMetaText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    marginLeft: 12,
    flexWrap: 'wrap',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  helpSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  helpCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    margin: 0,
    // Removed borderWidth: 1 and borderColor: '#E5E7EB' to eliminate gray lines
  },
  helpText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 28,
  },
  helpIcon: {
    marginBottom: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    marginBottom: 6,
  },
  modalMeta: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    marginBottom: 12,
  },
  modalBody: {
    fontSize: 18,
    color: '#0B1220',
    lineHeight: 26,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  closeBtn: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 28,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  requestsContainer: {
    gap: 8, // Reduced from 16 to 8 (half the spacing)
  },
  announcementsContainer: {
    gap: 8, // Reduced from 16 to 8 (half the spacing)
  },
  // Loading skeleton styles
  skeletonContainer: {
    padding: 20,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  skeletonTextContainer: {
    flex: 1,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 8,
    width: '60%',
  },
  skeletonSubtitle: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    width: '40%',
  },
  skeletonContent: {
    gap: 8,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 7,
    width: '100%',
  },
  // Error state styles
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#2BB673',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
