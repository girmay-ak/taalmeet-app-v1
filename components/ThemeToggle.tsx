/**
 * Theme Toggle Component
 * Allows switching between Green/Purple themes and Dark/Light modes
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';

export function ThemeToggle() {
  const { theme, mode, setTheme, toggleMode, colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Theme Switcher (Green/Purple) */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text.primary }]}>
          Theme Color
        </Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  theme === 'green' ? colors.primary : colors.background.tertiary,
                borderColor: theme === 'green' ? colors.primary : colors.border.default,
              },
            ]}
            onPress={() => setTheme('green')}>
            <Text
              style={[
                styles.buttonText,
                { color: theme === 'green' ? '#FFFFFF' : colors.text.primary },
              ]}>
              🟢 Green
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  theme === 'purple' ? colors.primary : colors.background.tertiary,
                borderColor:
                  theme === 'purple' ? colors.primary : colors.border.default,
              },
            ]}
            onPress={() => setTheme('purple')}>
            <Text
              style={[
                styles.buttonText,
                { color: theme === 'purple' ? '#FFFFFF' : colors.text.primary },
              ]}>
              🟣 Purple
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mode Switcher (Dark/Light) */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text.primary }]}>
          Appearance
        </Text>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: colors.background.tertiary,
              borderColor: colors.border.default,
            },
          ]}
          onPress={toggleMode}>
          <Text style={[styles.buttonText, { color: colors.text.primary }]}>
            {mode === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Current Theme Info */}
      <View
        style={[
          styles.infoBox,
          {
            backgroundColor: colors.background.secondary,
            borderColor: colors.border.default,
          },
        ]}>
        <Text style={[styles.infoText, { color: colors.text.secondary }]}>
          Current Theme: {theme === 'green' ? '🟢 Green' : '🟣 Purple'}
        </Text>
        <Text style={[styles.infoText, { color: colors.text.secondary }]}>
          Mode: {mode === 'dark' ? '🌙 Dark' : '☀️ Light'}
        </Text>
        <View
          style={[
            styles.colorPreview,
            { backgroundColor: colors.primary },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
  },
  colorPreview: {
    height: 40,
    borderRadius: 8,
    marginTop: 8,
  },
});

