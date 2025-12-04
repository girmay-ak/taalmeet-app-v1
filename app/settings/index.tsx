/**
 * Settings Screen - React Native
 */

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useIsAdmin } from '@/hooks/useModeration';
import { useAuth } from '@/providers';

export default function SettingsScreen() {
  const { colors, mode, toggleMode, theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { data: isAdminUser } = useIsAdmin(user?.id);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [matchNotifications, setMatchNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  const SettingRow = ({
    icon,
    iconColor,
    title,
    subtitle,
    value,
    onToggle,
    onPress,
    showArrow,
    rightText,
  }: {
    icon: string;
    iconColor: string;
    title: string;
    subtitle?: string;
    value?: boolean;
    onToggle?: () => void;
    onPress?: () => void;
    showArrow?: boolean;
    rightText?: string;
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
      {rightText && <Text style={[styles.rightText, { color: colors.text.muted }]}>{rightText}</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>NOTIFICATIONS</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <SettingRow
              icon="notifications"
              iconColor={colors.primary}
              title="Push Notifications"
              subtitle="Receive app notifications"
              value={pushNotifications}
              onToggle={() => setPushNotifications(!pushNotifications)}
            />
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <SettingRow
              icon="chatbubble"
              iconColor="#5FB3B3"
              title="New Messages"
              subtitle="Get notified of new messages"
              value={messageNotifications}
              onToggle={() => setMessageNotifications(!messageNotifications)}
            />
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <SettingRow
              icon="heart"
              iconColor="#E91E8C"
              title="New Matches"
              subtitle="Get notified of new matches"
              value={matchNotifications}
              onToggle={() => setMatchNotifications(!matchNotifications)}
            />
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>APPEARANCE</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            {/* Color Theme */}
            <View style={styles.themeSection}>
              <View style={styles.themeLabelRow}>
                <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                  <Ionicons name="color-palette" size={20} color={colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingTitle, { color: colors.text.primary }]}>Color Theme</Text>
                  <Text style={[styles.settingSubtitle, { color: colors.text.muted }]}>Choose your app colors</Text>
                </View>
              </View>
              <View style={styles.themeButtons}>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    { borderColor: theme === 'green' ? colors.primary : colors.border.default },
                    theme === 'green' && { backgroundColor: `${colors.primary}10` },
                  ]}
                  onPress={() => setTheme('green')}
                >
                  <View style={[styles.themeCircle, { backgroundColor: '#1DB954' }]} />
                  <Text style={[styles.themeLabel, { color: colors.text.primary }]}>Green</Text>
                  {theme === 'green' && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    { borderColor: theme === 'purple' ? '#8B5CF6' : colors.border.default },
                    theme === 'purple' && { backgroundColor: 'rgba(139,92,246,0.1)' },
                  ]}
                  onPress={() => setTheme('purple')}
                >
                  <View style={[styles.themeCircle, { backgroundColor: '#8B5CF6' }]} />
                  <Text style={[styles.themeLabel, { color: colors.text.primary }]}>Purple</Text>
                  {theme === 'purple' && <Ionicons name="checkmark-circle" size={20} color="#8B5CF6" />}
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <SettingRow
              icon="moon"
              iconColor="#F59E0B"
              title="Dark Mode"
              subtitle="Use dark theme"
              value={mode === 'dark'}
              onToggle={toggleMode}
            />
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <SettingRow
              icon="volume-high"
              iconColor="#8B5CF6"
              title="Sound Effects"
              subtitle="Play sounds for actions"
              value={soundEffects}
              onToggle={() => setSoundEffects(!soundEffects)}
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>ACCOUNT</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <SettingRow
              icon="lock-closed"
              iconColor="#5FB3B3"
              title="Change Password"
              subtitle="Update your password"
              onPress={() => {
                // TODO: Open change password modal
              }}
              showArrow
            />
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <SettingRow
              icon="globe"
              iconColor={colors.primary}
              title="Language"
              rightText="English"
              onPress={() => router.push('/language-preferences')}
              showArrow
            />
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <SettingRow
              icon="people-outline"
              iconColor={colors.primary}
              title="Connections"
              subtitle="View your connections"
              onPress={() => router.push('/connections')}
              showArrow
            />
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <SettingRow
              icon="eye-off"
              iconColor="#E91E8C"
              title="Blocked Users"
              subtitle="Manage blocked users"
              onPress={() => router.push('/privacy')}
              showArrow
            />
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <SettingRow
              icon="shield-checkmark"
              iconColor={colors.primary}
              title="Verify Profile"
              subtitle="Get verified badge"
              onPress={() => router.push('/profile/verification')}
              showArrow
            />
            {isAdminUser && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
                <SettingRow
                  icon="shield"
                  iconColor="#EF4444"
                  title="Admin Dashboard"
                  subtitle="Content moderation"
                  onPress={() => router.push('/admin')}
                  showArrow
                />
              </>
            )}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>ABOUT</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <SettingRow
              icon="document-text"
              iconColor={colors.text.muted}
              title="Terms of Service"
              onPress={() => router.push('/legal/terms-of-service')}
              showArrow
            />
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <SettingRow
              icon="shield-checkmark"
              iconColor={colors.text.muted}
              title="Privacy Policy"
              onPress={() => router.push('/legal/privacy-policy')}
              showArrow
            />
            <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            <View style={styles.settingRow}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.text.muted}20` }]}>
                <Ionicons name="information-circle" size={20} color={colors.text.muted} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text.primary }]}>Version</Text>
              </View>
              <Text style={[styles.rightText, { color: colors.text.muted }]}>1.0.0</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  rightText: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginLeft: 68,
  },
  themeSection: {
    padding: 16,
  },
  themeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  themeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  themeLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});

