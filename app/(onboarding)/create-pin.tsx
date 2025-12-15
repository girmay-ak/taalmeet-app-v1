/**
 * Create New PIN Screen
 * Step 3 of profile setup - Security PIN
 */

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';

const { width } = Dimensions.get('window');
const PIN_LENGTH = 4;

export default function CreatePinScreen() {
  const { colors } = useTheme();
  const [pin, setPin] = useState<string[]>([]);

  const handleNumberPress = (number: string) => {
    if (pin.length < PIN_LENGTH) {
      setPin([...pin, number]);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleContinue = () => {
    if (pin.length === PIN_LENGTH) {
      // TODO: Save PIN securely
      router.push('/(onboarding)/set-fingerprint');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Create New PIN
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Description */}
        <Text style={[styles.description, { color: colors.text.secondary }]}>
          Add a PIN number to make your account more secure.
        </Text>

        {/* PIN Dots */}
        <View style={styles.pinContainer}>
          {Array.from({ length: PIN_LENGTH }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.pinDot,
                {
                  backgroundColor: pin[index] ? colors.primary : colors.background.secondary,
                  borderColor: colors.border.default,
                },
              ]}
            />
          ))}
        </View>

        {/* Keypad */}
        <View style={styles.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <TouchableOpacity
              key={number}
              style={[styles.keypadButton, { backgroundColor: colors.background.secondary }]}
              onPress={() => handleNumberPress(String(number))}
            >
              <Text style={[styles.keypadText, { color: colors.text.primary }]}>{number}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.keypadButton} />
          <TouchableOpacity
            style={[styles.keypadButton, { backgroundColor: colors.background.secondary }]}
            onPress={() => handleNumberPress('0')}
          >
            <Text style={[styles.keypadText, { color: colors.text.primary }]}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keypadButton}
            onPress={handleDelete}
          >
            <Ionicons name="backspace-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        {pin.length === PIN_LENGTH && (
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: colors.primary }]}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 48,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  keypadButton: {
    width: (width - 48 - 32) / 3,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadText: {
    fontSize: 24,
    fontWeight: '600',
  },
  continueButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

