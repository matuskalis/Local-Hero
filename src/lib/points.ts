import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserStats {
  karmaPoints: number;
  helpedPeople: number;
  requestsCreated: number;
  responsesGiven: number;
}

export interface PointsLog {
  id: string;
  userId: string;
  points: number;
  reason: string;
  timestamp: string;
  requestId?: string;
}

// Default stats for new users
const DEFAULT_STATS: UserStats = {
  karmaPoints: 0,
  helpedPeople: 0,
  requestsCreated: 0,
  responsesGiven: 0,
};

// Points awarded for different actions
export const POINTS_CONFIG = {
  HELP_ACCEPTED: 10,        // When someone accepts your help offer
  REQUEST_CREATED: 0,       // Creating a request (no points)
  RESPONSE_GIVEN: 0,        // Giving a response (no points)
  FIRST_HELP: 5,            // Bonus for first time helping someone
  WEEKLY_ACTIVE: 2,         // Bonus for being active in a week
};

/**
 * Get user stats from AsyncStorage
 */
export const getUserStats = async (userName: string): Promise<UserStats> => {
  try {
    const statsJson = await AsyncStorage.getItem(`userStats_${userName}`);
    if (statsJson) {
      return JSON.parse(statsJson);
    }
    return DEFAULT_STATS;
  } catch (error) {
    console.error('Error loading user stats:', error);
    return DEFAULT_STATS;
  }
};

/**
 * Save user stats to AsyncStorage
 */
export const saveUserStats = async (userName: string, stats: UserStats): Promise<void> => {
  try {
    await AsyncStorage.setItem(`userStats_${userName}`, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving user stats:', error);
  }
};

/**
 * Add points to user and log the transaction
 */
export const addPoints = async (
  userName: string, 
  points: number, 
  reason: string, 
  requestId?: string
): Promise<UserStats> => {
  try {
    const currentStats = await getUserStats(userName);
    const newStats: UserStats = {
      ...currentStats,
      karmaPoints: currentStats.karmaPoints + points,
    };

    // If this is for helping someone, increment helped people count
    if (reason === 'Help Accepted' && points > 0) {
      newStats.helpedPeople = currentStats.helpedPeople + 1;
    }

    await saveUserStats(userName, newStats);
    
    // Log the points transaction
    await logPointsTransaction(userName, points, reason, requestId);
    
    return newStats;
  } catch (error) {
    console.error('Error adding points:', error);
    return await getUserStats(userName);
  }
};

/**
 * Log points transaction for audit trail
 */
export const logPointsTransaction = async (
  userName: string,
  points: number,
  reason: string,
  requestId?: string
): Promise<void> => {
  try {
    const logEntry: PointsLog = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userName,
      points,
      reason,
      timestamp: new Date().toISOString(),
      requestId,
    };

    const existingLogs = await getPointsLog(userName);
    const updatedLogs = [logEntry, ...existingLogs].slice(0, 100); // Keep last 100 entries
    
    await AsyncStorage.setItem(`pointsLog_${userName}`, JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('Error logging points transaction:', error);
  }
};

/**
 * Get points transaction log for a user
 */
export const getPointsLog = async (userName: string): Promise<PointsLog[]> => {
  try {
    const logsJson = await AsyncStorage.getItem(`pointsLog_${userName}`);
    if (logsJson) {
      return JSON.parse(logsJson);
    }
    return [];
  } catch (error) {
    console.error('Error loading points log:', error);
    return [];
  }
};

/**
 * Increment request count when user creates a request
 */
export const incrementRequestCount = async (userName: string): Promise<UserStats> => {
  try {
    const currentStats = await getUserStats(userName);
    const newStats: UserStats = {
      ...currentStats,
      requestsCreated: currentStats.requestsCreated + 1,
    };

    await saveUserStats(userName, newStats);
    return newStats;
  } catch (error) {
    console.error('Error incrementing request count:', error);
    return await getUserStats(userName);
  }
};

/**
 * Increment response count when user gives a response
 */
export const incrementResponseCount = async (userName: string): Promise<UserStats> => {
  try {
    const currentStats = await getUserStats(userName);
    const newStats: UserStats = {
      ...currentStats,
      responsesGiven: currentStats.responsesGiven + 1,
    };

    await saveUserStats(userName, newStats);
    return newStats;
  } catch (error) {
    console.error('Error incrementing response count:', error);
    return await getUserStats(userName);
  }
};

/**
 * Get leaderboard data (top users by karma points)
 */
export const getLeaderboardData = async (): Promise<Array<UserStats & { name: string; rank: number }>> => {
  try {
    // In a real app, this would query the database
    // For now, we'll use mock data but could be enhanced to read from AsyncStorage
    const mockLeaderboard = [
      { name: 'Sarah Johnson', karmaPoints: 150, helpedPeople: 15, requestsCreated: 5, responsesGiven: 20, rank: 1 },
      { name: 'Mike Chen', karmaPoints: 120, helpedPeople: 12, requestsCreated: 3, responsesGiven: 18, rank: 2 },
      { name: 'Emma Davis', karmaPoints: 95, helpedPeople: 9, requestsCreated: 4, responsesGiven: 15, rank: 3 },
      { name: 'Tom Wilson', karmaPoints: 80, helpedPeople: 8, requestsCreated: 2, responsesGiven: 12, rank: 4 },
      { name: 'Lisa Brown', karmaPoints: 65, helpedPeople: 6, requestsCreated: 6, responsesGiven: 10, rank: 5 },
      { name: 'David Lee', karmaPoints: 50, helpedPeople: 5, requestsCreated: 1, responsesGiven: 8, rank: 6 },
      { name: 'Anna Garcia', karmaPoints: 45, helpedPeople: 4, requestsCreated: 3, responsesGiven: 7, rank: 7 },
      { name: 'James Miller', karmaPoints: 40, helpedPeople: 4, requestsCreated: 2, responsesGiven: 6, rank: 8 },
      { name: 'Maria Rodriguez', karmaPoints: 35, helpedPeople: 3, requestsCreated: 4, responsesGiven: 5, rank: 9 },
      { name: 'Robert Taylor', karmaPoints: 30, helpedPeople: 3, requestsCreated: 1, responsesGiven: 4, rank: 10 },
    ];

    return mockLeaderboard;
  } catch (error) {
    console.error('Error getting leaderboard data:', error);
    return [];
  }
};

/**
 * Get user's rank in leaderboard
 */
export const getUserRank = async (userName: string): Promise<{ rank: number; points: number } | null> => {
  try {
    const userStats = await getUserStats(userName);
    const leaderboard = await getLeaderboardData();
    
    // Find user's rank
    const sortedLeaderboard = leaderboard.sort((a, b) => b.karmaPoints - a.karmaPoints);
    const userRank = sortedLeaderboard.findIndex(entry => entry.name === userName) + 1;
    
    if (userRank > 0) {
      return { rank: userRank, points: userStats.karmaPoints };
    }
    
    // If user is not in top 10, calculate their rank
    const usersWithMorePoints = sortedLeaderboard.filter(entry => entry.karmaPoints > userStats.karmaPoints).length;
    return { rank: usersWithMorePoints + 1, points: userStats.karmaPoints };
  } catch (error) {
    console.error('Error getting user rank:', error);
    return null;
  }
};
