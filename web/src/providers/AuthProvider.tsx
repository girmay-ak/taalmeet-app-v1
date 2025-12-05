/**
 * Auth Provider for Web
 * Manages authentication state and session
 */

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { CurrentUserProfile } from '@/shared/services/profileService';
import * as profileService from '@/shared/services/profileService';

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
  const isMounted = useRef(true);

  // Fetch profile when session changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) {
        if (isMounted.current) {
          setProfile(null);
        }
        return;
      }

      try {
        const userProfile = await profileService.getCurrentUserProfile();
        if (isMounted.current) {
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (isMounted.current) {
          setProfile(null);
        }
      }
    };

    fetchProfile();
  }, [session]);

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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted.current) {
        setSession(session);
        setUser(session?.user ?? null);
      }
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!session?.user) return;

    try {
      const userProfile = await profileService.getCurrentUserProfile();
      if (isMounted.current) {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

