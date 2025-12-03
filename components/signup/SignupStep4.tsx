/**
 * Signup Step 4 - Profile Completion
 * Bio, interests, and avatar upload
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/lib/theme/ThemeProvider';

interface SignupStep4Props {
  onNext: (data: { bio: string; interests: string[]; avatar?: string }) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

const INTERESTS = [
  '☕ Coffee',
  '🎵 Music',
  '✈️ Travel',
  '🎨 Art',
  '📚 Books',
  '🍕 Food',
  '⚽ Sports',
  '🎮 Gaming',
  '🎬 Movies',
  '📸 Photography',
  '🏃 Fitness',
  '🧘 Yoga',
  '🍷 Wine',
  '🎭 Theater',
  '🌿 Nature',
  '💻 Technology',
];

const MAX_BIO_LENGTH = 150;
const MAX_INTERESTS = 8;

export function SignupStep4({ onNext, onBack, isSubmitting = false }: SignupStep4Props) {
  const { colors } = useTheme();
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  const canProceed = bio.trim() !== '' && selectedInterests.length > 0 && agreedToTerms;

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else if (selectedInterests.length < MAX_INTERESTS) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow access to your photos to add a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (canProceed) {
      onNext({
        bio,
        interests: selectedInterests,
        avatar: avatar || undefined,
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.stepIndicator, { color: colors.text.muted }]}>4/4</Text>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Complete Profile ✨
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.muted }]}>
          Almost there!
        </Text>

        {/* Avatar Upload */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} style={styles.avatarButton}>
            <View
              style={[
                styles.avatarContainer,
                {
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.default,
                },
              ]}
            >
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="camera" size={40} color={colors.text.muted} />
              )}
            </View>
            <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="pencil" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePickImage}>
            <Text style={[styles.addPhotoText, { color: colors.primary }]}>
              Add Photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bio */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: colors.text.primary }]}>About Me</Text>
          <TextInput
            style={[
              styles.bioInput,
              {
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.default,
                color: colors.text.primary,
              },
            ]}
            placeholder="Hey! I'm learning languages and love meeting new people..."
            placeholderTextColor={colors.text.muted}
            value={bio}
            onChangeText={(text) => {
              if (text.length <= MAX_BIO_LENGTH) {
                setBio(text);
              }
            }}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text
            style={[
              styles.charCount,
              { color: bio.length === MAX_BIO_LENGTH ? '#F59E0B' : colors.text.muted },
            ]}
          >
            {bio.length} / {MAX_BIO_LENGTH} characters
          </Text>
        </View>

        {/* Interests */}
        <View style={styles.inputSection}>
          <View style={styles.interestsHeader}>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              Interests 🎯
            </Text>
            <Text style={[styles.interestCount, { color: colors.text.muted }]}>
              {selectedInterests.length}/{MAX_INTERESTS} selected
            </Text>
          </View>
          <Text style={[styles.interestsHint, { color: colors.text.muted }]}>
            Tap to select:
          </Text>
          <View style={styles.interestsGrid}>
            {INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              const isDisabled = !isSelected && selectedInterests.length >= MAX_INTERESTS;
              return (
                <TouchableOpacity
                  key={interest}
                  onPress={() => toggleInterest(interest)}
                  disabled={isDisabled}
                  style={[
                    styles.interestChip,
                    isSelected
                      ? { backgroundColor: colors.primary }
                      : {
                          backgroundColor: colors.background.secondary,
                          borderColor: colors.border.default,
                          borderWidth: 1,
                        },
                    isDisabled && styles.interestDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.interestText,
                      { color: isSelected ? '#FFFFFF' : colors.text.muted },
                    ]}
                  >
                    {interest}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Terms Agreement */}
        <View
          style={[
            styles.termsCard,
            {
              backgroundColor: colors.background.secondary,
              borderColor: colors.border.default,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            style={styles.termsRow}
          >
            <View
              style={[
                styles.termsCheckbox,
                agreedToTerms
                  ? { backgroundColor: colors.primary }
                  : { borderColor: colors.border.default, borderWidth: 2 },
              ]}
            >
              {agreedToTerms && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
            </View>
            <Text style={[styles.termsText, { color: colors.text.muted }]}>
              I agree to the{' '}
              <Text style={{ color: colors.primary }}>Terms of Service</Text> and{' '}
              <Text style={{ color: colors.primary }}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary, opacity: canProceed && !isSubmitting ? 1 : 0.5 },
          ]}
          onPress={handleSubmit}
          disabled={!canProceed || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Creating Account...' : 'Create Account 🎉'}
          </Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerButton: {
    padding: 8,
  },
  stepIndicator: {
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarButton: {
    marginBottom: 8,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F0F0F',
  },
  addPhotoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  bioInput: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  interestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  interestCount: {
    fontSize: 12,
  },
  interestsHint: {
    fontSize: 14,
    marginBottom: 12,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '500',
  },
  interestDisabled: {
    opacity: 0.5,
  },
  termsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  termsCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

