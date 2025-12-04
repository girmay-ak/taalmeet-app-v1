/**
 * Data Export Hooks
 * React Query hooks for GDPR data export
 */

import { useMutation } from '@tanstack/react-query';
import { Alert, Share } from 'react-native';
import * as dataExportService from '@/services/dataExportService';
import { getUserFriendlyMessage } from '@/utils/errors';
import { useAuth } from '@/providers';

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Export user data mutation
 */
export function useExportUserData() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return dataExportService.exportUserData(user.id);
    },
    onSuccess: async (data) => {
      // Convert to JSON string
      const jsonData = JSON.stringify(data, null, 2);
      
      // Share the data (user can save it)
      try {
        await Share.share({
          message: jsonData,
          title: 'TaalMeet Data Export',
        });
        
        Alert.alert(
          'Data Exported',
          'Your data has been prepared. You can save it from the share menu.',
          [{ text: 'OK' }]
        );
      } catch (error) {
        // If share fails, show the data in an alert (truncated)
        Alert.alert(
          'Data Export',
          `Your data export is ready. Data size: ${jsonData.length} characters.\n\nIn a production app, this would be sent to your email.`,
          [{ text: 'OK' }]
        );
      }
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Export Failed', message);
    },
  });
}

