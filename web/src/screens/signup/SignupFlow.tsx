import { useState } from 'react';
import { OnboardingScreens } from './OnboardingScreens';
import { SignupStep1 } from './SignupStep1';
import { SignupStep2 } from './SignupStep2';
import { SignupStep3 } from './SignupStep3';
import { SignupStep4 } from './SignupStep4';
import { SuccessScreen } from './SuccessScreen';

interface SignupFlowProps {
  onComplete: () => void;
  onBackToLogin: () => void;
}

type SignupStep = 'onboarding' | 'step1' | 'step2' | 'step3' | 'step4' | 'success';

interface SignupData {
  name?: string;
  email?: string;
  password?: string;
  learning?: any[];
  teaching?: any;
  city?: string;
  country?: string;
  bio?: string;
  interests?: string[];
  avatar?: string;
}

export function SignupFlow({ onComplete, onBackToLogin }: SignupFlowProps) {
  const [currentStep, setCurrentStep] = useState<SignupStep>('onboarding');
  const [signupData, setSignupData] = useState<SignupData>({});

  const handleOnboardingComplete = () => {
    setCurrentStep('step1');
  };

  const handleOnboardingSkip = () => {
    setCurrentStep('step1');
  };

  const handleStep1Complete = (data: any) => {
    setSignupData({ ...signupData, ...data });
    setCurrentStep('step2');
  };

  const handleStep2Complete = (data: any) => {
    setSignupData({ ...signupData, ...data });
    setCurrentStep('step3');
  };

  const handleStep3Complete = (data: any) => {
    setSignupData({ ...signupData, ...data });
    setCurrentStep('step4');
  };

  const handleStep4Complete = (data: any) => {
    setSignupData({ ...signupData, ...data });
    // In real app, would submit to backend here
    console.log('Complete signup data:', { ...signupData, ...data });
    setCurrentStep('success');
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
        />
      )}

      {currentStep === 'success' && (
        <SuccessScreen onComplete={onComplete} />
      )}
    </>
  );
}
