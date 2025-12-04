/**
 * Edit Profile Modal Component (React Native)
 * Modal for editing user profile information
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import * as ImagePicker from 'expo-image-picker';

interface ProfileData {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
}

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  profile: ProfileData | null;
  onSave: (data: {
    displayName?: string;
    bio?: string;
    city?: string;
    country?: string;
    avatarUrl?: string | null;
  }) => Promise<void>;
}

export function EditProfileModal({ isVisible, onClose, profile, onSave }: EditProfileModalProps) {
  const { colors } = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setCity(profile.city || '');
      setCountry(profile.country || '');
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile, isVisible]);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable camera roll permissions to change your avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploadingImage(true);
        // TODO: Upload image to Supabase Storage and get URL
        // For now, just use the local URI
        setAvatarUrl(result.assets[0].uri);
        setIsUploadingImage(false);
        
        Alert.alert(
          'Image Selected',
          'Image upload to server will be implemented. Using local image for now.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Validation Error', 'Display name is required.');
      return;
    }

    if (bio.length > 500) {
      Alert.alert('Validation Error', 'Bio must be less than 500 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        avatarUrl: avatarUrl || null,
      });
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    // Reset form
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setCity(profile.city || '');
      setCountry(profile.country || '');
      setAvatarUrl(profile.avatar_url);
    }
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={[styles.backdrop, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]} />
        
        <View style={[styles.modal, { backgroundColor: colors.background.secondary }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border.default }]}>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Edit Profile</Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={isLoading}
              style={[styles.closeButton, { backgroundColor: colors.background.primary }]}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{
                    uri: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
                  }}
                  style={[styles.avatar, { borderColor: colors.border.default }]}
                />
                {isUploadingImage && (
                  <View style={[styles.uploadOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.changePhotoButton, { backgroundColor: colors.primary }]}
                  onPress={handlePickImage}
                  disabled={isUploadingImage}
                >
                  <Ionicons name="camera" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <Text style={[styles.changePhotoText, { color: colors.text.muted }]}>Change Photo</Text>
            </View>

            {/* Display Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Display Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background.primary,
                    borderColor: colors.border.default,
                    color: colors.text.primary,
                  },
                ]}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your display name"
                placeholderTextColor={colors.text.muted}
                maxLength={100}
                editable={!isLoading}
              />
            </View>

            {/* Bio */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Bio</Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.background.primary,
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
                maxLength={500}
                editable={!isLoading}
              />
              <Text style={[styles.charCount, { color: colors.text.muted }]}>
                {bio.length}/500
              </Text>
            </View>

            {/* Location - City */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text.primary }]}>City</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="location-outline" size={20} color={colors.text.muted} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    styles.inputWithIconInput,
                    {
                      backgroundColor: colors.background.primary,
                      borderColor: colors.border.default,
                      color: colors.text.primary,
                    },
                  ]}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Enter city"
                  placeholderTextColor={colors.text.muted}
                  maxLength={100}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Location - Country */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Country</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="flag-outline" size={20} color={colors.text.muted} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.input,
                    styles.inputWithIconInput,
                    {
                      backgroundColor: colors.background.primary,
                      borderColor: colors.border.default,
                      color: colors.text.primary,
                    },
                  ]}
                  value={country}
                  onChangeText={setCountry}
                  placeholder="Enter country"
                  placeholderTextColor={colors.text.muted}
                  maxLength={100}
                  editable={!isLoading}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border.default }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.background.primary }]}
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: colors.primary, opacity: isLoading ? 0.6 : 1 },
              ]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0F0F0F',
  },
  changePhotoText: {
    fontSize: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  inputWithIconInput: {
    paddingLeft: 44,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

