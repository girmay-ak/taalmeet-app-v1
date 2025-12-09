/**
 * Expo Notifications Stub for Web
 * Provides empty implementations for web builds
 */

const notificationsStub = {
  getPermissionsAsync: async () => ({ status: 'undetermined', granted: false, canAskAgain: true }),
  requestPermissionsAsync: async () => ({ status: 'denied', granted: false, canAskAgain: false }),
  getExpoPushTokenAsync: async () => ({ type: 'unknown', data: '' }),
  getDevicePushTokenAsync: async () => ({ type: 'unknown', data: '' }),
  setNotificationHandler: () => {},
  addNotificationReceivedListener: () => ({ remove: () => {} }),
  addNotificationResponseReceivedListener: () => ({ remove: () => {} }),
  scheduleNotificationAsync: async () => '',
  cancelScheduledNotificationAsync: async () => {},
  cancelAllScheduledNotificationsAsync: async () => {},
  dismissNotificationAsync: async () => {},
  dismissAllNotificationsAsync: async () => {},
  getBadgeCountAsync: async () => 0,
  setBadgeCountAsync: async () => {},
};

// Export both default and named exports for compatibility
// Services use: import * as Notifications from 'expo-notifications'
export default notificationsStub;
// Also export all properties as named exports
export const {
  getPermissionsAsync,
  requestPermissionsAsync,
  getExpoPushTokenAsync,
  getDevicePushTokenAsync,
  setNotificationHandler,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  scheduleNotificationAsync,
  cancelScheduledNotificationAsync,
  cancelAllScheduledNotificationsAsync,
  dismissNotificationAsync,
  dismissAllNotificationsAsync,
  getBadgeCountAsync,
  setBadgeCountAsync,
} = notificationsStub;

