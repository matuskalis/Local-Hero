import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// For development, use placeholder values
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project-ref.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your_supabase_anon_key_here';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types for Local Hero
export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  community: string;
  karma_points: number;
  created_at: string;
  updated_at: string;
}

export interface Request {
  id: string;
  owner_id: string;
  body: string;
  when_text?: string;
  visibility: 'public' | 'friends';
  community: string;
  status: 'open' | 'matched' | 'done' | 'cancelled';
  created_at: string;
  updated_at: string;
  owner?: Profile;
}

export interface Offer {
  id: string;
  request_id: string;
  helper_id: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn';
  created_at: string;
  updated_at: string;
  helper?: Profile;
}

export interface Message {
  id: string;
  request_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'offer_received' | 'offer_accepted' | 'offer_declined' | 'new_message' | 'request_matched';
  data: any;
  read_at?: string;
  created_at: string;
}

export interface Friend {
  id: number;
  owner_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  friend?: Profile;
}

// Helper function to get user profile
export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

// Helper function to update user profile
export const updateUserProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
};

// Local Hero specific functions

// Create a new request
export const createRequest = async (body: string, whenText?: string, visibility: 'public' | 'friends' = 'public'): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('create_request', {
      p_body: body,
      p_when_text: whenText,
      p_visibility: visibility
    });
    
    if (error) {
      console.error('Error creating request:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createRequest:', error);
    return null;
  }
};

// Get requests for the current user's community
export const getRequests = async (): Promise<Request[]> => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        owner:profiles!requests_owner_id_fkey(full_name, community)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching requests:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getRequests:', error);
    return [];
  }
};

// Create an offer to help
export const createOffer = async (requestId: string, message?: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('create_offer', {
      p_request_id: requestId,
      p_message: message
    });
    
    if (error) {
      console.error('Error creating offer:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createOffer:', error);
    return null;
  }
};

// Accept an offer
export const acceptOffer = async (offerId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('accept_offer', {
      p_offer_id: offerId
    });
    
    if (error) {
      console.error('Error accepting offer:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in acceptOffer:', error);
    return false;
  }
};

// Mark request as done
export const markRequestDone = async (requestId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('mark_request_done', {
      p_request_id: requestId
    });
    
    if (error) {
      console.error('Error marking request done:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in markRequestDone:', error);
    return false;
  }
};

// Send a message
export const sendMessage = async (requestId: string, body: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('send_message', {
      p_request_id: requestId,
      p_body: body
    });
    
    if (error) {
      console.error('Error sending message:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return null;
  }
};

// Get messages for a request
export const getMessages = async (requestId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(full_name)
      `)
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getMessages:', error);
    return [];
  }
};

// Get offers for a request
export const getOffers = async (requestId: string): Promise<Offer[]> => {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        helper:profiles!offers_helper_id_fkey(full_name, phone)
      `)
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching offers:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getOffers:', error);
    return [];
  }
};

// Request friendship
export const requestFriendship = async (addresseeId: string): Promise<number | null> => {
  try {
    const { data, error } = await supabase.rpc('request_friendship', {
      p_addressee_id: addresseeId
    });
    
    if (error) {
      console.error('Error requesting friendship:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in requestFriendship:', error);
    return null;
  }
};

// Respond to friendship request
export const respondFriendship = async (friendId: string, accept: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('respond_friendship', {
      p_friend_id: friendId,
      p_accept: accept
    });
    
    if (error) {
      console.error('Error responding to friendship:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in respondFriendship:', error);
    return false;
  }
};

// Get friends list
export const getFriends = async (): Promise<Friend[]> => {
  try {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        *,
        friend:profiles!friends_friend_id_fkey(full_name, community)
      `)
      .or(`owner_id.eq.${(await supabase.auth.getUser()).data.user?.id},friend_id.eq.${(await supabase.auth.getUser()).data.user?.id}`)
      .eq('status', 'accepted');
    
    if (error) {
      console.error('Error fetching friends:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getFriends:', error);
    return [];
  }
};

// Get notifications
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return [];
  }
};

// Mark notification as read
export const markNotificationRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);
    
    if (error) {
      console.error('Error marking notification read:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in markNotificationRead:', error);
    return false;
  }
};

// Mock function for testing when Supabase is not configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://your-project-ref.supabase.co' && 
         supabaseAnonKey !== 'your_supabase_anon_key_here';
};
