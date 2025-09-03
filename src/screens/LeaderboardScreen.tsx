import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLeaderboardData, getUserRank, getUserStats } from '../lib/points';

interface LeaderboardEntry {
  id: number;
  name: string;
  points: number;
  rank: number;
}

interface LeaderboardScreenProps {
  navigation: any;
  route: any;
}

export default function LeaderboardScreen({ navigation, route }: LeaderboardScreenProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'alltime'>('alltime');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const userName = route?.params?.userName || 'Your Name';

  // Load real leaderboard data
  useEffect(() => {
    loadLeaderboardData();
  }, [userName]);

  // Refresh leaderboard when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadLeaderboardData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadLeaderboardData = async () => {
    try {
      const leaderboard = await getLeaderboardData();
      const formattedData: LeaderboardEntry[] = leaderboard.map((entry, index) => ({
        id: index + 1,
        name: entry.name,
        points: entry.karmaPoints,
        rank: entry.rank,
      }));
      
      setLeaderboardData(formattedData);
      
      // Get user's actual rank
      const userRankData = await getUserRank(userName);
      if (userRankData) {
        setUserRank({ 
          id: 999, 
          name: userName, 
          points: userRankData.points, 
          rank: userRankData.rank 
        });
      }
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
    }
  };

  const getPeriodTitle = () => {
    switch (selectedPeriod) {
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'alltime': return 'All-Time';
      default: return 'All-Time';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#4D4D4D';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* White Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#2BB673" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.headerDivider} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'weekly' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('weekly')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'weekly' && styles.periodButtonTextActive]}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'monthly' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('monthly')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'monthly' && styles.periodButtonTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'alltime' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('alltime')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'alltime' && styles.periodButtonTextActive]}>
              All-Time
            </Text>
          </TouchableOpacity>
        </View>

        {/* Your Rank Card */}
        {userRank && (
          <View style={styles.yourRankCard}>
            <View style={styles.yourRankHeader}>
              <Ionicons name="person-circle" size={32} color="#2BB673" />
              <Text style={styles.yourRankTitle}>Your Rank</Text>
            </View>
            <View style={styles.yourRankContent}>
              <Text style={styles.yourRankName}>{userRank.name}</Text>
              <View style={styles.yourRankStats}>
                <Text style={styles.yourRankPoints}>{userRank.points} points</Text>
                <Text style={styles.yourRankPosition}>#{userRank.rank}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Leaderboard List */}
        <View style={styles.leaderboardSection}>
          <Text style={styles.sectionTitle}>Top Helpers - {getPeriodTitle()}</Text>
          
          {leaderboardData.map((entry) => (
            <View key={entry.id} style={styles.leaderboardCard}>
              <View style={styles.rankSection}>
                <Text style={[styles.rankIcon, { color: getRankColor(entry.rank) }]}>
                  {getRankIcon(entry.rank)}
                </Text>
              </View>
              <View style={styles.entryContent}>
                <Text style={styles.entryName}>{entry.name}</Text>
                <Text style={styles.entryPoints}>{entry.points} points</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <Text style={styles.infoText}>
            You earn +10 points each time you complete a request for someone else.
          </Text>
        </View>
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
    paddingTop: 44,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#2BB673',
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  yourRankCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  yourRankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  yourRankTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 12,
  },
  yourRankContent: {
    alignItems: 'center',
  },
  yourRankName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2BB673',
    marginBottom: 8,
  },
  yourRankStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  yourRankPoints: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4D4D4D',
  },
  yourRankPosition: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2BB673',
  },
  leaderboardSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  leaderboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rankSection: {
    width: 60,
    alignItems: 'center',
  },
  rankIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  entryContent: {
    flex: 1,
    marginLeft: 16,
  },
  entryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  entryPoints: {
    fontSize: 16,
    color: '#4D4D4D',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: '#1E40AF',
    marginLeft: 12,
    lineHeight: 22,
  },
});
