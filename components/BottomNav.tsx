/**
 * Bottom Navigation Component - React Native
 * 
 * Main navigation bar at the bottom of the app
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { spacing, textStyles } from '@/lib/theme';
import {
  HomeIcon,
  MapIcon,
  ClockIcon,
  MessageCircleIcon,
  UserIcon,
} from './icons/navIcons';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  unreadMessages?: number;
}

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  badge?: number;
}

export function BottomNav({ currentTab, onTabChange, unreadMessages = 0 }: BottomNavProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const tabs: Tab[] = [
    { id: 'discover', label: 'Home', icon: HomeIcon },
    { id: 'map', label: 'Maps', icon: MapIcon },
    { id: 'available', label: 'Available', icon: ClockIcon },
    { id: 'messages', label: 'Chat', icon: MessageCircleIcon, badge: unreadMessages },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background.secondary,
          borderTopColor: colors.border.default,
          paddingBottom: Math.max(insets.bottom, spacing.sm),
        },
      ]}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        const iconColor = isActive ? colors.primary : colors.text.muted;
        const textColor = isActive ? colors.primary : colors.text.muted;

        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
            style={styles.tab}>
            <View style={styles.iconContainer}>
              {isActive && (
                <View
                  style={[
                    styles.activeIndicator,
                    {
                      backgroundColor: colors.primary + '26', // 15% opacity
                    },
                  ]}
                />
              )}
              <View style={styles.iconWrapper}>
                <Icon size={24} color={iconColor} />
                {tab.badge && tab.badge > 0 && (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: colors.primary,
                      },
                    ]}>
                    <Text style={styles.badgeText}>{tab.badge > 9 ? '9+' : tab.badge}</Text>
                  </View>
                )}
              </View>
            </View>
            <Text
              style={[
                textStyles.caption,
                {
                  color: textColor,
                  fontWeight: isActive ? '600' : '400',
                  marginTop: spacing.xs,
                },
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    minHeight: 64,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
