/**
 * Edit Profile Screen
 * Full profile editing with avatar upload, bio, location, and languages
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useAuth } from '@/providers';
import { useUpdateProfile } from '@/hooks/useProfile';
import * as storageService from '@/services/storageService';
import { logger } from '@/utils/logger';

const MAX_BIO_LENGTH = 300;

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const { profile, refreshProfile } = useAuth();
  const updateProfileMutation = useUpdateProfile();

  // Form state
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [city, setCity] = useState(profile?.city || '');
  const [country, setCountry] = useState(profile?.country || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(
    (profile?.avatarUrl && profile.avatarUrl.trim() !== '') ? profile.avatarUrl : null
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setCity(profile.city || '');
      setCountry(profile.country || '');
      setAvatarUri((profile.avatarUrl && profile.avatarUrl.trim() !== '') ? profile.avatarUrl : null);
    }
  }, [profile]);

  const handlePickAvatar = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to upload an avatar. You can enable this in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                // On iOS, this will open app settings
                // On Android, user needs to manually go to settings
                Alert.alert('Settings', 'Please go to Settings > TAALMEET > Photos and enable access.');
              },
            },
          ]
        );
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (result.canceled) {
        // User canceled, do nothing
        return;
      }

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        setAvatarUri(result.assets[0].uri);
      } else {
        Alert.alert('Error', 'No image was selected. Please try again.');
      }
    } catch (error: any) {
      console.error('Image picker error:', error);
      Alert.alert(
        'Error',
        `Failed to pick image: ${error.message || 'Unknown error'}. Please make sure you have granted photo library permissions.`
      );
    }
  };

  const handleSave = async () => {
    if (!profile?.id) {
      Alert.alert('Error', 'No profile found');
      return;
    }

    if (!displayName.trim()) {
      Alert.alert('Validation Error', 'Display name is required');
      return;
    }

    setIsSaving(true);

    try {
      let avatarUrl = profile.avatarUrl;

      // Upload new avatar if changed
      if (avatarUri && avatarUri !== profile.avatarUrl && !avatarUri.startsWith('http')) {
        setIsUploadingAvatar(true);
        try {
          console.log('[EditProfile] Uploading avatar:', { userId: profile.id, avatarUri });
          const uploadResult = await storageService.uploadAvatar(profile.id, avatarUri);
          avatarUrl = uploadResult.publicUrl;
          console.log('[EditProfile] Avatar uploaded successfully:', avatarUrl);
          logger.info('USER', 'Avatar uploaded', {
            userId: profile.id,
            action: 'avatar_upload',
          });
        } catch (error: any) {
          console.error('[EditProfile] Avatar upload error:', error);
          Alert.alert('Upload Error', 'Failed to upload avatar. Profile will be saved without new avatar.');
        } finally {
          setIsUploadingAvatar(false);
        }
      } else if (avatarUri && avatarUri.startsWith('http')) {
        // Avatar is already a URL (from previous upload or external source)
        avatarUrl = avatarUri;
        console.log('[EditProfile] Using existing avatar URL:', avatarUrl);
      }

      // Update profile
      const updateData = {
        displayName: displayName.trim(),
        bio: bio.trim() || null,
        city: city.trim() || null,
        country: country.trim() || null,
        avatarUrl: (avatarUrl && avatarUrl.trim() !== '') ? avatarUrl : null,
      };
      
      console.log('[EditProfile] Updating profile with data:', { ...updateData, avatarUrl: updateData.avatarUrl ? 'SET' : 'NULL' });
      
      await updateProfileMutation.mutateAsync({
        userId: profile.id,
        data: updateData,
      });

      // Refresh profile in AuthProvider
      await refreshProfile();

      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Save profile error:', error);
      Alert.alert('Error', 'Failed to save profile: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    displayName !== (profile?.displayName || '') ||
    bio !== (profile?.bio || '') ||
    city !== (profile?.city || '') ||
    country !== (profile?.country || '') ||
    (avatarUri && avatarUri !== profile?.avatarUrl);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: avatarUri || 'https://via.placeholder.com/150' }}
              style={[styles.avatar, { borderColor: colors.border.default }]}
            />
            {isUploadingAvatar && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}
            <TouchableOpacity
              style={[styles.editAvatarButton, { backgroundColor: colors.primary }]}
              onPress={handlePickAvatar}
              disabled={isUploadingAvatar}
            >
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.avatarHint, { color: colors.text.muted }]}>Change Photo</Text>
        </View>

        {/* Display Name */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text.primary }]}>Display Name *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.default,
                color: colors.text.primary,
              },
            ]}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your name"
            placeholderTextColor={colors.text.muted}
          />
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text.primary }]}>Bio</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.default,
                color: colors.text.primary,
              },
            ]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell others about yourself..."
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={4}
            maxLength={MAX_BIO_LENGTH}
          />
          <Text style={[styles.charCount, { color: colors.text.muted }]}>
            {bio.length}/{MAX_BIO_LENGTH}
          </Text>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text.primary }]}>City</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.default,
                color: colors.text.primary,
              },
            ]}
            value={city}
            onChangeText={setCity}
            placeholder="Enter your city"
            placeholderTextColor={colors.text.muted}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text.primary }]}>Country</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.default,
                color: colors.text.primary,
              },
            ]}
            value={country}
            onChangeText={setCountry}
            placeholder="Enter your country"
            placeholderTextColor={colors.text.muted}
          />
        </View>

        {/* Languages Section - Note: Language editing would need a separate screen */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text.primary }]}>Languages</Text>
          <TouchableOpacity
            style={[
              styles.languageButton,
              {
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.default,
              },
            ]}
            onPress={() => {
              Alert.alert('Coming Soon', 'Language editing will be available in a future update.');
            }}
          >
            <Text style={[styles.languageButtonText, { color: colors.text.muted }]}>
              Edit Languages
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: hasChanges ? colors.primary : colors.border.default,
              opacity: isSaving ? 0.6 : 1,
            },
          ]}
          onPress={handleSave}
          disabled={!hasChanges || isSaving || isUploadingAvatar}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
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
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0F0F0F',
  },
  avatarHint: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  languageButtonText: {
    fontSize: 16,
  },
  saveButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

