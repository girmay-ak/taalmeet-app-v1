/**
 * Create Group Screen
 * Form to create a new language exchange group
 */

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useCreateGroup } from '@/hooks/useGroups';
import { useAuth } from '@/providers';

const languageOptions = ['Spanish', 'English', 'French', 'German', 'Italian', 'Dutch', 'Japanese', 'Chinese', 'Korean'];

export default function CreateGroupScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const createGroupMutation = useCreateGroup();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('Spanish');
  const [location, setLocation] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (!language) {
      Alert.alert('Error', 'Please select a language');
      return;
    }

    try {
      const group = await createGroupMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        language,
        location: location.trim() || null,
        is_public: isPublic,
      });

      router.replace(`/groups/${group.id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Create Group</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          {/* Group Name */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Group Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background.secondary, borderColor: colors.border.default, color: colors.text.primary }]}
              placeholder="Enter group name"
              placeholderTextColor={colors.text.muted}
              value={name}
              onChangeText={setName}
              maxLength={100}
            />
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Description</Text>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: colors.background.secondary, borderColor: colors.border.default, color: colors.text.primary },
              ]}
              placeholder="Describe your group..."
              placeholderTextColor={colors.text.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          {/* Language */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Primary Language *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.languageOptions}>
              {languageOptions.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.languageChip,
                    {
                      backgroundColor: language === lang ? colors.primary : colors.background.secondary,
                      borderColor: colors.border.default,
                    },
                  ]}
                  onPress={() => setLanguage(lang)}
                >
                  <Text
                    style={[
                      styles.languageChipText,
                      { color: language === lang ? '#fff' : colors.text.primary },
                    ]}
                  >
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Location */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text.primary }]}>Location (Optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background.secondary, borderColor: colors.border.default, color: colors.text.primary }]}
              placeholder="City or region"
              placeholderTextColor={colors.text.muted}
              value={location}
              onChangeText={setLocation}
              maxLength={100}
            />
          </View>

          {/* Privacy */}
          <View style={[styles.formGroup, styles.switchGroup]}>
            <View>
              <Text style={[styles.label, { color: colors.text.primary }]}>Public Group</Text>
              <Text style={[styles.labelSubtext, { color: colors.text.muted }]}>
                Anyone can find and join this group
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.switch, { backgroundColor: isPublic ? colors.primary : colors.border.default }]}
              onPress={() => setIsPublic(!isPublic)}
            >
              <View style={[styles.switchThumb, { left: isPublic ? 20 : 2 }]} />
            </TouchableOpacity>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[
              styles.createButton,
              {
                backgroundColor: colors.primary,
                opacity: !name.trim() || createGroupMutation.isPending ? 0.5 : 1,
              },
            ]}
            onPress={handleCreate}
            disabled={!name.trim() || createGroupMutation.isPending}
          >
            {createGroupMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create Group</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  labelSubtext: {
    fontSize: 13,
    marginTop: 4,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 100,
  },
  languageOptions: {
    flexDirection: 'row',
  },
  languageChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  languageChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    position: 'absolute',
  },
  createButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

