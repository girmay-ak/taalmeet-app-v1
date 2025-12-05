import { useState } from 'react';
import { OnboardingScreens } from './OnboardingScreens';
import { SignupStep1 } from './SignupStep1';
import { SignupStep2 } from './SignupStep2';
import { SignupStep3 } from './SignupStep3';
import { SignupStep4 } from './SignupStep4';
import { SuccessScreen } from './SuccessScreen';
import { useSignUp } from '../../hooks/useAuth';
import { toast } from 'sonner';
import * as profileService from '../../services/profileService';
import * as storageService from '../../services/storageService';

interface SignupFlowProps {
  onComplete: () => void;
  onBackToLogin: () => void;
}

type SignupStep = 'onboarding' | 'step1' | 'step2' | 'step3' | 'step4' | 'success';

interface SignupData {
  name?: string;
  email?: string;
  password?: string;
  learning?: Array<{ name: string; level: string | null }>;
  teaching?: { name: string; level: string };
  city?: string;
  country?: string;
  bio?: string;
  interests?: string[];
  avatar?: string;
}

export function SignupFlow({ onComplete, onBackToLogin }: SignupFlowProps) {
  const [currentStep, setCurrentStep] = useState<SignupStep>('onboarding');
  const [signupData, setSignupData] = useState<SignupData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const signUpMutation = useSignUp();

  const handleOnboardingComplete = () => {
    setCurrentStep('step1');
  };

  const handleOnboardingSkip = () => {
    setCurrentStep('step1');
  };

  const handleStep1Complete = (data: { name: string; email: string; password: string }) => {
    setSignupData({ ...signupData, ...data });
    setCurrentStep('step2');
  };

  const handleStep2Complete = (data: { learning: any[]; teaching: any }) => {
    setSignupData({ ...signupData, ...data });
    setCurrentStep('step3');
  };

  const handleStep3Complete = (data: { city: string; country: string }) => {
    setSignupData({ ...signupData, ...data });
    setCurrentStep('step4');
  };

  const handleStep4Complete = async (data: { bio: string; interests: string[]; avatar?: string }) => {
    const finalData = { ...signupData, ...data };
    setIsSubmitting(true);

    try {
      // Step 1: Create auth user
      if (!finalData.email || !finalData.password || !finalData.name) {
        throw new Error('Missing required signup information');
      }

      const authResult = await signUpMutation.mutateAsync({
        email: finalData.email,
        password: finalData.password,
        name: finalData.name,
      });

      if (!authResult.user) {
        throw new Error('Failed to create account');
      }

      const userId = authResult.user.id;

      // Step 2: Upload avatar if provided
      let avatarUrl: string | undefined;
      if (finalData.avatar) {
        try {
          const uploadResult = await storageService.uploadAvatar(userId, finalData.avatar);
          avatarUrl = uploadResult.publicUrl;
        } catch (error) {
          console.error('Avatar upload failed:', error);
          // Continue without avatar
        }
      }

      // Step 3: Create user profile
      await profileService.createProfile({
        userId,
        displayName: finalData.name,
        avatarUrl,
        bio: finalData.bio,
        city: finalData.city,
        country: finalData.country,
      });

      // Step 4: Save languages
      if (finalData.learning && finalData.teaching) {
        const languages = [
          // Add learning languages
          ...finalData.learning.map(lang => ({
            language: lang.name,
            level: null as const,
            role: 'learning' as const,
          })),
          // Add teaching language
          {
            language: finalData.teaching.name,
            level: (finalData.teaching.level as 'native' | 'advanced' | 'intermediate' | 'beginner' | null) || null,
            role: 'teaching' as const,
          },
        ];

        await profileService.updateUserLanguages(userId, { languages });
      }

      toast.success('Account created successfully!');
      setCurrentStep('success');
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error?.message || 'Failed to create account. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <>
      {currentStep === 'onboarding' && (
        <OnboardingScreens
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      {currentStep === 'step1' && (
        <SignupStep1
          onNext={handleStep1Complete}
          onBack={handleBackFromStep1}
        />
      )}

      {currentStep === 'step2' && (
        <SignupStep2
          onNext={handleStep2Complete}
          onBack={handleBackFromStep2}
        />
      )}

      {currentStep === 'step3' && (
        <SignupStep3
          onNext={handleStep3Complete}
          onBack={handleBackFromStep3}
        />
      )}

      {currentStep === 'step4' && (
        <SignupStep4
          onNext={handleStep4Complete}
          onBack={handleBackFromStep4}
          isSubmitting={isSubmitting}
        />
      )}

      {currentStep === 'success' && (
        <SuccessScreen onComplete={onComplete} />
      )}
    </>
  );
}
