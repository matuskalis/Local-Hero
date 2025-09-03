import AsyncStorage from '@react-native-async-storage/async-storage';

// Telemetry event types
export interface TelemetryEvent {
  id: string;
  event: string;
  userId: string;
  timestamp: number;
  properties?: Record<string, any>;
  sessionId: string;
}

// Key events to track
export const TELEMETRY_EVENTS = {
  // Request events
  OPEN_REQUEST: 'OpenRequest',
  CREATE_REQUEST: 'CreateRequest',
  DELETE_REQUEST: 'DeleteRequest',
  
  // Offer events
  SUBMIT_OFFER: 'SubmitOffer',
  ACCEPT_OFFER: 'AcceptOffer',
  DECLINE_OFFER: 'DeclineOffer',
  
  // Message events
  MESSAGE_SEND: 'MessageSend',
  CHAT_OPEN: 'ChatOpen',
  
  // Profile events
  PROFILE_VIEW: 'ProfileView',
  PHONE_ADD: 'PhoneAdd',
  PHONE_EDIT: 'PhoneEdit',
  
  // Moderation events
  REPORT_USER: 'ReportUser',
  BLOCK_USER: 'BlockUser',
  REPORT_REQUEST: 'ReportRequest',
  
  // Navigation events
  SCREEN_VIEW: 'ScreenView',
  TAB_SWITCH: 'TabSwitch',
  
  // Engagement events
  REFRESH_FEED: 'RefreshFeed',
  ANNOUNCEMENT_ATTEND: 'AnnouncementAttend',
  LEADERBOARD_VIEW: 'LeaderboardView',
} as const;

class TelemetryService {
  private sessionId: string;
  private userId: string;
  private events: TelemetryEvent[] = [];
  private readonly MAX_EVENTS = 1000; // Keep last 1000 events
  private readonly BATCH_SIZE = 50; // Send in batches of 50

  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = 'anonymous';
    this.loadStoredEvents();
  }

  // Initialize with user ID
  setUserId(userId: string) {
    this.userId = userId;
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate unique event ID
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Log an event
  log(event: string, properties?: Record<string, any>) {
    const telemetryEvent: TelemetryEvent = {
      id: this.generateEventId(),
      event,
      userId: this.userId,
      timestamp: Date.now(),
      properties: properties || {},
      sessionId: this.sessionId,
    };

    this.events.push(telemetryEvent);

    // Keep only last MAX_EVENTS
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Store events locally
    this.storeEvents();

    // Log to console in development
    if (__DEV__) {
      console.log('📊 Telemetry Event:', {
        event: telemetryEvent.event,
        userId: telemetryEvent.userId,
        properties: telemetryEvent.properties,
        timestamp: new Date(telemetryEvent.timestamp).toISOString(),
      });
    }

    // Auto-send if batch is full
    if (this.events.length >= this.BATCH_SIZE) {
      this.sendEvents();
    }
  }

  // Store events locally
  private async storeEvents() {
    try {
      await AsyncStorage.setItem('telemetry_events', JSON.stringify(this.events));
    } catch (error) {
      console.log('Error storing telemetry events:', error);
    }
  }

  // Load stored events
  private async loadStoredEvents() {
    try {
      const stored = await AsyncStorage.getItem('telemetry_events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.log('Error loading telemetry events:', error);
    }
  }

  // Send events to server (mock implementation)
  async sendEvents() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      // In a real app, you would send to your analytics service
      // For now, we'll just log and store
      console.log('📤 Sending telemetry batch:', eventsToSend.length, 'events');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Store sent events for debugging
      await AsyncStorage.setItem('telemetry_sent', JSON.stringify(eventsToSend));
      
    } catch (error) {
      console.log('Error sending telemetry events:', error);
      // Put events back if sending failed
      this.events.unshift(...eventsToSend);
    }
  }

  // Get analytics summary
  getAnalyticsSummary() {
    const eventCounts: Record<string, number> = {};
    const userEvents: Record<string, number> = {};
    
    this.events.forEach(event => {
      eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
      userEvents[event.userId] = (userEvents[event.userId] || 0) + 1;
    });

    return {
      totalEvents: this.events.length,
      eventCounts,
      userEvents,
      sessionId: this.sessionId,
      lastEvent: this.events[this.events.length - 1],
    };
  }

  // Clear all events
  async clearEvents() {
    this.events = [];
    await AsyncStorage.removeItem('telemetry_events');
    await AsyncStorage.removeItem('telemetry_sent');
  }
}

// Export singleton instance
export const telemetry = new TelemetryService();

// Helper functions for common events
export const logEvent = (event: string, properties?: Record<string, any>) => {
  telemetry.log(event, properties);
};

export const logScreenView = (screenName: string, properties?: Record<string, any>) => {
  telemetry.log(TELEMETRY_EVENTS.SCREEN_VIEW, {
    screenName,
    ...properties,
  });
};

export const logUserAction = (action: string, properties?: Record<string, any>) => {
  telemetry.log(action, {
    actionType: 'user_action',
    ...properties,
  });
};

export const logError = (error: string, properties?: Record<string, any>) => {
  telemetry.log('Error', {
    error,
    errorType: 'application_error',
    ...properties,
  });
};
