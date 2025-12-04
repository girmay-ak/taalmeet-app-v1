/**
 * Match Found Provider
 * Global state for showing Match Found popup from anywhere in the app
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ConnectionWithProfile } from '@/services/connectionsService';

interface MatchFoundContextType {
  matchedConnection: ConnectionWithProfile | null;
  showMatchPopup: boolean;
  showMatch: (connection: ConnectionWithProfile) => void;
  hideMatch: () => void;
}

const MatchFoundContext = createContext<MatchFoundContextType | undefined>(undefined);

export function useMatchFound() {
  const context = useContext(MatchFoundContext);
  if (!context) {
    throw new Error('useMatchFound must be used within MatchFoundProvider');
  }
  return context;
}

interface MatchFoundProviderProps {
  children: React.ReactNode;
}

export function MatchFoundProvider({ children }: MatchFoundProviderProps) {
  const [matchedConnection, setMatchedConnection] = useState<ConnectionWithProfile | null>(null);
  const [showMatchPopup, setShowMatchPopup] = useState(false);

  const showMatch = useCallback((connection: ConnectionWithProfile) => {
    setMatchedConnection(connection);
    setShowMatchPopup(true);
  }, []);

  const hideMatch = useCallback(() => {
    setShowMatchPopup(false);
    // Clear connection after animation completes
    setTimeout(() => {
      setMatchedConnection(null);
    }, 300);
  }, []);

  return (
    <MatchFoundContext.Provider
      value={{
        matchedConnection,
        showMatchPopup,
        showMatch,
        hideMatch,
      }}
    >
      {children}
    </MatchFoundContext.Provider>
  );
}

