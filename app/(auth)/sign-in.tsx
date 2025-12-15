/**
 * Sign In Screen - Matches Figma Design
 */

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { FlowingWavesRN, TaalMeetLogo } from '@/components';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useSignIn } from '@/hooks/useAuth';
import { signInSchema, type SignInInput } from '@/utils/validators';

export default function SignInScreen() {
  const { colors } = useTheme();
  const signInMutation = useSignIn();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: SignInInput) => {
    // Prevent duplicate submissions
    if (signInMutation.isPending) {
      return;
    }
    // The useSignIn hook handles success navigation and error alerts
    signInMutation.mutate(data);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Background Animation */}
      <View style={styles.backgroundWaves}>
        <FlowingWavesRN />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          {/* Logo & Header */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
              <TaalMeetLogo size={60} />
            </View>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              Login to Your Account
            </Text>
          </View>

          {/* Email Input */}
          <View style={styles.inputSection}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <View style={[styles.inputContainer, { backgroundColor: colors.background.secondary, borderColor: errors.email ? colors.semantic?.error || '#FF0000' : colors.border.default }]}>
                    <TextInput
                      style={[styles.input, { color: colors.text.primary }]}
                      placeholder="Email"
                      placeholderTextColor={colors.text.muted}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>
                  {errors.email && (
                    <Text style={[styles.errorText, { color: colors.semantic?.error || '#FF0000' }]}>
                      {errors.email.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputSection}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <View style={[styles.inputContainer, { backgroundColor: colors.background.secondary, borderColor: errors.password ? colors.semantic?.error || '#FF0000' : colors.border.default }]}>
                    <TextInput
                      style={[styles.input, { color: colors.text.primary }]}
                      placeholder="Password"
                      placeholderTextColor={colors.text.muted}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                      <Ionicons 
                        name={showPassword ? "eye-outline" : "eye-off-outline"} 
                        size={20} 
                        color={colors.text.muted} 
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Text style={[styles.errorText, { color: colors.semantic?.error || '#FF0000' }]}>
                      {errors.password.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: colors.text.secondary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Remember Me Checkbox */}
          <View style={styles.rememberMeContainer}>
            <TouchableOpacity style={styles.checkboxContainer}>
              <View style={[styles.checkbox, { borderColor: colors.border.default }]}>
              </View>
              <Text style={[styles.rememberMeText, { color: colors.text.secondary }]}>
                Remember me
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit(onSubmit)}
            disabled={signInMutation.isPending}>
            {signInMutation.isPending ? (
              <Text style={styles.loginButtonText}>Signing In...</Text>
            ) : (
              <Text style={styles.loginButtonText}>Sign in</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border.default }]} />
            <Text style={[styles.dividerText, { color: colors.text.secondary }]}>
              or continue with
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border.default }]} />
          </View>

          {/* Social Login Buttons */}
          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
            onPress={() => Alert.alert('Coming Soon', 'Google Sign In will be available soon!')}>
            <Text style={styles.socialIcon}>G</Text>
            <Text style={[styles.socialButtonText, { color: colors.text.primary }]}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
            onPress={() => Alert.alert('Coming Soon', 'Apple Sign In will be available soon!')}>
            <Ionicons name="logo-apple" size={20} color={colors.text.primary} />
            <Text style={[styles.socialButtonText, { color: colors.text.primary }]}>
              Continue with Apple
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={[styles.signUpText, { color: colors.text.secondary }]}>
              Don't have an account?{' '}
            </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity>
                <Text style={[styles.signUpLink, { color: colors.primary }]}>
                  Sign up
                </Text>
              </TouchableOpacity>
            </Link>
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
  backgroundWaves: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
  input: {
    flex: 1,
    fontSize: 16,
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
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  socialIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  signUpText: {
    fontSize: 14,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
