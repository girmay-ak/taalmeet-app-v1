/**
 * Hook for managing connection request notifications
 */

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useMatchFound } from '@/providers/MatchFoundProvider';
import {
  subscribeToConnectionNotifications,
  getUnreadConnectionRequestCount,
  type ConnectionNotification,
  type NotificationCallback,
} from '@/services/notificationsService';
import { useAcceptRequest, useRejectRequest } from './useConnections';
import * as connectionsService from '@/services/connectionsService';
import { router } from 'expo-router';

export function useConnectionNotifications() {
  const { user } = useAuth();
  const { showMatch } = useMatchFound();
  const [notifications, setNotifications] = useState<ConnectionNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const acceptRequestMutation = useAcceptRequest();
  const rejectRequestMutation = useRejectRequest();

  // Load initial unread count
  useEffect(() => {
    if (user?.id) {
      getUnreadConnectionRequestCount(user.id).then(setUnreadCount);
    }
  }, [user?.id]);

  // Handle new connection request
  const handleConnectionRequest = useCallback((notification: ConnectionNotification) => {
    setNotifications((prev) => [...prev, notification]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  // Handle connection accepted
  const handleConnectionAccepted = useCallback((notification: ConnectionNotification) => {
    setNotifications((prev) => [...prev, notification]);
  }, []);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user?.id) return;

    const callbacks: NotificationCallback = {
      onConnectionRequest: handleConnectionRequest,
      onConnectionAccepted: handleConnectionAccepted,
    };

    const unsubscribe = subscribeToConnectionNotifications(user.id, callbacks);

    return () => {
      unsubscribe();
    };
  }, [user?.id, handleConnectionRequest, handleConnectionAccepted]);

  // Remove notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  // Accept connection request
  const handleAccept = useCallback(
    async (connectionId: string) => {
      if (!user?.id) return;
      
      try {
        // Accept the connection
        await acceptRequestMutation.mutateAsync(connectionId);
        
        // Fetch full connection details with profile for Match Found popup
        try {
          const connection = await connectionsService.getConnectionById(connectionId, user.id);
          if (connection && connection.status === 'accepted') {
            // Show Match Found popup
            showMatch(connection);
          }
        } catch (fetchError) {
          console.error('Failed to fetch connection for match popup:', fetchError);
        }
        
        // Remove notification after accepting
        setNotifications((prev) => prev.filter((n) => n.connectionId !== connectionId));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to accept connection:', error);
      }
    },
    [acceptRequestMutation, user?.id, showMatch]
  );

  // Reject connection request
  const handleReject = useCallback(
    async (connectionId: string) => {
      try {
        await rejectRequestMutation.mutateAsync(connectionId);
        // Remove notification after rejecting
        setNotifications((prev) => prev.filter((n) => n.connectionId !== connectionId));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to reject connection:', error);
      }
    },
    [rejectRequestMutation]
  );

  // View profile
  const handleViewProfile = useCallback((userId: string) => {
    router.push(`/partner/${userId}`);
  }, []);

  return {
    notifications,
    unreadCount,
    removeNotification,
    handleAccept,
    handleReject,
    handleViewProfile,
  };
}

