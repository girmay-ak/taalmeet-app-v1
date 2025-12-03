/**
 * Signup Flow Component
 * Orchestrates the multi-step signup process
 * 
 * INTEGRATION POINTS:
 * - Step 1: Collects name, email, password (stored in state)
 * - Step 2: Collects learning/teaching languages (stored in state)
 * - Step 3: Collects city/country (stored in state)
 * - Step 4: Collects bio, interests, avatar → TRIGGERS useFullSignUp
 */

import React, { useState } from 'react';
import { Alert } from 'react-native';
import { OnboardingScreens } from './OnboardingScreens';
import { SignupStep1 } from './SignupStep1';
import { SignupStep2 } from './SignupStep2';
import { SignupStep3 } from './SignupStep3';
import { SignupStep4 } from './SignupStep4';
import { SuccessScreen } from './SuccessScreen';
import { useFullSignUp } from '@/hooks/useAuth';
import type { Language, TeachingLanguage } from '@/utils/validators';

// ============================================================================
// TYPES
// ============================================================================

interface SignupFlowProps {
  onComplete: () => void;
  onBackToLogin: () => void;
}

type SignupStep = 'onboarding' | 'step1' | 'step2' | 'step3' | 'step4' | 'success';

interface SignupData {
  // Step 1
  name?: string;
  email?: string;
  password?: string;
  // Step 2
  learning?: Language[];
  teaching?: TeachingLanguage;
  // Step 3
  city?: string;
  country?: string;
  // Step 4
  bio?: string;
  interests?: string[];
  avatar?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SignupFlow({ onComplete, onBackToLogin }: SignupFlowProps) {
  const [currentStep, setCurrentStep] = useState<SignupStep>('onboarding');
  const [signupData, setSignupData] = useState<SignupData>({});
  
  // Main signup mutation - called only at the END of Step 4
  const fullSignUpMutation = useFullSignUp();

  // ============================================================================
  // STEP HANDLERS
  // ============================================================================

  /**
   * Onboarding complete → Go to Step 1
   */
  const handleOnboardingComplete = () => {
    setCurrentStep('step1');
  };

  const handleOnboardingSkip = () => {
    setCurrentStep('step1');
  };

  /**
   * Step 1 complete → Store account data, go to Step 2
   * Data: name, email, password
   */
  const handleStep1Complete = (data: { name: string; email: string; password: string }) => {
    setSignupData((prev) => ({ ...prev, ...data }));
    setCurrentStep('step2');
  };

  /**
   * Step 2 complete → Store languages, go to Step 3
   * Data: learning languages, teaching language with level
   */
  const handleStep2Complete = (data: { 
    learning: Language[]; 
    teaching: Language & { level: string } 
  }) => {
    setSignupData((prev) => ({ 
      ...prev, 
      learning: data.learning,
      teaching: data.teaching as TeachingLanguage,
    }));
    setCurrentStep('step3');
  };

  /**
   * Step 3 complete → Store location, go to Step 4
   * Data: city, country
   */
  const handleStep3Complete = (data: { city: string; country: string }) => {
    setSignupData((prev) => ({ ...prev, ...data }));
    setCurrentStep('step4');
  };

  /**
   * Step 4 complete → SUBMIT EVERYTHING TO BACKEND
   * Data: bio, interests, avatar
   * 
   * This is where useFullSignUp is called with ALL collected data
   */
  const handleStep4Complete = async (data: { 
    bio: string; 
    interests: string[]; 
    avatar?: string 
  }) => {
    const finalData = { ...signupData, ...data };

    try {
      // Call the full signup mutation with all data
      await fullSignUpMutation.mutateAsync({
        // Step 1 data
        name: finalData.name!,
        email: finalData.email!,
        password: finalData.password!,
        // Step 2 data
        learning: finalData.learning,
        teaching: finalData.teaching,
        // Step 3 data
        city: finalData.city,
        country: finalData.country,
        // Step 4 data
        bio: finalData.bio,
        interests: finalData.interests,
        avatar: finalData.avatar,
      });

      // Success! Go to success screen
      // The session will be available via AuthProvider after signup
      setCurrentStep('success');
    } catch (error: any) {
      // Error is already shown by the mutation hook
      // Keep user on Step 4 to retry
    }
  };

  // ============================================================================
  // BACK HANDLERS
  // ============================================================================

  const handleBackFromStep1 = () => {
    onBackToLogin();
  };

  const handleBackFromStep2 = () => {
    setCurrentStep('step1');
  };

  const handleBackFromStep3 = () => {
    setCurrentStep('step2');
  };

  const handleBackFromStep4 = () => {
    setCurrentStep('step3');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  switch (currentStep) {
    case 'onboarding':
      return (
        <OnboardingScreens
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      );
      
    case 'step1':
      return (
        <SignupStep1
          onNext={handleStep1Complete}
          onBack={handleBackFromStep1}
        />
      );
      
    case 'step2':
      return (
        <SignupStep2
          onNext={handleStep2Complete}
          onBack={handleBackFromStep2}
        />
      );
      
    case 'step3':
      return (
        <SignupStep3
          onNext={handleStep3Complete}
          onBack={handleBackFromStep3}
        />
      );
      
    case 'step4':
      return (
        <SignupStep4
          onNext={handleStep4Complete}
          onBack={handleBackFromStep4}
          isSubmitting={fullSignUpMutation.isPending}
        />
      );
      
    case 'success':
      return <SuccessScreen onComplete={onComplete} />;
      
    default:
      return null;
  }
}
