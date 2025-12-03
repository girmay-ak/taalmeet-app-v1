import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import * as profileService from '@/services/profileService';
import { authLogger, logger } from '@/utils/logger';
import type { CurrentUserProfile } from '@/services/profileService';

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
  
  // Refs to prevent duplicate logs and fetches
  const hasLoggedInitialSession = useRef(false);
  const hasFetchedProfileForSession = useRef<string | null>(null);
  const isMounted = useRef(true);

  // Fetch profile when session changes (only once per session)
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
        // Profile already fetched for this session, but ensure it's set
        // This handles cases where component remounts but profile was already fetched
        return;
      }

      hasFetchedProfileForSession.current = session.user.id;
      
      if (isMounted.current) {
        setProfileLoading(true);
      }

      try {
        const userProfile = await profileService.getCurrentUserProfile();
        
        // Always update profile state if we got a result (even if unmounted check fails)
        // This ensures the profile is available for components
        setProfile(userProfile);
        
        // Log profile data when successfully loaded (only once per session)
        if (userProfile) {
          authLogger.profileLoaded(session.user.id, {
            displayName: userProfile.displayName,
            hasAvatar: !!userProfile.avatarUrl,
            hasBio: !!userProfile.bio,
            city: userProfile.city,
            country: userProfile.country,
            learningLanguagesCount: userProfile.languages.learning.length,
            teachingLanguagesCount: userProfile.languages.teaching.length,
          });
        } else {
          logger.warn('AUTH', 'Profile not found for user', {
            userId: session.user.id,
            email: session.user.email,
            action: 'profile_not_found',
          });
        }
      } catch (error: any) {
        logger.error('AUTH', 'Failed to fetch user profile', {
          userId: session.user.id,
          email: session.user.email,
          error: error?.message || 'Unknown error',
          action: 'profile_fetch_error',
        });
        setProfile(null);
      } finally {
        if (isMounted.current) {
          setProfileLoading(false);
        }
      }
    };

    fetchProfile();
  }, [session?.user?.id]);

  useEffect(() => {
    isMounted.current = true;
    
    // Get initial session (don't log here - let onAuthStateChange handle it)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Reset profile when signing out
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        hasLoggedInitialSession.current = false;
        hasFetchedProfileForSession.current = null;
        authLogger.signOut(session?.user?.id);
      }
      
      // Log session changes (only for actual sign in/out events, not token refresh)
      // Prevent duplicate logs by checking if we've already logged for this session
      if (session?.user) {
        if (event === 'SIGNED_IN' && !hasLoggedInitialSession.current) {
          authLogger.sessionEstablished(session.user.id, session.user.email || 'unknown');
          hasLoggedInitialSession.current = true;
        } else if (event === 'TOKEN_REFRESHED' && !hasLoggedInitialSession.current) {
          // Handle case where session exists but we haven't logged yet (initial load)
          authLogger.sessionEstablished(session.user.id, session.user.email || 'unknown');
          hasLoggedInitialSession.current = true;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    if (isMounted.current) {
      setProfile(null);
      hasFetchedProfileForSession.current = null;
      hasLoggedInitialSession.current = false;
    }
  };

  // Refresh profile manually (useful after updates)
  const refreshProfile = async () => {
    if (session?.user && isMounted.current) {
      setProfileLoading(true);
      try {
        const userProfile = await profileService.getCurrentUserProfile();
        if (isMounted.current) {
          setProfile(userProfile);
        }
      } catch (error: any) {
        if (isMounted.current) {
          logger.error('AUTH', 'Failed to refresh profile', {
            userId: session.user.id,
            error: error?.message || 'Unknown error',
          });
        }
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

