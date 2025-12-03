/**
 * Signup Step 1 - Account Creation
 * Name, Email, Password with validation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';

interface SignupStep1Props {
  onNext: (data: { name: string; email: string; password: string }) => void;
  onBack: () => void;
}

export function SignupStep1({ onNext, onBack }: SignupStep1Props) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength();

  const getStrengthInfo = () => {
    if (passwordStrength <= 25) return { label: 'Weak', color: '#EF4444' };
    if (passwordStrength <= 50) return { label: 'Fair', color: '#F59E0B' };
    if (passwordStrength <= 75) return { label: 'Good', color: '#EAB308' };
    return { label: 'Strong', color: '#10B981' };
  };

  const strengthInfo = getStrengthInfo();

  const checks = [
    { label: '8+ characters', valid: password.length >= 8 },
    { label: '1 uppercase', valid: /[A-Z]/.test(password) },
    { label: '1 number', valid: /[0-9]/.test(password) },
  ];

  const canProceed = name && email && password.length >= 8 && password === confirmPassword;

  const handleSubmit = () => {
    if (canProceed) {
      onNext({ name, email, password });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.stepIndicator, { color: colors.text.muted }]}>1/4</Text>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Create Account 🎉
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.muted }]}>
            Let's get started!
          </Text>

          {/* Full Name */}
          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Full Name</Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.default,
                },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.text.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="John Smith"
                placeholderTextColor={colors.text.muted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Email</Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.default,
                },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.text.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="john@example.com"
                placeholderTextColor={colors.text.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Password</Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.default,
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.text.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="••••••••"
                placeholderTextColor={colors.text.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.text.muted}
                />
              </TouchableOpacity>
            </View>

            {/* Password Strength */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthHeader}>
                  <Text style={[styles.strengthLabel, { color: colors.text.muted }]}>
                    Password strength:
                  </Text>
                  <Text style={[styles.strengthValue, { color: strengthInfo.color }]}>
                    {strengthInfo.label} 💪
                  </Text>
                </View>
                <View
                  style={[styles.strengthBar, { backgroundColor: colors.background.tertiary }]}
                >
                  <View
                    style={[
                      styles.strengthProgress,
                      { width: `${passwordStrength}%`, backgroundColor: strengthInfo.color },
                    ]}
                  />
                </View>
                <View style={styles.checksContainer}>
                  {checks.map((check) => (
                    <View key={check.label} style={styles.checkItem}>
                      <View
                        style={[
                          styles.checkCircle,
                          {
                            backgroundColor: check.valid
                              ? '#10B981'
                              : colors.background.tertiary,
                          },
                        ]}
                      >
                        {check.valid && (
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.checkLabel,
                          { color: check.valid ? '#10B981' : colors.text.muted },
                        ]}
                      >
                        {check.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Confirm Password</Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.background.secondary,
                  borderColor:
                    confirmPassword && password !== confirmPassword
                      ? '#EF4444'
                      : colors.border.default,
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.text.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="••••••••"
                placeholderTextColor={colors.text.muted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.text.muted}
                />
              </TouchableOpacity>
            </View>
            {confirmPassword && password !== confirmPassword && (
              <Text style={styles.errorText}>Passwords don't match</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.primary, opacity: canProceed ? 1 : 0.5 },
            ]}
            onPress={handleSubmit}
            disabled={!canProceed}
          >
            <Text style={styles.submitButtonText}>Next →</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginLink}>
            <Text style={[styles.loginText, { color: colors.text.muted }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={onBack}>
              <Text style={[styles.loginLinkText, { color: colors.primary }]}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    flexGrow: 1,
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
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
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
  eyeIcon: {
    padding: 4,
  },
  strengthContainer: {
    marginTop: 12,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 14,
  },
  strengthValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  strengthBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  strengthProgress: {
    height: '100%',
    borderRadius: 4,
  },
  checksContainer: {
    gap: 4,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkLabel: {
    fontSize: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 8,
  },
  submitButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
  },
  loginLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

