// Verification Badge Component - TAALMEET
// Shows verification status on user profiles

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useVerificationStatus } from '@/hooks/useVerification';

interface VerificationBadgeProps {
  userId?: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  interactive?: boolean;
}

export function VerificationBadge({ 
  size = 'medium', 
  showLabel = true,
  interactive = true,
}: VerificationBadgeProps) {
  const router = useRouter();
  const { data: status } = useVerificationStatus();

  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  const iconSizes = {
    small: 16,
    medium: 20,
    large: 28,
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  if (!status || status.verification_level === 'none') {
    if (!interactive) return null;

    return (
      <TouchableOpacity
        onPress={() => router.push('/verification')}
        className="flex-row items-center gap-2 px-3 py-2 bg-greyscale-100 rounded-full"
      >
        <View className={`${sizeClasses[size]} items-center justify-center`}>
          <Ionicons name="shield-outline" size={iconSizes[size]} color="#9E9E9E" />
        </View>
        {showLabel && (
          <Text className={`text-greyscale-600 font-urbanist-medium ${textSizes[size]}`}>
            Verify Identity
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  const getLevelColor = () => {
    switch (status.verification_level) {
      case 'basic':
        return '#FFA726'; // Orange
      case 'standard':
        return '#42A5F5'; // Blue
      case 'enhanced':
        return '#07BD74'; // Green
      default:
        return '#9E9E9E';
    }
  };

  const getLevelIcon = () => {
    if (status.face_recognition_enabled) {
      return 'shield-checkmark';
    }
    if (status.id_verified) {
      return 'shield-half';
    }
    return 'shield-outline';
  };

  const getLevelLabel = () => {
    const labels = {
      basic: 'Verified',
      standard: 'Verified',
      enhanced: 'Fully Verified',
    };
    return labels[status.verification_level as keyof typeof labels] || 'Unverified';
  };

  const content = (
    <View className="flex-row items-center gap-2 px-3 py-2 rounded-full" style={{ backgroundColor: `${getLevelColor()}20` }}>
      <View className={`${sizeClasses[size]} items-center justify-center`}>
        <Ionicons name={getLevelIcon()} size={iconSizes[size]} color={getLevelColor()} />
      </View>
      {showLabel && (
        <Text 
          className={`font-urbanist-bold ${textSizes[size]}`} 
          style={{ color: getLevelColor() }}
        >
          {getLevelLabel()}
        </Text>
      )}
    </View>
  );

  if (interactive) {
    return (
      <TouchableOpacity onPress={() => router.push('/verification')}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

