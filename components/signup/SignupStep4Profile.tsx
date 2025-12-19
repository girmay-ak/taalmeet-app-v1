/**
 * Signup Step 4 - Fill Your Profile
 * Profile form matching Figma design
 * Based on Figma: Eveno Event Booking App UI Kit
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { Image } from 'expo-image';

interface SignupStep4ProfileProps {
  onNext: (data: {
    avatar?: string;
    fullName: string;
    nickname: string;
    dateOfBirth: Date;
    email: string;
    phone: string;
    gender: string;
  }) => void;
  onBack: () => void;
  initialEmail?: string;
  initialName?: string;
  isSubmitting?: boolean;
}

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export function SignupStep4Profile({
  onNext,
  onBack,
  initialEmail = '',
  initialName = '',
  isSubmitting = false,
}: SignupStep4ProfileProps) {
  const { colors } = useTheme();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState(initialName);
  const [nickname, setNickname] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

  const handleDateChange = (newDate: Date) => {
    setDateOfBirth(newDate);
    setShowDatePicker(false);
  };
  
  // Date picker state
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  
  const [selectedYear, setSelectedYear] = useState(dateOfBirth.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(dateOfBirth.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(dateOfBirth.getDate());
  
  const handleDateConfirm = () => {
    const newDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
    handleDateChange(newDate);
  };

  const handleSubmit = () => {
    if (!fullName.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }
    if (!nickname.trim()) {
      Alert.alert('Required Field', 'Please enter a nickname.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Required Field', 'Please enter your email.');
      return;
    }
    if (!gender) {
      Alert.alert('Required Field', 'Please select your gender.');
      return;
    }

    onNext({
      avatar: avatar || undefined,
      fullName: fullName.trim(),
      nickname: nickname.trim(),
      dateOfBirth,
      email: email.trim(),
      phone: phone.trim() || undefined,
      gender,
    });
  };

  const canProceed = fullName.trim() !== '' && nickname.trim() !== '' && email.trim() !== '' && gender !== '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Fill Your Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} style={styles.avatarButton}>
            <View
              style={[
                styles.avatarContainer,
                {
                  backgroundColor: colors.background.secondary,
                },
              ]}
            >
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <Ionicons name="person" size={80} color={colors.text.muted} />
              )}
            </View>
            <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="pencil" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Full Name */}
          <TouchableOpacity
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.mode === 'light' ? '#FAFAFA' : colors.background.secondary,
              },
            ]}
            activeOpacity={1}
          >
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              placeholder="Full Name"
              placeholderTextColor={colors.text.muted}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </TouchableOpacity>

          {/* Nickname */}
          <TouchableOpacity
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.mode === 'light' ? '#FAFAFA' : colors.background.secondary,
              },
            ]}
            activeOpacity={1}
          >
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              placeholder="Nickname"
              placeholderTextColor={colors.text.muted}
              value={nickname}
              onChangeText={setNickname}
              autoCapitalize="words"
            />
          </TouchableOpacity>

          {/* Date of Birth */}
          <TouchableOpacity
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.mode === 'light' ? '#FAFAFA' : colors.background.secondary,
              },
            ]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.inputText, { color: dateOfBirth ? colors.text.primary : colors.text.muted }]}>
              {formatDate(dateOfBirth)}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={colors.text.muted} />
          </TouchableOpacity>

          {/* Date Picker Modal */}
          <Modal
            visible={showDatePicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.background.primary }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Select Date of Birth</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Ionicons name="close" size={24} color={colors.text.primary} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.datePickerScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.datePickerRow}>
                    <View style={styles.datePickerColumn}>
                      <Text style={[styles.datePickerLabel, { color: colors.text.muted }]}>Month</Text>
                      <ScrollView style={styles.datePickerList}>
                        {months.map((month) => (
                          <TouchableOpacity
                            key={month}
                            style={[
                              styles.datePickerItem,
                              selectedMonth === month && { backgroundColor: colors.primary + '20' },
                            ]}
                            onPress={() => setSelectedMonth(month)}
                          >
                            <Text
                              style={[
                                styles.datePickerItemText,
                                { color: selectedMonth === month ? colors.primary : colors.text.primary },
                              ]}
                            >
                              {new Date(2000, month - 1, 1).toLocaleDateString('en-US', { month: 'long' })}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    
                    <View style={styles.datePickerColumn}>
                      <Text style={[styles.datePickerLabel, { color: colors.text.muted }]}>Day</Text>
                      <ScrollView style={styles.datePickerList}>
                        {days.map((day) => (
                          <TouchableOpacity
                            key={day}
                            style={[
                              styles.datePickerItem,
                              selectedDay === day && { backgroundColor: colors.primary + '20' },
                            ]}
                            onPress={() => setSelectedDay(day)}
                          >
                            <Text
                              style={[
                                styles.datePickerItemText,
                                { color: selectedDay === day ? colors.primary : colors.text.primary },
                              ]}
                            >
                              {day}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    
                    <View style={styles.datePickerColumn}>
                      <Text style={[styles.datePickerLabel, { color: colors.text.muted }]}>Year</Text>
                      <ScrollView style={styles.datePickerList}>
                        {years.map((year) => (
                          <TouchableOpacity
                            key={year}
                            style={[
                              styles.datePickerItem,
                              selectedYear === year && { backgroundColor: colors.primary + '20' },
                            ]}
                            onPress={() => setSelectedYear(year)}
                          >
                            <Text
                              style={[
                                styles.datePickerItemText,
                                { color: selectedYear === year ? colors.primary : colors.text.primary },
                              ]}
                            >
                              {year}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </ScrollView>
                
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={handleDateConfirm}
                >
                  <Text style={styles.modalButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Email */}
          <TouchableOpacity
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.mode === 'light' ? '#FAFAFA' : colors.background.secondary,
              },
            ]}
            activeOpacity={1}
          >
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              placeholder="Email"
              placeholderTextColor={colors.text.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Ionicons name="mail-outline" size={20} color={colors.text.muted} />
          </TouchableOpacity>

          {/* Phone Number */}
          <TouchableOpacity
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.mode === 'light' ? '#FAFAFA' : colors.background.secondary,
                width: 380,
                maxWidth: '100%',
              },
            ]}
            activeOpacity={1}
          >
            <View style={styles.phonePrefix}>
              <View style={styles.flagContainer}>
                <Text style={styles.flag}>🇺🇸</Text>
              </View>
              <Ionicons name="chevron-down" size={16} color={colors.text.muted} />
            </View>
            <TextInput
              style={[styles.input, { color: colors.text.primary, flex: 1 }]}
              placeholder="+1 000 000 000"
              placeholderTextColor={colors.text.muted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </TouchableOpacity>

          {/* Gender */}
          <TouchableOpacity
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.mode === 'light' ? '#FAFAFA' : colors.background.secondary,
              },
            ]}
            onPress={() => setShowGenderPicker(!showGenderPicker)}
            activeOpacity={0.7}
          >
            <Text style={[styles.inputText, { color: gender ? colors.text.primary : colors.text.muted }]}>
              {gender || 'Gender'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.text.muted} />
          </TouchableOpacity>

          {/* Gender Picker */}
          {showGenderPicker && (
            <View
              style={[
                styles.pickerContainer,
                {
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.default,
                },
              ]}
            >
              {GENDERS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.pickerItem,
                    {
                      borderBottomColor: colors.border.default,
                    },
                  ]}
                  onPress={() => {
                    setGender(item);
                    setShowGenderPicker(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, { color: colors.text.primary }]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: canProceed && !isSubmitting ? colors.primary : colors.primary + '80',
              shadowColor: colors.primary,
            },
          ]}
          onPress={handleSubmit}
          disabled={!canProceed || isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            {isSubmitting ? 'Creating Account...' : 'Continue'}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    height: 48,
  },
  backButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    gap: 24,
  },
  avatarSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButton: {
    position: 'relative',
  },
  avatarContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
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
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  formSection: {
    gap: 24,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 20,
    width: '100%',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flagContainer: {
    width: 24,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 2,
  },
  flag: {
    fontSize: 18,
  },
  pickerContainer: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: -16,
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  pickerItemText: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  continueButton: {
    height: 56,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowOffset: { width: 4, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  datePickerScroll: {
    maxHeight: 400,
  },
  datePickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  datePickerColumn: {
    flex: 1,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  datePickerList: {
    maxHeight: 200,
  },
  datePickerItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  datePickerItemText: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalButton: {
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

