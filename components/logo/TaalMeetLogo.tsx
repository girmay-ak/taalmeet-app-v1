/**
 * TaalMeet Logo Component
 * Uses the logo PNG file from assets
 */

import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

interface TaalMeetLogoProps {
  size?: number;
  showText?: boolean;
  variant?: 'full' | 'icon';
  style?: any;
}

// Logo aspect ratio: 1248x832 = 1.5:1 (width:height)
const LOGO_ASPECT_RATIO = 1248 / 832; // 1.5

export function TaalMeetLogo({ 
  size = 120, 
  showText = false, 
  variant = 'full',
  style 
}: TaalMeetLogoProps) {
  // Calculate height based on aspect ratio
  const logoHeight = size / LOGO_ASPECT_RATIO;
  const height = variant === 'full' && showText ? logoHeight * 1.2 : logoHeight;

  return (
    <View style={[styles.container, { width: size, height }, style]}>
      <Image
        source={require('@/assets/logo-taalmeet.png')}
        style={{ width: size, height: logoHeight }}
        contentFit="contain"
        transition={200}
      />
    </View>
  );
}

/**
 * Simple Icon Version (just the logo, no text)
 */
export function TaalMeetIcon({ size = 48, style }: { size?: number; style?: any }) {
  const logoHeight = size / LOGO_ASPECT_RATIO;
  
  return (
    <View style={[styles.container, { width: size, height: logoHeight }, style]}>
      <Image
        source={require('@/assets/logo-taalmeet.png')}
        style={{ width: size, height: logoHeight }}
        contentFit="contain"
        transition={200}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

