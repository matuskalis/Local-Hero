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
    photos: ['https://images.unsplash.com/photo-1520975619010-38c5b9a3a3c1?w=600'],
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
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isAttending, setIsAttending] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<'announcements' | 'requests'>('announcements');
  const userName = route?.params?.userName || 'Your Name';

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
    setTimeout(() => {
      setRefreshing(false);
      notify.banner({ 
        title: 'Updated', 
        message: 'Latest content loaded', 
        type: 'success' 
      });
    }, 500);
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile', { userName, refreshRequests });
  };

  const handleRequestPress = (request: any) => {
    // Navigate to request detail screen
    navigation.navigate('RequestDetail', { request, userName });
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

      {/* Hello Section */}
      <View style={styles.helloSection}>
        <Text style={styles.helloText}>Hello, {userName}!</Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'announcements' && styles.tabButtonActive]}
          onPress={() => setActiveTab('announcements')}
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
          onPress={() => setActiveTab('requests')}
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
        {activeTab === 'announcements' ? (
          /* City Announcements Content */
          <View style={styles.contentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest from City</Text>
              <TouchableOpacity style={styles.seeAllButton} onPress={navigateToAnnouncements}>
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="chevron-forward" size={20} color="#2BB673" />
              </TouchableOpacity>
            </View>
            
            {announcements.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="megaphone-outline" size={64} color="#9CA3AF" />
                <Text style={styles.emptyText}>No announcements</Text>
                <Text style={styles.emptySubtext}>Check back later for city updates</Text>
              </View>
            ) : (
              announcements.map((a) => (
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
                    <TouchableOpacity onPress={() => openAnnouncement(a)} style={styles.moreBtn}>
                      <Text style={styles.moreText}>Open</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          /* People Requests Content */
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Community Requests</Text>
            
            {requests.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color="#9CA3AF" />
                <Text style={styles.emptyText}>No requests yet</Text>
                <Text style={styles.emptySubtext}>
                  Be the first to ask for help or wait for others
                </Text>
              </View>
            ) : (
              requests.map((request) => (
                <TouchableOpacity
                  key={request.id}
                  style={[styles.requestCard, request.isOwn && styles.ownRequestCard]}
                  onPress={() => handleRequestPress(request)}
                >
                  <View style={styles.requestHeader}>
                    <View style={styles.requestLeft}>
                      <View style={styles.requestTitleRow}>
                        <Avatar 
                          size="small" 
                          name={request.userName}
                          style={styles.requestAvatar}
                        />
                        <Text style={styles.requestTitle} numberOfLines={2}>{request.body}</Text>
                      </View>
                      <Text style={styles.requestTime}>{request.createdAt}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.requestFooter}>
                    <View style={styles.requestMeta}>
                      <Ionicons name="time" size={20} color="#4D4D4D" />
                      <Text style={styles.requestMetaText} numberOfLines={1}>{request.when}</Text>
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
                      <Text style={styles.requestMetaText} numberOfLines={1}>{request.community}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  welcomeSection: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    margin: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    borderColor: '#E5E7EB',
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
    backgroundColor: '#E6F7EF',
    color: '#2BB673',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 8,
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
    borderColor: '#E5E7EB',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
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
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7280',
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
    fontSize: 18,
    fontWeight: '500',
    color: '#4D4D4D',
    marginLeft: 12,
    flexWrap: 'wrap',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    margin: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4D4D4D',
    textAlign: 'center',
    lineHeight: 26,
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
});
