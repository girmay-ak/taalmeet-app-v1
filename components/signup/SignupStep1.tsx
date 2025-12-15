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

  const canProceed = email && password.length >= 8;

  const handleSubmit = () => {
    if (canProceed) {
      // Use email prefix as name if name not provided
      const displayName = name || email.split('@')[0];
      onNext({ name: displayName, email, password });
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
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoWrapper, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoText}>TM</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Create New Account
          </Text>

          {/* Email */}
          <View style={styles.inputSection}>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.default,
                },
              ]}
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
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputSection}>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.default,
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="Password"
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
          </View>

          {/* Remember Me */}
          <View style={styles.rememberMeContainer}>
            <TouchableOpacity style={styles.checkboxContainer}>
              <View style={[styles.checkbox, { borderColor: colors.border.default }]}>
              </View>
              <Text style={[styles.rememberMeText, { color: colors.text.secondary }]}>
                Remember me
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: colors.primary, opacity: canProceed ? 1 : 0.5 },
            ]}
            onPress={handleSubmit}
            disabled={!canProceed}
          >
            <Text style={styles.submitButtonText}>Sign up</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border.default }]} />
            <Text style={[styles.dividerText, { color: colors.text.secondary }]}>
              or continue with
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border.default }]} />
          </View>

          {/* Social Login Icons */}
          <View style={styles.socialIconsContainer}>
            <TouchableOpacity
              style={[styles.socialIconButton, { backgroundColor: colors.background.secondary }]}
            >
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialIconButton, { backgroundColor: colors.background.secondary }]}
            >
              <Text style={styles.googleG}>G</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialIconButton, { backgroundColor: colors.background.secondary }]}
            >
              <Ionicons name="logo-apple" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginLink}>
            <Text style={[styles.loginText, { color: colors.text.muted }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={onBack}>
              <Text style={[styles.loginLinkText, { color: colors.primary }]}>Sign in</Text>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inputSection: {
    marginBottom: 20,
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
  rememberMeContainer: {
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
  },
  rememberMeText: {
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialIconButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
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

