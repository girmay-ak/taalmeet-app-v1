/**
 * Admin Report Detail Screen
 * View and manage individual reports
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import {
  useReport,
  useUpdateReportStatus,
  useCreateUserAction,
  useLinkActionToReport,
} from '@/hooks/useModeration';
import { useIsAdmin } from '@/hooks/useModeration';
import { useAuth } from '@/providers';
import { Redirect } from 'expo-router';
import { ActionModal } from '@/components/modals/ActionModal';

export default function AdminReportDetailScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: isAdminUser } = useIsAdmin(user?.id);
  const { data: report, isLoading } = useReport(id);
  const updateStatusMutation = useUpdateReportStatus();
  const createActionMutation = useCreateUserAction();
  const linkActionMutation = useLinkActionToReport();
  const [showActionModal, setShowActionModal] = useState(false);

  // Redirect if not admin
  if (isAdminUser !== true) {
    return <Redirect href="/(tabs)" />;
  }

  if (isLoading || !report) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text.primary }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.semantic.warning;
      case 'reviewing':
        return colors.primary;
      case 'resolved':
        return colors.semantic.success;
      case 'dismissed':
        return colors.text.muted;
      case 'action_taken':
        return colors.semantic.error;
      default:
        return colors.text.muted;
    }
  };

  const handleUpdateStatus = async (status: string, notes?: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        reportId: report.id,
        status: status as any,
        adminNotes: notes,
      });
      Alert.alert('Success', 'Report status updated');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleTakeAction = async (actionData: {
    action_type: 'warning' | 'suspension' | 'ban';
    reason: string;
    details?: string;
    duration_days?: number;
  }) => {
    try {
      const action = await createActionMutation.mutateAsync({
        user_id: report.target_id,
        ...actionData,
      });

      // Link action to report
      await linkActionMutation.mutateAsync({
        reportId: report.id,
        actionId: action.id,
      });

      Alert.alert('Success', 'Action taken and linked to report');
      setShowActionModal(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Report Details
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Status Badge */}
        <View style={styles.statusSection}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(report.status) + '20' },
            ]}
          >
            <Text
              style={[styles.statusBadgeText, { color: getStatusColor(report.status) }]}
            >
              {report.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.reportDate, { color: colors.text.muted }]}>
            Reported {formatDate(report.created_at)}
          </Text>
        </View>

        {/* Report Info */}
        <View style={[styles.section, { backgroundColor: colors.background.secondary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Report Reason
          </Text>
          <Text style={[styles.reasonText, { color: colors.text.primary }]}>
            {report.reason}
          </Text>
          {report.message && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text.primary, marginTop: 16 }]}>
                Details
              </Text>
              <Text style={[styles.messageText, { color: colors.text.secondary }]}>
                {report.message}
              </Text>
            </>
          )}
        </View>

        {/* Users Involved */}
        <View style={[styles.section, { backgroundColor: colors.background.secondary }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Users Involved
          </Text>
          <View style={styles.userRow}>
            <View style={styles.userInfo}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
              <View style={styles.userDetails}>
                <Text style={[styles.userLabel, { color: colors.text.muted }]}>
                  Reporter
                </Text>
                <Text style={[styles.userName, { color: colors.text.primary }]}>
                  {report.reporter?.display_name || 'Unknown'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/partner/${report.reporter_id}`)}
            >
              <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
            </TouchableOpacity>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
          <View style={styles.userRow}>
            <View style={styles.userInfo}>
              <Ionicons name="person-outline" size={20} color={colors.semantic.error} />
              <View style={styles.userDetails}>
                <Text style={[styles.userLabel, { color: colors.text.muted }]}>
                  Reported User
                </Text>
                <Text style={[styles.userName, { color: colors.text.primary }]}>
                  {report.target?.display_name || 'Unknown'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/partner/${report.target_id}`)}
            >
              <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Admin Notes */}
        {report.admin_notes && (
          <View style={[styles.section, { backgroundColor: colors.background.secondary }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Admin Notes
            </Text>
            <Text style={[styles.messageText, { color: colors.text.secondary }]}>
              {report.admin_notes}
            </Text>
            {report.reviewed_at && (
              <Text style={[styles.reviewedDate, { color: colors.text.muted }]}>
                Reviewed {formatDate(report.reviewed_at)}
              </Text>
            )}
          </View>
        )}

        {/* Action Taken */}
        {report.action_taken && (
          <View style={[styles.section, { backgroundColor: colors.background.secondary }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Action Taken
            </Text>
            <View style={styles.actionInfo}>
              <Text style={[styles.actionType, { color: colors.semantic.error }]}>
                {report.action_taken.action_type.toUpperCase()}
              </Text>
              <Text style={[styles.actionReason, { color: colors.text.secondary }]}>
                {report.action_taken.reason}
              </Text>
              {report.action_taken.expires_at && (
                <Text style={[styles.actionExpiry, { color: colors.text.muted }]}>
                  Expires: {formatDate(report.action_taken.expires_at)}
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {report.status !== 'action_taken' && (
        <View
          style={[
            styles.footer,
            { backgroundColor: colors.background.secondary, borderTopColor: colors.border.default },
          ]}
        >
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.background.primary }]}
            onPress={() => handleUpdateStatus('dismissed')}
          >
            <Text style={[styles.actionButtonText, { color: colors.text.primary }]}>
              Dismiss
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowActionModal(true)}
          >
            <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
              Take Action
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Modal */}
      <ActionModal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        targetUserId={report.target_id}
        targetUserName={report.target?.display_name || 'User'}
        onAction={handleTakeAction}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  statusSection: {
    padding: 16,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reportDate: {
    fontSize: 13,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasonText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  userDetails: {
    flex: 1,
  },
  userLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  reviewedDate: {
    fontSize: 12,
    marginTop: 8,
  },
  actionInfo: {
    marginTop: 8,
  },
  actionType: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionReason: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionExpiry: {
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

