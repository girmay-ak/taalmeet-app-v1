/**
 * TaalMeet Logo Component
 * Location pin with speech bubble and people profiles
 */

import { View, StyleSheet } from 'react-native';
import Svg, { Path, Ellipse, Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

interface TaalMeetLogoProps {
  size?: number;
  showText?: boolean;
  variant?: 'full' | 'icon';
  style?: any;
}

export function TaalMeetLogo({ 
  size = 120, 
  showText = false, 
  variant = 'full',
  style 
}: TaalMeetLogoProps) {
  const viewBox = variant === 'full' ? "0 0 200 240" : "0 0 200 200";
  const height = variant === 'full' && showText ? size * 1.2 : size;

  return (
    <View style={[styles.container, { width: size, height }, style]}>
      <Svg width={size} height={height} viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
        <Defs>
          <LinearGradient id="pinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#4FD1C5" stopOpacity="1" />
            <Stop offset="100%" stopColor="#2A9D8F" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Location Pin (Teal) */}
        <Path
          d="M 100 20 C 60 20 30 50 30 90 C 30 130 100 200 100 200 C 100 200 170 130 170 90 C 170 50 140 20 100 20 Z"
          fill="url(#pinGradient)"
          stroke="#2A9D8F"
          strokeWidth="2"
        />

        {/* Speech Bubble (White) inside pin */}
        <Ellipse cx="100" cy="80" rx="45" ry="35" fill="#FFFFFF" />

        {/* Left Person Profile (Dark Blue) */}
        <Path
          d="M 75 70 Q 75 60 85 60 Q 90 60 90 70 Q 90 75 85 75 L 85 85 Q 85 90 80 90 Q 75 90 75 85 Z"
          fill="#1E3A5F"
        />

        {/* Right Person Profile (Dark Blue) */}
        <Path
          d="M 125 70 Q 125 60 115 60 Q 110 60 110 70 Q 110 75 115 75 L 115 85 Q 115 90 120 90 Q 125 90 125 85 Z"
          fill="#1E3A5F"
        />

        {/* Conversation Dots (Orange-Yellow) */}
        <Circle cx="95" cy="75" r="2.5" fill="#FFA500" />
        <Circle cx="100" cy="75" r="2.5" fill="#FFA500" />
        <Circle cx="105" cy="75" r="2.5" fill="#FFA500" />

        {/* TaalMeet Text (if showText is true) */}
        {showText && variant === 'full' && (
          <SvgText
            x="100"
            y="220"
            fontFamily="Arial, sans-serif"
            fontSize="32"
            fontWeight="bold"
            fill="#1E3A5F"
            textAnchor="middle"
          >
            TaalMeet
          </SvgText>
        )}
      </Svg>
    </View>
  );
}

/**
 * Simple Icon Version (just the pin, no text)
 */
export function TaalMeetIcon({ size = 48, style }: { size?: number; style?: any }) {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
        <Defs>
          <LinearGradient id="iconPinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#4FD1C5" stopOpacity="1" />
            <Stop offset="100%" stopColor="#2A9D8F" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Location Pin */}
        <Path
          d="M 100 20 C 60 20 30 50 30 90 C 30 130 100 200 100 200 C 100 200 170 130 170 90 C 170 50 140 20 100 20 Z"
          fill="url(#iconPinGradient)"
        />

        {/* Speech Bubble */}
        <Ellipse cx="100" cy="80" rx="45" ry="35" fill="#FFFFFF" />

        {/* People Profiles */}
        <Path
          d="M 75 70 Q 75 60 85 60 Q 90 60 90 70 Q 90 75 85 75 L 85 85 Q 85 90 80 90 Q 75 90 75 85 Z"
          fill="#1E3A5F"
        />
        <Path
          d="M 125 70 Q 125 60 115 60 Q 110 60 110 70 Q 110 75 115 75 L 115 85 Q 115 90 120 90 Q 125 90 125 85 Z"
          fill="#1E3A5F"
        />

        {/* Conversation Dots */}
        <Circle cx="95" cy="75" r="2.5" fill="#FFA500" />
        <Circle cx="100" cy="75" r="2.5" fill="#FFA500" />
        <Circle cx="105" cy="75" r="2.5" fill="#FFA500" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

