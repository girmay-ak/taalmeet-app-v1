/**
 * Sign In Screen - Updated Design with Animations
 * Matches ux-template LoginScreen design exactly
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
import Animated, { FadeIn, FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Svg, Path } from 'react-native-svg';
import { FlowingWavesRN, TaalMeetLogo } from '@/components';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useSignIn } from '@/hooks/useAuth';
import { signInSchema, type SignInInput } from '@/utils/validators';

// Google Icon Component
const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </Svg>
);

// Apple Icon Component
const AppleIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <Path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </Svg>
);

export default function SignInScreen() {
  const { colors } = useTheme();
  const signInMutation = useSignIn();
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

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

  // Button press animations
  const loginButtonScale = useSharedValue(1);
  const googleButtonScale = useSharedValue(1);
  const appleButtonScale = useSharedValue(1);
  
  const loginButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: loginButtonScale.value }],
  }));

  const handleLoginButtonPress = () => {
    loginButtonScale.value = withSpring(0.98, { damping: 15 });
    setTimeout(() => {
      loginButtonScale.value = withSpring(1, { damping: 15 });
    }, 100);
  };

  return (
    <View style={styles.container}>
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
                          borderColor: errors.email 
                            ? '#EF4444' 
                            : focusedInput === 'email' 
                            ? '#1DB954' 
                            : '#2A2A2A',
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
                          onBlur={() => {
                            onBlur();
                            setFocusedInput(null);
                          }}
                          onFocus={() => setFocusedInput('email')}
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
                          borderColor: errors.password 
                            ? '#EF4444' 
                            : focusedInput === 'password' 
                            ? '#1DB954' 
                            : '#2A2A2A',
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
                          onBlur={() => {
                            onBlur();
                            setFocusedInput(null);
                          }}
                          onFocus={() => setFocusedInput('password')}
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
              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity 
                  onPress={() => Alert.alert('Forgot Password', 'Password reset functionality coming soon!')}
                >
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Log In Button */}
              <Animated.View style={loginButtonAnimatedStyle}>
                <TouchableOpacity
                  onPress={() => {
                    handleLoginButtonPress();
                    handleSubmit(onSubmit)();
                  }}
                  disabled={signInMutation.isPending}
                  activeOpacity={1}
                >
                  <LinearGradient
                    colors={['#1DB954', '#1ED760']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.loginButton,
                      signInMutation.isPending && styles.loginButtonDisabled
                    ]}
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
              <Animated.View style={useAnimatedStyle(() => ({
                transform: [{ scale: googleButtonScale.value }],
              }))}>
                <TouchableOpacity 
                  style={styles.socialButtonGoogle}
                  onPress={() => {
                    googleButtonScale.value = withSpring(0.98, { damping: 15 });
                    setTimeout(() => {
                      googleButtonScale.value = withSpring(1, { damping: 15 });
                      Alert.alert('Coming Soon', 'Google Sign In will be available soon!');
                    }, 100);
                  }}
                  activeOpacity={1}
                >
                  <GoogleIcon size={20} />
                  <Text style={styles.socialButtonTextGoogle}>Continue with Google</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Apple Button */}
              <Animated.View style={useAnimatedStyle(() => ({
                transform: [{ scale: appleButtonScale.value }],
              }))}>
                <TouchableOpacity 
                  style={styles.socialButtonApple}
                  onPress={() => {
                    appleButtonScale.value = withSpring(0.98, { damping: 15 });
                    setTimeout(() => {
                      appleButtonScale.value = withSpring(1, { damping: 15 });
                      Alert.alert('Coming Soon', 'Apple Sign In will be available soon!');
                    }, 100);
                  }}
                  activeOpacity={1}
                >
                  <AppleIcon size={20} />
                  <Text style={styles.socialButtonTextApple}>Continue with Apple</Text>
                </TouchableOpacity>
              </Animated.View>
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
    backgroundColor: '#0F0F0F',
  },
  safeArea: {
    flex: 1,
  },
  backgroundWaves: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48, // mb-12
  },
  logoContainer: {
    width: 80, // w-20
    height: 80, // h-20
    borderRadius: 24, // rounded-3xl
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16, // mb-4
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8, // shadow-lg
  },
  title: {
    fontSize: 30, // text-3xl
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8, // mb-2
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  formContainer: {
    marginBottom: 24, // mb-6
    gap: 16, // space-y-4
  },
  inputSection: {
    marginBottom: 16, // space-y-4
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8, // mb-2
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12, // rounded-xl
    borderWidth: 1,
    paddingHorizontal: 16, // px-4
    paddingVertical: 16, // py-4
    height: 56,
    backgroundColor: '#1A1A1A',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12, // left-4 equivalent
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    paddingRight: 12,
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
  forgotPasswordContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 0,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#5FB3B3',
  },
  loginButton: {
    height: 56,
    borderRadius: 12, // rounded-xl
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  loginButtonDisabled: {
    opacity: 0.5,
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
    marginBottom: 24, // mb-6
    gap: 16, // gap-4
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A2A2A',
  },
  dividerText: {
    paddingHorizontal: 0,
    fontSize: 14,
    color: '#9CA3AF',
  },
  socialContainer: {
    marginBottom: 32, // mb-8
    gap: 12, // space-y-3
  },
  socialButtonGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12, // rounded-xl
    backgroundColor: '#FFFFFF',
    gap: 12, // gap-3
    paddingHorizontal: 16,
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
    borderRadius: 12, // rounded-xl
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 12, // gap-3
    paddingHorizontal: 16,
  },
  socialButtonTextApple: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 0,
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
