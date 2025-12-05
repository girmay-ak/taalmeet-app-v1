/**
 * Authentication Provider for Web
 * Manages authentication state and provides auth context
 */

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { CurrentUserProfile } from '../hooks/useAuth';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: CurrentUserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Refs to prevent duplicate fetches
  const hasFetchedProfileForSession = useRef<string | null>(null);
  const isMounted = useRef(true);

  // Fetch profile when session changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) {
        if (isMounted.current) {
          setProfile(null);
          setProfileLoading(false);
          hasFetchedProfileForSession.current = null;
        }
        return;
      }

      // Prevent duplicate fetches for the same session
      if (hasFetchedProfileForSession.current === session.user.id) {
        return;
      }

      hasFetchedProfileForSession.current = session.user.id;
      
      if (isMounted.current) {
        setProfileLoading(true);
      }

      try {
        // Import profile service dynamically to avoid circular dependencies
        // Use alias path to services
        const profileService = await import('@/services/profileService');
        const userProfile = await profileService.getCurrentUserProfile();
        
        if (isMounted.current) {
          setProfile(userProfile);
        }
      } catch (error: any) {
        console.error('Failed to fetch user profile:', error);
        if (isMounted.current) {
          setProfile(null);
        }
      } finally {
        if (isMounted.current) {
          setProfileLoading(false);
        }
      }
    };

    fetchProfile();
  }, [session?.user?.id]);

  // Initialize auth state and listen for changes
  useEffect(() => {
    isMounted.current = true;
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted.current) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted.current) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
      
      // Reset profile when signing out
      if (event === 'SIGNED_OUT') {
        if (isMounted.current) {
          setProfile(null);
          hasFetchedProfileForSession.current = null;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      isMounted.current = false;
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    if (isMounted.current) {
      setProfile(null);
      hasFetchedProfileForSession.current = null;
    }
  };

  // Refresh profile manually (useful after updates)
  const refreshProfile = async () => {
    if (session?.user && isMounted.current) {
      setProfileLoading(true);
      try {
        const profileService = await import('@/services/profileService');
        const userProfile = await profileService.getCurrentUserProfile();
        if (isMounted.current) {
          setProfile(userProfile);
        }
      } catch (error: any) {
        console.error('Failed to refresh profile:', error);
      } finally {
        if (isMounted.current) {
          setProfileLoading(false);
        }
      }
    }
  };

  // Combine loading states
  const isLoading = loading || (!!session && profileLoading);

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      profile,
      loading: isLoading, 
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

