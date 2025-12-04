/**
 * Notification Container Component
 * Manages and displays all connection notifications
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConnectionNotifications } from '@/hooks/useConnectionNotifications';
import { ConnectionNotificationComponent } from './ConnectionNotification';

export function NotificationContainer() {
  const {
    notifications,
    removeNotification,
    handleAccept,
    handleReject,
    handleViewProfile,
  } = useConnectionNotifications();

  // Handle accept - the match popup will be shown automatically
  // by the map screen when connection status changes
  const handleAcceptWithMatch = async (connectionId: string) => {
    await handleAccept(connectionId);
    // The map screen will detect the connection status change
    // and show the Match Found popup automatically
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']} pointerEvents="box-none">
      <View style={styles.notificationsList}>
        {notifications.map((notification) => (
          <ConnectionNotificationComponent
            key={notification.id}
            notification={notification}
            onAccept={
              notification.type === 'connection_request' ? handleAcceptWithMatch : undefined
            }
            onReject={
              notification.type === 'connection_request' ? handleReject : undefined
            }
            onViewProfile={handleViewProfile}
            onClose={() => removeNotification(notification.id)}
            autoHideAfter={notification.type === 'connection_accepted' ? 7000 : 10000}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  notificationsList: {
    gap: 8,
  },
});

