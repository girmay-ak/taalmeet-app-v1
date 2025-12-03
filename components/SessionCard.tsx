/**
 * Session Card Component - React Native
 * 
 * Displays a language session card
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { spacing, textStyles } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';

interface LanguageSession {
  id: string;
  partnerName: string;
  partnerAvatar?: string;
  language: string;
  level: string;
  scheduledTime: string;
  duration: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

interface SessionCardProps {
  session: LanguageSession;
  onClick: () => void;
}

const getStatusColor = (status: string, colors: any) => {
  switch (status) {
    case 'upcoming':
      return colors.primary;
    case 'completed':
      return colors.semantic.success;
    case 'cancelled':
      return colors.semantic.error;
    default:
      return colors.text.muted;
  }
};

export function SessionCard({ session, onClick }: SessionCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onClick}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: colors.background.secondary,
          borderColor: colors.border.default,
        },
      ]}>
      {/* Partner Info */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {session.partnerAvatar ? (
            <Image
              source={{ uri: session.partnerAvatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>
                {session.partnerName.charAt(0)}
              </Text>
            </View>
          )}
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(session.status, colors) }]} />
        </View>
        
        <View style={styles.headerInfo}>
          <Text style={[textStyles.bodySmall, { color: colors.text.primary, fontWeight: '600' }]}>
            {session.partnerName}
          </Text>
          <Text style={[textStyles.caption, { color: colors.text.muted, marginTop: 2 }]}>
            {session.language} • {session.level}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status, colors) + '20' }]}>
          <Text style={[textStyles.caption, { color: getStatusColor(session.status, colors), fontWeight: '600' }]}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Session Details */}
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={colors.text.muted} />
          <Text style={[textStyles.caption, { color: colors.text.secondary, marginLeft: 6 }]}>
            {session.scheduledTime}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={colors.text.muted} />
          <Text style={[textStyles.caption, { color: colors.text.secondary, marginLeft: 6 }]}>
            {session.duration}
          </Text>
        </View>
      </View>

      {/* Arrow */}
      <View style={[styles.arrowButton, { backgroundColor: colors.background.primary }]}>
        <Ionicons name="chevron-forward" size={20} color={colors.text.primary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  details: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
