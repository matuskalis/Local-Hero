import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotify } from '../ui/notifications/NotificationProvider';
import { mockAnnouncements } from './HomeScreen';

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

export default function AnnouncementsScreen({ navigation, route }: any) {
  const notify = useNotify();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pinned' | 'city'>('all');
  const [isAttending, setIsAttending] = useState<Record<number, boolean>>({});
  const userName = route?.params?.userName || 'Your Name';

  // Mock user city (in real app, this would come from profile)
  const userCity = 'Roundup';

  const toggleAttend = (id: number) => {
    setIsAttending(prev => {
      const next = { ...prev, [id]: !prev[id] };
      notify.toast({ message: next[id] ? 'Marked attending' : 'Attendance removed' });
      return next;
    });
  };

  const openAnnouncement = (announcement: Announcement) => {
    navigation.navigate('AnnouncementDetail', { announcement, userName });
  };

  const getFilteredAnnouncements = () => {
    let filtered = [...mockAnnouncements];
    
    switch (selectedFilter) {
      case 'pinned':
        filtered = filtered.filter(a => a.isPinned);
        break;
      case 'city':
        filtered = filtered.filter(a => a.city === userCity);
        break;
      default:
        // 'all' - show all, but pinned first
        filtered.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return 0;
        });
    }
    
    return filtered;
  };

  const filteredAnnouncements = getFilteredAnnouncements();

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* White Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#2BB673" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Announcements</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.headerDivider} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterSection}>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === 'all' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === 'pinned' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('pinned')}
        >
          <Text style={[styles.filterText, selectedFilter === 'pinned' && styles.filterTextActive]}>
            Pinned
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, selectedFilter === 'city' && styles.filterTabActive]}
          onPress={() => setSelectedFilter('city')}
        >
          <Text style={[styles.filterText, selectedFilter === 'city' && styles.filterTextActive]}>
            My City
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredAnnouncements.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="megaphone-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No announcements</Text>
            <Text style={styles.emptySubtext}>
              {selectedFilter === 'pinned' 
                ? 'No pinned announcements yet' 
                : selectedFilter === 'city'
                ? `No announcements for ${userCity} yet`
                : 'No announcements yet'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.announcementsList}>
            {filteredAnnouncements.map((announcement) => (
              <TouchableOpacity
                key={announcement.id}
                style={[styles.announcementCard, announcement.isPinned && styles.pinnedCard]}
                onPress={() => openAnnouncement(announcement)}
              >
                <View style={styles.cardHeader}>
                  {announcement.isPinned && (
                    <View style={styles.pinnedBadge}>
                      <Ionicons name="pin" size={16} color="#FFFFFF" />
                      <Text style={styles.pinnedText}>PINNED</Text>
                    </View>
                  )}
                  <Text style={styles.announcementTitle}>{announcement.title}</Text>
                </View>

                <View style={styles.cardMeta}>
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

                <Text style={styles.announcementBody} numberOfLines={3}>
                  {announcement.body}
                </Text>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.attendButton, isAttending[announcement.id] && styles.attendButtonActive]}
                    onPress={() => toggleAttend(announcement.id)}
                  >
                    <Ionicons 
                      name={isAttending[announcement.id] ? "checkmark-circle" : "add-circle-outline"} 
                      size={20} 
                      color={isAttending[announcement.id] ? "#FFFFFF" : "#2BB673"} 
                    />
                    <Text style={[styles.attendText, isAttending[announcement.id] && styles.attendTextActive]}>
                      {isAttending[announcement.id] ? 'Attending' : 'Attend'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.attendeeInfo}>
                    <Ionicons name="people" size={20} color="#6B7280" />
                    <Text style={styles.attendeeCount}>
                      {announcement.attendeeCount || 0} attending
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.openButton}
                    onPress={() => openAnnouncement(announcement)}
                  >
                    <Text style={styles.openText}>Open</Text>
                    <Ionicons name="chevron-forward" size={20} color="#2BB673" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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
  filterSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#2BB673',
  },
  filterText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 64,
    marginTop: 64,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  announcementsList: {
    padding: 24,
  },
  announcementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pinnedCard: {
    borderLeftWidth: 6,
    borderLeftColor: '#2BB673',
  },
  cardHeader: {
    marginBottom: 16,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#2BB673',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
    gap: 6,
  },
  pinnedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  announcementTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 32,
  },
  cardMeta: {
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  metaText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
  },
  announcementImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },
  announcementBody: {
    fontSize: 18,
    color: '#374151',
    lineHeight: 26,
    marginBottom: 20,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  attendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2BB673',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 28,
    minHeight: 48,
    gap: 8,
  },
  attendButtonActive: {
    backgroundColor: '#2BB673',
  },
  attendText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2BB673',
  },
  attendTextActive: {
    color: '#FFFFFF',
  },
  attendeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attendeeCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 28,
    gap: 8,
  },
  openText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
});
