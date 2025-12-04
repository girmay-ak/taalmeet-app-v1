/**
 * Push Notifications Setup Component
 * Sets up push notifications on app launch
 */

import { usePushNotificationsSetup } from '@/hooks/useNotifications';

export function PushNotificationsSetup() {
  usePushNotificationsSetup();
  return null; // This component doesn't render anything
}

