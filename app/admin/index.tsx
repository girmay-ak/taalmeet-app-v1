/**
 * Admin Dashboard
 * Main screen for content moderation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useReports, useIsAdmin, useAdminStatistics } from '@/hooks/useModeration';
import { useAuth } from '@/providers';
import { Redirect } from 'expo-router';

type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed' | 'action_taken';

export default function AdminDashboardScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { data: isAdminUser, isLoading: isAdminLoading } = useIsAdmin(user?.id);
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | undefined>(undefined);
  
  const { data: reports = [], isLoading, refetch } = useReports(selectedStatus);
  const { data: statistics, isLoading: statsLoading, refetch: refetchStats } = useAdminStatistics();

  // Redirect if not admin
  if (!isAdminLoading && isAdminUser !== true) {
    return <Redirect href="/(tabs)" />;
  }

  const statusTabs: { label: string; status: ReportStatus | undefined; count?: number }[] = [
    { label: 'All', status: undefined },
    { label: 'Pending', status: 'pending' },
    { label: 'Reviewing', status: 'reviewing' },
    { label: 'Resolved', status: 'resolved' },
    { label: 'Action Taken', status: 'action_taken' },
  ];

  const getStatusColor = (status: ReportStatus) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isAdminLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.text.primary }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          Admin Dashboard
        </Text>
        <TouchableOpacity
          onPress={() => {
            refetch();
            refetchStats();
          }}
          style={styles.refreshButton}
        >
          <Ionicons name="refresh" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Statistics Overview */}
      {statistics && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.statsContainer, { backgroundColor: colors.background.secondary }]}
          contentContainerStyle={styles.statsContent}
        >
          <View style={[styles.statCard, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}>
            <Ionicons name="people" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {statistics.totalUsers.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.muted }]}>Total Users</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}>
            <Ionicons name="person-circle" size={24} color={colors.semantic.success} />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {statistics.activeUsers.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.muted }]}>Active (24h)</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}>
            <Ionicons name="flag" size={24} color={colors.semantic.warning} />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {statistics.pendingReports.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.muted }]}>Pending Reports</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}>
            <Ionicons name="ban" size={24} color={colors.semantic.error} />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {statistics.activeBans.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.muted }]}>Active Bans</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}>
            <Ionicons name="chatbubbles" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {statistics.totalMessages.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.muted }]}>Messages</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}>
            <Ionicons name="people-circle" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {statistics.totalConnections.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.muted }]}>Connections</Text>
          </View>
        </ScrollView>
      )}

      {/* Status Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.statusTabs, { backgroundColor: colors.background.secondary }]}
        contentContainerStyle={styles.statusTabsContent}
      >
        {statusTabs.map((tab) => (
          <TouchableOpacity
            key={tab.label}
            style={[
              styles.statusTab,
              {
                backgroundColor:
                  selectedStatus === tab.status
                    ? colors.primary
                    : 'transparent',
              },
            ]}
            onPress={() => setSelectedStatus(tab.status)}
          >
            <Text
              style={[
                styles.statusTabText,
                {
                  color:
                    selectedStatus === tab.status
                      ? '#FFFFFF'
                      : colors.text.secondary,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Reports List */}
      <ScrollView
        style={styles.reportsList}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || statsLoading}
            onRefresh={() => {
              refetch();
              refetchStats();
            }}
            tintColor={colors.primary}
          />
        }
      >
        {reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark" size={64} color={colors.text.muted} />
            <Text style={[styles.emptyText, { color: colors.text.muted }]}>
              No reports found
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.text.muted }]}>
              {selectedStatus
                ? `No ${selectedStatus} reports`
                : 'All reports have been reviewed'}
            </Text>
          </View>
        ) : (
          reports.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={[
                styles.reportCard,
                { backgroundColor: colors.background.secondary, borderColor: colors.border.default },
              ]}
              onPress={() => router.push(`/admin/reports/${report.id}`)}
            >
              <View style={styles.reportHeader}>
                <View style={styles.reportHeaderLeft}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(report.status) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: getStatusColor(report.status) },
                      ]}
                    >
                      {report.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.reportDate, { color: colors.text.muted }]}>
                  {formatDate(report.created_at)}
                </Text>
              </View>

              <View style={styles.reportContent}>
                <Text style={[styles.reportReason, { color: colors.text.primary }]}>
                  {report.reason}
                </Text>
                {report.message && (
                  <Text
                    style={[styles.reportMessage, { color: colors.text.secondary }]}
                    numberOfLines={2}
                  >
                    {report.message}
                  </Text>
                )}
              </View>

              <View style={styles.reportFooter}>
                <View style={styles.userInfo}>
                  <Ionicons name="person-outline" size={16} color={colors.text.muted} />
                  <Text style={[styles.userName, { color: colors.text.secondary }]}>
                    {report.reporter?.display_name || 'Unknown'} →{' '}
                    {report.target?.display_name || 'Unknown'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
  refreshButton: {
    padding: 8,
  },
  statsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  statsContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    width: 120,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  statusTabs: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  statusTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statusTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  statusTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reportsList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  reportCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  reportDate: {
    fontSize: 12,
  },
  reportContent: {
    marginBottom: 12,
  },
  reportReason: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reportMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  userName: {
    fontSize: 13,
  },
});

