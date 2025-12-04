/**
 * Privacy & Safety Screen - React Native
 */

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { DeleteAccountModal } from '@/components/modals/DeleteAccountModal';
import { useBlockedUsers } from '@/hooks/useSafety';
import { useAuth } from '@/providers';
import { useExportUserData } from '@/hooks/useDataExport';

export default function PrivacySafetyScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showDistance, setShowDistance] = useState(true);
  const [showLastActive, setShowLastActive] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { data: blockedUsers = [] } = useBlockedUsers(user?.id);
  const exportDataMutation = useExportUserData();

  const SettingRow = ({
    icon,
    iconColor,
    title,
    subtitle,
    value,
    onToggle,
    onPress,
    showArrow,
  }: {
    icon: string;
    iconColor: string;
    title: string;
    subtitle?: string;
    value?: boolean;
    onToggle?: () => void;
    onPress?: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress && !onToggle}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text.primary }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: colors.text.muted }]}>{subtitle}</Text>}
      </View>
      {onToggle && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border.default, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      )}
      {showArrow && <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Privacy & Safety</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Privacy Banner */}
        <View style={styles.section}>
          <View style={[styles.banner, { backgroundColor: 'rgba(95, 179, 179, 0.1)', borderColor: 'rgba(95, 179, 179, 0.3)' }]}>
            <View style={[styles.bannerIcon, { backgroundColor: 'rgba(95, 179, 179, 0.2)' }]}>
              <Ionicons name="shield-checkmark" size={20} color="#5FB3B3" />
            </View>
            <View style={styles.bannerContent}>
              <Text style={[styles.bannerTitle, { color: colors.text.primary }]}>Your Safety Matters</Text>
              <Text style={[styles.bannerText, { color: colors.text.muted }]}>
                Control who sees your information and how others can interact with you.
              </Text>
            </View>
          </View>
        </View>

        {/* Profile Visibility */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>PROFILE VISIBILITY</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <SettingRow
              icon="eye"
              iconColor={colors.primary}
              title="Show Online Status"
              subtitle="Let others see when you're online"
              value={showOnlineStatus}
              onToggle={() => setShowOnlineStatus(!showOnlineStatus)}
            />
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <SettingRow
              icon="location"
              iconColor="#5FB3B3"
              title="Show Distance"
              subtitle="Display your approximate distance"
              value={showDistance}
              onToggle={() => setShowDistance(!showDistance)}
            />
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <SettingRow
              icon="time"
              iconColor="#E91E8C"
              title="Show Last Active"
              subtitle="Display when you were last active"
              value={showLastActive}
              onToggle={() => setShowLastActive(!showLastActive)}
            />
          </View>
        </View>

        {/* Messaging */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>MESSAGING</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <SettingRow
              icon="checkmark-done"
              iconColor="#F59E0B"
              title="Read Receipts"
              subtitle="Show when you've read messages"
              value={readReceipts}
              onToggle={() => setReadReceipts(!readReceipts)}
            />
          </View>
        </View>

        {/* Safety Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>SAFETY ACTIONS</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <SettingRow
              icon="eye-off"
              iconColor="#EF4444"
              title="Blocked Users"
              subtitle={`${blockedUsers.length} user${blockedUsers.length !== 1 ? 's' : ''} blocked`}
              onPress={() => {
                // TODO: Navigate to blocked users list screen
                Alert.alert('Blocked Users', `You have ${blockedUsers.length} blocked user(s). Unblock functionality coming soon.`);
              }}
              showArrow
            />
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <SettingRow
              icon="alert-circle"
              iconColor="#F59E0B"
              title="Report an Issue"
              subtitle="Report inappropriate behavior"
              onPress={() => {}}
              showArrow
            />
          </View>
        </View>

        {/* Data & Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>DATA & ACCOUNT</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <SettingRow
              icon="download"
              iconColor="#5FB3B3"
              title="Download My Data"
              subtitle="Export your data (GDPR)"
              onPress={() => {
                if (exportDataMutation.isPending) {
                  Alert.alert('Please wait', 'Data export in progress...');
                  return;
                }
                exportDataMutation.mutate();
              }}
              showArrow
            />
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <SettingRow
              icon="document-text"
              iconColor={colors.text.muted}
              title="Privacy Policy"
              subtitle="Read our privacy policy"
              onPress={() => router.push('/legal/privacy-policy')}
              showArrow
            />
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <SettingRow
              icon="trash"
              iconColor="#EF4444"
              title="Delete Account"
              subtitle="Permanently delete your account"
              onPress={() => setShowDeleteModal(true)}
              showArrow
            />
          </View>
        </View>
      </ScrollView>
      
      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  banner: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 68,
  },
});

