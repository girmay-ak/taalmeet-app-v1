/**
 * Fill Your Profile Screen
 * Step 1 of profile setup - Personal information
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useAuth } from '@/providers';

export default function FillProfileScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();
  
  const [fullName, setFullName] = useState(profile?.displayName || '');
  const [nickname, setNickname] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [email, setEmail] = useState(profile?.email || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(profile?.avatarUrl || null);

  const canContinue = fullName.trim() !== '' && email.trim() !== '';

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
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

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleContinue = () => {
    // TODO: Save profile data
    router.push('/(onboarding)/set-location');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Fill Your Profile
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            style={[styles.avatarWrapper, { borderColor: colors.border.default }]}
            onPress={handlePickAvatar}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={48} color={colors.text.muted} />
            )}
            <View style={[styles.editIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name="pencil" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Full Name */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>Full Name</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              placeholder="Enter your full name"
              placeholderTextColor={colors.text.muted}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
        </View>

        {/* Nickname */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>Nickname</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              placeholder="Enter your nickname"
              placeholderTextColor={colors.text.muted}
              value={nickname}
              onChangeText={setNickname}
            />
          </View>
        </View>

        {/* Date of Birth */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>Date of Birth</Text>
          <TouchableOpacity
            style={[styles.inputContainer, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.text.muted} style={styles.inputIcon} />
            <Text style={[styles.input, { color: dateOfBirth ? colors.text.primary : colors.text.muted }]}>
              {dateOfBirth ? formatDate(dateOfBirth) : 'Select date'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setDateOfBirth(selectedDate);
                }
              }}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Email */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>Email</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <Ionicons name="mail-outline" size={20} color={colors.text.muted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              placeholder="your@email.com"
              placeholderTextColor={colors.text.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Phone Number */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>Phone Number</Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <View style={styles.phonePrefix}>
              <Text style={[styles.flag, { color: colors.text.primary }]}>🇺🇸</Text>
              <Text style={[styles.prefixText, { color: colors.text.primary }]}>+1</Text>
            </View>
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              placeholder="000 000 0000"
              placeholderTextColor={colors.text.muted}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Gender */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: colors.text.secondary }]}>Gender</Text>
          <TouchableOpacity
            style={[styles.inputContainer, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
            onPress={() => setShowGenderPicker(!showGenderPicker)}
          >
            <Text style={[styles.input, { color: gender ? colors.text.primary : colors.text.muted }]}>
              {gender || 'Select gender'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.text.muted} />
          </TouchableOpacity>
          {showGenderPicker && (
            <View style={[styles.dropdown, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
              {['Male', 'Female', 'Other'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setGender(option as any);
                    setShowGenderPicker(false);
                  }}
                >
                  <Text style={[styles.dropdownText, { color: colors.text.primary }]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.primary, opacity: canContinue ? 1 : 0.5 }]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    gap: 6,
  },
  flag: {
    fontSize: 20,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdown: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  dropdownText: {
    fontSize: 16,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  continueButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

