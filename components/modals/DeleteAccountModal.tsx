/**
 * Delete Account Modal
 * Confirmation modal for account deletion
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useDeleteAccount } from '@/hooks/useAuth';
import { router } from 'expo-router';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const { colors } = useTheme();
  const deleteAccountMutation = useDeleteAccount();
  const [confirmationText, setConfirmationText] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const requiredText = 'DELETE';

  const handleConfirmToggle = () => {
    setIsConfirmed(!isConfirmed);
  };

  const handleDelete = async () => {
    if (!isConfirmed || confirmationText !== requiredText) {
      Alert.alert(
        'Confirmation Required',
        `Please type "${requiredText}" and check the confirmation box to delete your account.`
      );
      return;
    }

    Alert.alert(
      'Delete Account',
      'Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccountMutation.mutateAsync();
              // Navigation will be handled by the hook after successful deletion
              onClose();
            } catch (error) {
              // Error is handled by the hook
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    setConfirmationText('');
    setIsConfirmed(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView
          style={[
            styles.modalContent,
            { backgroundColor: colors.background.primary },
          ]}
          edges={['bottom']}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { borderBottomColor: colors.border.default },
            ]}
          >
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.semantic.error + '20' },
                ]}
              >
                <Ionicons
                  name="trash-outline"
                  size={24}
                  color={colors.semantic.error}
                />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                  Delete Account
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.text.muted }]}>
                  This action cannot be undone
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={[styles.warningBox, { backgroundColor: colors.semantic.error + '10', borderColor: colors.semantic.error + '30' }]}>
              <Ionicons name="warning" size={24} color={colors.semantic.error} />
              <View style={styles.warningContent}>
                <Text style={[styles.warningTitle, { color: colors.text.primary }]}>
                  Warning: Permanent Deletion
                </Text>
                <Text style={[styles.warningText, { color: colors.text.secondary }]}>
                  Deleting your account will permanently remove:
                </Text>
                <View style={styles.warningList}>
                  <Text style={[styles.warningItem, { color: colors.text.secondary }]}>
                    • Your profile and all personal information
                  </Text>
                  <Text style={[styles.warningItem, { color: colors.text.secondary }]}>
                    • All your messages and conversations
                  </Text>
                  <Text style={[styles.warningItem, { color: colors.text.secondary }]}>
                    • Your connections and matches
                  </Text>
                  <Text style={[styles.warningItem, { color: colors.text.secondary }]}>
                    • Your language preferences and settings
                  </Text>
                  <Text style={[styles.warningItem, { color: colors.text.secondary }]}>
                    • All other data associated with your account
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Before You Go
              </Text>
              <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
                If you'd like to keep a copy of your data, you can download it from the Privacy & Safety settings before deleting your account.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Type "{requiredText}" to confirm
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background.secondary,
                    borderColor:
                      confirmationText === requiredText
                        ? colors.semantic.error
                        : colors.border.default,
                    color: colors.text.primary,
                  },
                ]}
                placeholder={requiredText}
                placeholderTextColor={colors.text.muted}
                value={confirmationText}
                onChangeText={setConfirmationText}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.checkboxContainer,
                { backgroundColor: colors.background.secondary },
              ]}
              onPress={handleConfirmToggle}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: isConfirmed
                      ? colors.semantic.error
                      : 'transparent',
                    borderColor: isConfirmed
                      ? colors.semantic.error
                      : colors.border.default,
                  },
                ]}
              >
                {isConfirmed && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
              <Text style={[styles.checkboxLabel, { color: colors.text.primary }]}>
                I understand this action is permanent and cannot be undone
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View
            style={[
              styles.footer,
              { borderTopColor: colors.border.default },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { backgroundColor: colors.background.secondary },
              ]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text.primary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.deleteButton,
                {
                  backgroundColor:
                    isConfirmed && confirmationText === requiredText
                      ? colors.semantic.error
                      : colors.border.default,
                },
              ]}
              onPress={handleDelete}
              disabled={
                !isConfirmed ||
                confirmationText !== requiredText ||
                deleteAccountMutation.isPending
              }
            >
              {deleteAccountMutation.isPending ? (
                <Text style={styles.deleteButtonText}>Deleting...</Text>
              ) : (
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  warningBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    marginBottom: 8,
  },
  warningList: {
    marginTop: 4,
  },
  warningItem: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

