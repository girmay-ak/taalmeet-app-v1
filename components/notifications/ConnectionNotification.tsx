/**
 * Connection Notification Component
 * Shows notifications for connection requests and accepted connections
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import type { ConnectionNotification } from '@/services/notificationsService';
import { getLanguageFlag } from '@/utils/languageFlags';

const { width } = Dimensions.get('window');

interface ConnectionNotificationProps {
  notification: ConnectionNotification;
  onAccept?: (connectionId: string) => void;
  onReject?: (connectionId: string) => void;
  onViewProfile?: (userId: string) => void;
  onClose: () => void;
  autoHideAfter?: number; // Auto-hide after milliseconds
}

export function ConnectionNotificationComponent({
  notification,
  onAccept,
  onReject,
  onViewProfile,
  onClose,
  autoHideAfter = 5000,
}: ConnectionNotificationProps) {
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide after specified time
    if (autoHideAfter > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoHideAfter);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleAccept = () => {
    if (onAccept) {
      onAccept(notification.connectionId);
    }
    handleClose();
  };

  const handleReject = () => {
    if (onReject) {
      onReject(notification.connectionId);
    }
    handleClose();
  };

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(notification.fromUserId);
    }
    handleClose();
  };

  // Get teaching language for flag display
  const teachingLang = notification.languages?.find((l) => l.role === 'teaching');
  const learningLang = notification.languages?.find((l) => l.role === 'learning');

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background.primary,
          borderColor: colors.border.default,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: notification.fromUserAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            }}
            style={styles.avatar}
            resizeMode="cover"
          />
          {notification.type === 'connection_request' && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Ionicons name="heart" size={12} color="#FFFFFF" />
            </View>
          )}
          {notification.type === 'connection_accepted' && (
            <View style={[styles.badge, { backgroundColor: '#10B981' }]}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.textContainer}>
          {notification.type === 'connection_request' ? (
            <>
              <Text style={[styles.title, { color: colors.text.primary }]}>
                {notification.fromUserName} wants to connect!
              </Text>
              <Text style={[styles.message, { color: colors.text.muted }]}>
                {notification.matchScore}% compatible • {teachingLang && `${getLanguageFlag(teachingLang.language)} ${teachingLang.language}`}
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: colors.text.primary }]}>
                🎉 It's a Match!
              </Text>
              <Text style={[styles.message, { color: colors.text.muted }]}>
                {notification.fromUserName} accepted your connection request
              </Text>
            </>
          )}
        </View>

        {/* Close Button */}
        <TouchableOpacity
          onPress={handleClose}
          style={[styles.closeButton, { backgroundColor: colors.background.secondary }]}
        >
          <Ionicons name="close" size={18} color={colors.text.muted} />
        </TouchableOpacity>
      </View>

      {/* Actions */}
      {notification.type === 'connection_request' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton, { borderColor: colors.border.default }]}
            onPress={handleReject}
          >
            <Ionicons name="close-circle" size={18} color={colors.text.muted} />
            <Text style={[styles.actionText, { color: colors.text.muted }]}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton, { backgroundColor: colors.primary }]}
            onPress={handleAccept}
          >
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            <Text style={[styles.actionText, styles.acceptText]}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}

      {notification.type === 'connection_accepted' && (
        <TouchableOpacity
          style={[styles.viewButton, { backgroundColor: colors.primary }]}
          onPress={handleViewProfile}
        >
          <Text style={styles.viewButtonText}>View Profile</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  message: {
    fontSize: 12,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  rejectButton: {
    borderWidth: 1,
  },
  acceptButton: {
    // backgroundColor set dynamically
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  acceptText: {
    color: '#FFFFFF',
  },
  viewButton: {
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

