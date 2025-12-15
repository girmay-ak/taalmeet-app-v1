/**
 * Partner Discovery Card Component
 * Enhanced card for displaying partners in discovery lists
 * Matches design inspiration with match percentage, languages, and actions
 */

import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { getLanguageFlag } from '@/utils/languageFlags';

interface PartnerDiscoveryCardProps {
  partner: {
    id: string;
    display_name: string;
    avatar_url?: string;
    languages?: Array<{
      language: string;
      role: 'teaching' | 'learning';
      proficiency?: string;
    }>;
    distance?: number;
    matchScore?: number;
    is_online?: boolean;
    bio?: string;
  };
  onPress?: () => void;
  onConnect?: () => void;
  onMessage?: () => void;
  connectionStatus?: 'none' | 'pending' | 'connected';
}

export function PartnerDiscoveryCard({
  partner,
  onPress,
  onConnect,
  onMessage,
  connectionStatus = 'none',
}: PartnerDiscoveryCardProps) {
  const { colors } = useTheme();

  const teachingLang = partner.languages?.find((l) => l.role === 'teaching');
  const learningLang = partner.languages?.find((l) => l.role === 'learning');

  const getConnectionButton = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton, { backgroundColor: colors.primary }]}
            onPress={onMessage}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
        );
      case 'pending':
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.pendingButton, { borderColor: colors.border.default }]}
            disabled
          >
            <Text style={[styles.pendingText, { color: colors.text.muted }]}>Pending</Text>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.connectButton, { backgroundColor: colors.primary }]}
            onPress={onConnect}
          >
            <Text style={styles.actionButtonText}>Connect</Text>
          </TouchableOpacity>
        );
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {/* Header with Avatar and Match Score */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: (partner.avatar_url && partner.avatar_url.trim() !== '')
                ? partner.avatar_url
                : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            }}
            style={[styles.avatar, { borderColor: colors.primary }]}
          />
          {partner.is_online && (
            <View style={[styles.onlineIndicator, { backgroundColor: '#1DB954', borderColor: colors.background.secondary }]} />
          )}
        </View>
        {partner.matchScore !== undefined && (
          <View style={[styles.matchBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.matchText}>{partner.matchScore}%</Text>
          </View>
        )}
      </View>

      {/* Name */}
      <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={1}>
        {partner.display_name}
      </Text>

      {/* Languages */}
      <View style={styles.languagesContainer}>
        {teachingLang && (
          <View style={[styles.languageTag, { backgroundColor: colors.background.primary }]}>
            <Text style={styles.languageFlag}>{getLanguageFlag(teachingLang.language)}</Text>
            <Text style={[styles.languageText, { color: colors.text.secondary }]} numberOfLines={1}>
              {teachingLang.language}
            </Text>
          </View>
        )}
        {learningLang && (
          <View style={[styles.languageTag, { backgroundColor: colors.background.primary }]}>
            <Text style={styles.languageFlag}>{getLanguageFlag(learningLang.language)}</Text>
            <Text style={[styles.languageText, { color: colors.text.secondary }]} numberOfLines={1}>
              {learningLang.language}
            </Text>
          </View>
        )}
      </View>

      {/* Distance */}
      {partner.distance !== undefined && (
        <View style={styles.distanceContainer}>
          <Ionicons name="location-outline" size={12} color={colors.text.muted} />
          <Text style={[styles.distanceText, { color: colors.text.muted }]}>
            {partner.distance.toFixed(1)} km away
          </Text>
        </View>
      )}

      {/* Bio Preview */}
      {partner.bio && (
        <Text style={[styles.bio, { color: colors.text.muted }]} numberOfLines={2}>
          {partner.bio}
        </Text>
      )}

      {/* Action Button */}
      <View style={styles.actions}>
        {getConnectionButton()}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  matchBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  languageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  languageFlag: {
    fontSize: 14,
  },
  languageText: {
    fontSize: 12,
    fontWeight: '500',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 12,
  },
  bio: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  actions: {
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  connectButton: {
    // Uses primary color from theme
  },
  messageButton: {
    // Uses primary color from theme
  },
  pendingButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pendingText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

