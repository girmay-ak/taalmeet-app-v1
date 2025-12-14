/**
 * Map Error Boundary
 * Catches map rendering errors and shows fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Map Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={[styles.content, { backgroundColor: colors.background.secondary }]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.semantic.error} />
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Map Error
        </Text>
        <Text style={[styles.message, { color: colors.text.muted }]}>
          Something went wrong while loading the map. This might be a temporary issue.
        </Text>
        {__DEV__ && error && (
          <Text style={[styles.errorDetails, { color: colors.text.muted }]}>
            {error.message}
          </Text>
        )}
        <TouchableOpacity
          onPress={onReset}
          style={[styles.resetButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.resetButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    maxWidth: 400,
    width: '100%',
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorDetails: {
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#00000010',
  },
  resetButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

