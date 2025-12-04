/**
 * Global Match Found Popup Component
 * Can be shown from anywhere in the app via MatchFoundProvider
 */

import React from 'react';
import { useMatchFound } from '@/providers/MatchFoundProvider';
import { MatchFoundPopup } from './MatchFoundPopup';
import { useAuth } from '@/providers';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { router } from 'expo-router';

export function GlobalMatchFoundPopup() {
  const { matchedConnection, showMatchPopup, hideMatch } = useMatchFound();
  const { profile } = useAuth();
  const { data: currentUser } = useCurrentUser();

  return (
    <MatchFoundPopup
      isVisible={showMatchPopup}
      connection={matchedConnection}
      currentUser={
        profile && currentUser
          ? {
              displayName: profile.display_name || 'You',
              avatarUrl: profile.avatar_url,
              languages: profile.languages
                ? [
                    ...(profile.languages.teaching || []).map((lang) => ({
                      id: '',
                      user_id: currentUser.id,
                      language: lang.language,
                      level: (lang.level || 'native') as
                        | 'native'
                        | 'advanced'
                        | 'intermediate'
                        | 'beginner'
                        | null,
                      role: 'teaching' as const,
                      created_at: '',
                      updated_at: '',
                    })),
                    ...(profile.languages.learning || []).map((lang) => ({
                      id: '',
                      user_id: currentUser.id,
                      language: lang.language,
                      level: (lang.level || 'beginner') as
                        | 'native'
                        | 'advanced'
                        | 'intermediate'
                        | 'beginner'
                        | null,
                      role: 'learning' as const,
                      created_at: '',
                      updated_at: '',
                    })),
                  ]
                : [],
            }
          : null
      }
      onClose={hideMatch}
      onSendMessage={(partnerId) => {
        hideMatch();
        router.push(`/chat/${partnerId}`);
      }}
      onViewProfile={(partnerId) => {
        hideMatch();
        router.push(`/partner/${partnerId}`);
      }}
    />
  );
}

