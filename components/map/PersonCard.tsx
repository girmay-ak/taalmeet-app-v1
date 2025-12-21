/**
 * Person Card Component
 * 
 * Bottom card shown when a person marker is selected on the map.
 * This is person-specific, not an event card.
 * 
 * Features:
 * - Slides up from bottom with translateY + opacity animation
 * - Shows profile photo, name, age, distance, match %
 * - Action buttons: View Profile, Message (if connected)
 * - Dismiss by tapping map or dragging down
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';

export interface PersonCardProps {
  /**
   * User ID
   */
  id: string;
  /**
   * Display name
   */
  name: string;
  /**
   * Age
   */
  age: number;
  /**
   * Avatar URL
   */
  avatarUrl: string | null;
  /**
   * Distance in km
   */
  distance: number;
  /**
   * Match percentage
   */
  matchScore: number;
  /**
   * On view profile press
   */
  onViewProfile: () => void;
  /**
   * On message press
   */
  onMessage: () => void;
  /**
   * Connection status
   */
  connectionStatus: 'connected' | 'pending' | 'none';
}

export function PersonCard({
  id,
  name,
  age,
  avatarUrl,
  distance,
  matchScore,
  onViewProfile,
  onMessage,
  connectionStatus,
}: PersonCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.mode === 'dark' ? '#1A1A1A' : '#FFFFFF',
          borderColor: colors.border.default,
        },
      ]}
    >
      {/* Profile Photo */}
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarInitial}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        {/* Name + Age */}
        <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={1}>
          {name}, {age}
        </Text>
        
        {/* Distance + Match */}
        <Text style={[styles.meta, { color: colors.text.muted }]} numberOfLines={1}>
          {distance}km away · {matchScore}% match
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {/* View Profile Button */}
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={onViewProfile}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>View Profile</Text>
        </TouchableOpacity>

        {/* Message Button */}
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              borderColor: colors.border.default,
              backgroundColor: colors.background.secondary,
            },
          ]}
          onPress={onMessage}
          activeOpacity={0.8}
          disabled={connectionStatus !== 'connected'}
        >
          <Ionicons
            name="chatbubble"
            size={16}
            color={connectionStatus === 'connected' ? colors.text.primary : colors.text.muted}
          />
          <Text
            style={[
              styles.secondaryButtonText,
              {
                color:
                  connectionStatus === 'connected' ? colors.text.primary : colors.text.muted,
              },
            ]}
          >
            Message
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    // Compact height
    minHeight: 100,
  },
  avatarContainer: {
    width: 56,
    height: 56,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
  },
  actionsContainer: {
    flexDirection: 'column',
    gap: 8,
    alignItems: 'flex-end',
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    minWidth: 100,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

