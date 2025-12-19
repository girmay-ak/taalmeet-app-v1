/**
 * Sign In Screen - Updated Design with Animations
 * Matches modern login design with dark theme
 */

import { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
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
    signInMutation.mutate(data);
  };

  return (
    <View style={[styles.container, { backgroundColor: '#0F0F0F' }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Animated Background */}
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
            
            {/* Logo & Header */}
            <Animated.View 
              entering={FadeInUp.duration(600).delay(0)}
              style={styles.header}
            >
              <View style={styles.logoContainer}>
                <TaalMeetLogo size={80} variant="icon" />
              </View>
              <Text style={styles.title}>
                Welcome to TaalMeet
              </Text>
              <Text style={styles.subtitle}>
                Meet. Speak. Connect.
              </Text>
            </Animated.View>

            {/* Login Form */}
            <Animated.View 
              entering={FadeInUp.duration(600).delay(100)}
              style={styles.formContainer}
            >
              {/* Email Input */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Email</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <View style={[
                        styles.inputContainer, 
                        { 
                          backgroundColor: '#1A1A1A',
                          borderColor: errors.email ? '#EF4444' : '#2A2A2A',
                        },
                        errors.email && styles.inputError
                      ]}>
                        <Ionicons 
                          name="mail-outline" 
                          size={20} 
                          color="#9CA3AF" 
                          style={styles.inputIcon} 
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="your@email.com"
                          placeholderTextColor="#9CA3AF"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                        />
                      </View>
                      {errors.email && (
                        <Text style={styles.errorText}>
                          {errors.email.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>Password</Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <View style={[
                        styles.inputContainer, 
                        { 
                          backgroundColor: '#1A1A1A',
                          borderColor: errors.password ? '#EF4444' : '#2A2A2A',
                        },
                        errors.password && styles.inputError
                      ]}>
                        <Ionicons 
                          name="lock-closed-outline" 
                          size={20} 
                          color="#9CA3AF" 
                          style={styles.inputIcon} 
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Enter your password"
                          placeholderTextColor="#9CA3AF"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                        />
                        <TouchableOpacity 
                          onPress={() => setShowPassword(!showPassword)} 
                          style={styles.eyeIcon}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons 
                            name={showPassword ? "eye-outline" : "eye-off-outline"} 
                            size={20} 
                            color="#9CA3AF" 
                          />
                        </TouchableOpacity>
                      </View>
                      {errors.password && (
                        <Text style={styles.errorText}>
                          {errors.password.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>

              {/* Forgot Password */}
              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={() => Alert.alert('Forgot Password', 'Password reset functionality coming soon!')}
              >
                <Text style={styles.forgotPasswordText}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Log In Button */}
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={signInMutation.isPending}
                activeOpacity={0.8}
                style={signInMutation.isPending && styles.loginButtonDisabled}
              >
                <LinearGradient
                  colors={['#1DB954', '#1ED760']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButton}
                >
                  {signInMutation.isPending ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.loginButtonText}>Logging in...</Text>
                    </View>
                  ) : (
                    <Text style={styles.loginButtonText}>Log In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <Animated.View
              entering={FadeIn.duration(600).delay(200)}
              style={styles.divider}
            >
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </Animated.View>

            {/* Social Login */}
            <Animated.View
              entering={FadeInUp.duration(600).delay(300)}
              style={styles.socialContainer}
            >
              {/* Google Button */}
              <TouchableOpacity 
                style={styles.socialButtonGoogle}
                onPress={() => Alert.alert('Coming Soon', 'Google Sign In will be available soon!')}
                activeOpacity={0.8}
              >
                {/* Google G icon - simplified colored G */}
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleIconText}>G</Text>
                </View>
                <Text style={styles.socialButtonTextGoogle}>Continue with Google</Text>
              </TouchableOpacity>

              {/* Apple Button */}
              <TouchableOpacity 
                style={styles.socialButtonApple}
                onPress={() => Alert.alert('Coming Soon', 'Apple Sign In will be available soon!')}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                <Text style={styles.socialButtonTextApple}>Continue with Apple</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Sign Up Link */}
            <Animated.View
              entering={FadeIn.duration(600).delay(400)}
              style={styles.signUpContainer}
            >
              <Text style={styles.signUpText}>
                Don't have an account?{' '}
              </Text>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity>
                  <Text style={styles.signUpLink}>Sign up</Text>
                </TouchableOpacity>
              </Link>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  backgroundWaves: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    zIndex: 0,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
    paddingBottom: 32,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#5FB3B3',
  },
  loginButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    backgroundColor: '#2A2A2A',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
  },
  socialContainer: {
    marginBottom: 32,
    gap: 12,
  },
  socialButtonGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  googleIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  socialButtonTextGoogle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F0F0F',
  },
  socialButtonApple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 12,
  },
  socialButtonTextApple: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  signUpText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1DB954',
  },
});
