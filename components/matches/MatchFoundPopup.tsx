/**
 * Match Found Popup - React Native Version
 * Shows when a connection request is accepted (mutual match)
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { ConfettiRN } from '@/components/animations/ConfettiRN';
import { getLanguageFlag } from '@/utils/languageFlags';
import type { ConnectionWithProfile } from '@/services/connectionsService';
import type { UserLanguage } from '@/types/database';

const { width, height } = Dimensions.get('window');

interface MatchFoundPopupProps {
  isVisible: boolean;
  connection: ConnectionWithProfile | null;
  currentUser: {
    displayName: string;
    avatarUrl: string | null;
    languages: UserLanguage[];
  } | null;
  onClose: () => void;
  onSendMessage?: (partnerId: string) => void;
  onViewProfile?: (partnerId: string) => void;
}

export function MatchFoundPopup({
  isVisible,
  connection,
  currentUser,
  onClose,
  onSendMessage,
  onViewProfile,
}: MatchFoundPopupProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [showConfetti, setShowConfetti] = React.useState(false);

  useEffect(() => {
    if (isVisible && connection) {
      setShowConfetti(true);
      // Animate popup entrance
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Hide confetti after 3 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      setShowConfetti(false);
    }
  }, [isVisible, connection]);

  if (!isVisible || !connection || !currentUser) {
    return null;
  }

  const partner = connection.partner;
  const matchScore = connection.match_score || 85;

  // Get language information - partner languages
  const partnerLanguagesArray = Array.isArray(partner.languages) ? partner.languages : [];
  const partnerTeachingLang = partnerLanguagesArray.find((l) => l.role === 'teaching') || null;
  const partnerLearningLang = partnerLanguagesArray.find((l) => l.role === 'learning') || null;
  
  // Handle currentUser.languages - ensure it's an array and safely access
  const currentUserLanguagesArray = (currentUser?.languages && Array.isArray(currentUser.languages)) 
    ? currentUser.languages 
    : [];
  
  const currentUserTeachingLang = currentUserLanguagesArray.find((l) => l.role === 'teaching') || null;
  const currentUserLearningLang = currentUserLanguagesArray.find((l) => l.role === 'learning') || null;

  const handleSendMessage = () => {
    onClose();
    if (onSendMessage) {
      onSendMessage(partner.id);
    }
  };

  const handleViewProfile = () => {
    onClose();
    if (onViewProfile) {
      onViewProfile(partner.id);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        {/* Confetti Animation */}
        <ConfettiRN active={showConfetti} duration={3000} />

        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: opacityAnim,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
            },
          ]}
        >
          <SafeAreaView style={styles.container}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Main Content */}
            <Animated.View
              style={[
                styles.content,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Title */}
                <View style={styles.titleContainer}>
                  <Animated.View
                    style={[
                      styles.sparkleIcon,
                      {
                        backgroundColor: colors.primary,
                      },
                    ]}
                  >
                    <Ionicons name="sparkles" size={32} color="#FFFFFF" />
                  </Animated.View>
                  <Text style={[styles.title, { color: colors.text.primary }]}>
                    Match Found!
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.text.muted }]}>
                    {partnerLearningLang
                      ? `Someone nearby wants to practice ${partnerLearningLang.language}`
                      : 'You both want to connect!'}
                  </Text>
                </View>

                {/* Profile Cards */}
                <View style={styles.profilesContainer}>
                  {/* Current User Card */}
                  <Animated.View
                    style={[
                      styles.profileCard,
                      {
                        backgroundColor: colors.background.primary,
                        borderColor: colors.border.default,
                      },
                    ]}
                  >
                    <Image
                      source={{
                        uri: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                      }}
                      style={styles.profileImage}
                      resizeMode="cover"
                    />
                    <View style={[styles.profileLabel, { backgroundColor: '#FFFFFF' }]}>
                      <Text style={styles.profileLabelText}>You</Text>
                    </View>
                    {/* Language Flag */}
                    {currentUserTeachingLang && (
                      <View
                        style={[
                          styles.flagBadge,
                          {
                            backgroundColor: '#FFFFFF',
                            borderColor: colors.primary,
                          },
                        ]}
                      >
                        <Text style={styles.flagEmoji}>
                          {getLanguageFlag(currentUserTeachingLang.language)}
                        </Text>
                      </View>
                    )}
                  </Animated.View>

                  {/* Language Exchange Icon */}
                  <View style={styles.exchangeContainer}>
                    <LinearGradient
                      colors={[colors.primary, '#5FB3B3']}
                      style={styles.exchangeIcon}
                    >
                      <Ionicons name="swap-horizontal" size={24} color="#FFFFFF" />
                    </LinearGradient>
                  </View>

                  {/* Partner Card */}
                  <Animated.View
                    style={[
                      styles.profileCard,
                      {
                        backgroundColor: colors.background.primary,
                        borderColor: colors.border.default,
                      },
                    ]}
                  >
                    <Image
                      source={{
                        uri: partner.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                      }}
                      style={styles.profileImage}
                      resizeMode="cover"
                    />
                    <View style={[styles.profileLabel, { backgroundColor: '#FFFFFF' }]}>
                      <Text style={styles.profileLabelText}>
                        {partner.display_name.split(' ')[0]}
                      </Text>
                    </View>
                    {/* Language Flag */}
                    {partnerTeachingLang && (
                      <View
                        style={[
                          styles.flagBadge,
                          {
                            backgroundColor: '#FFFFFF',
                            borderColor: '#5FB3B3',
                          },
                        ]}
                      >
                        <Text style={styles.flagEmoji}>
                          {getLanguageFlag(partnerTeachingLang.language)}
                        </Text>
                      </View>
                    )}
                  </Animated.View>
                </View>

                {/* Match Details */}
                <View
                  style={[
                    styles.detailsContainer,
                    {
                      backgroundColor: colors.background.secondary,
                      borderColor: colors.border.default,
                    },
                  ]}
                >
                  {/* Distance */}
                  <View style={styles.detailRow}>
                    <View style={[styles.detailIcon, { backgroundColor: `${colors.primary}20` }]}>
                      <Ionicons name="location" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={[styles.detailLabel, { color: colors.text.muted }]}>
                        Distance
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                        {partner.city || 'Nearby'} • {partner.country || ''}
                      </Text>
                    </View>
                  </View>

                  {/* Languages */}
                  <View style={styles.detailRow}>
                    <View
                      style={[
                        styles.detailIcon,
                        { backgroundColor: 'rgba(95, 179, 179, 0.2)' },
                      ]}
                    >
                      <Ionicons name="language" size={20} color="#5FB3B3" />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={[styles.detailLabel, { color: colors.text.muted }]}>
                        Languages
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                        {partnerLearningLang && `Learning ${partnerLearningLang.language}`}
                        {partnerTeachingLang && ` • Speaks ${partnerTeachingLang.language}`}
                      </Text>
                    </View>
                  </View>

                  {/* Match Score */}
                  <View style={styles.detailRow}>
                    <View
                      style={[
                        styles.detailIcon,
                        { backgroundColor: 'rgba(233, 30, 140, 0.2)' },
                      ]}
                    >
                      <Ionicons name="star" size={20} color="#E91E8C" />
                    </View>
                    <View style={styles.detailTextContainer}>
                      <Text style={[styles.detailLabel, { color: colors.text.muted }]}>
                        Match Score
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                        {matchScore}% compatible
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                    onPress={handleSendMessage}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Send Message</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.secondaryButton,
                      {
                        backgroundColor: colors.background.secondary,
                        borderColor: colors.border.default,
                      },
                    ]}
                    onPress={handleViewProfile}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.text.primary }]}>
                      View Full Profile
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={onClose} style={styles.maybeLaterButton}>
                    <Text style={[styles.maybeLaterText, { color: colors.text.muted }]}>
                      Maybe Later
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    maxHeight: height * 0.9,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sparkleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  profilesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  profileCard: {
    width: 128,
    height: 160,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileLabel: {
    position: 'absolute',
    bottom: -12,
    left: '50%',
    transform: [{ translateX: -40 }],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  profileLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F0F0F',
  },
  flagBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  flagEmoji: {
    fontSize: 20,
  },
  exchangeContainer: {
    zIndex: 10,
  },
  exchangeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  detailsContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  maybeLaterButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  maybeLaterText: {
    fontSize: 14,
  },
});

