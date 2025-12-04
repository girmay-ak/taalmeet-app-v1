/**
 * Groups Screen
 * Browse and discover language exchange groups
 */

import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useGroups, useUserGroups, useJoinGroup } from '@/hooks/useGroups';
import { useAuth } from '@/providers';
import { getLanguageFlag } from '@/utils/languageFlags';

export default function GroupsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'discover' | 'myGroups'>('discover');
  const [refreshing, setRefreshing] = useState(false);

  const { data: allGroups = [], isLoading: groupsLoading, refetch: refetchGroups } = useGroups({
    language: selectedLanguage !== 'all' ? selectedLanguage : undefined,
    search: searchQuery || undefined,
  });
  const { data: userGroups = [], isLoading: userGroupsLoading, refetch: refetchUserGroups } = useUserGroups(user?.id);
  const joinGroupMutation = useJoinGroup();

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchGroups(), refetchUserGroups()]);
    setRefreshing(false);
  };

  const handleJoinGroup = async (groupId: string) => {
    await joinGroupMutation.mutateAsync(groupId);
  };

  const displayedGroups = activeTab === 'discover' ? allGroups : userGroups;
  const isLoading = activeTab === 'discover' ? groupsLoading : userGroupsLoading;

  const languageOptions = ['all', 'Spanish', 'English', 'French', 'German', 'Italian', 'Dutch', 'Japanese'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Groups & Communities</Text>
        <TouchableOpacity onPress={() => router.push('/groups/create')}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'discover' ? colors.primary : colors.text.muted }]}>
            Discover
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'myGroups' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('myGroups')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'myGroups' ? colors.primary : colors.text.muted }]}>
            My Groups ({userGroups.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Search */}
        <View style={styles.section}>
          <View style={[styles.searchContainer, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <Ionicons name="search" size={20} color={colors.text.muted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text.primary }]}
              placeholder="Search groups..."
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Language Filter */}
        {activeTab === 'discover' && (
          <View style={styles.section}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.languageFilter}>
              {languageOptions.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.languageChip,
                    {
                      backgroundColor: selectedLanguage === lang ? colors.primary : colors.background.secondary,
                      borderColor: colors.border.default,
                    },
                  ]}
                  onPress={() => setSelectedLanguage(lang)}
                >
                  <Text
                    style={[
                      styles.languageChipText,
                      { color: selectedLanguage === lang ? '#fff' : colors.text.primary },
                    ]}
                  >
                    {lang === 'all' ? 'All' : getLanguageFlag(lang) + ' ' + lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Groups List */}
        <View style={styles.section}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : displayedGroups.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
              <Ionicons name="people-outline" size={64} color={colors.text.muted} />
              <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                {activeTab === 'discover' ? 'No groups found' : 'No groups yet'}
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.text.muted }]}>
                {activeTab === 'discover'
                  ? 'Try adjusting your search or filters'
                  : 'Join groups to connect with language learners'}
              </Text>
              {activeTab === 'discover' && (
                <TouchableOpacity
                  style={[styles.createButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/groups/create')}
                >
                  <Text style={styles.createButtonText}>Create Group</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.groupsList}>
              {displayedGroups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[styles.groupCard, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
                  onPress={() => router.push(`/groups/${group.id}`)}
                >
                  {/* Cover Image */}
                  {group.cover_image_url ? (
                    <Image source={{ uri: group.cover_image_url }} style={styles.coverImage} />
                  ) : (
                    <View style={[styles.coverPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                      <Ionicons name="people" size={48} color={colors.primary} />
                    </View>
                  )}

                  <View style={styles.groupContent}>
                    <View style={styles.groupHeader}>
                      <View style={styles.groupInfo}>
                        <Text style={[styles.groupName, { color: colors.text.primary }]} numberOfLines={1}>
                          {group.name}
                        </Text>
                        <View style={styles.groupMeta}>
                          <Text style={[styles.groupLanguage, { color: colors.primary }]}>
                            {getLanguageFlag(group.language)} {group.language}
                          </Text>
                          {group.location && (
                            <>
                              <Text style={[styles.groupMetaDot, { color: colors.text.muted }]}>•</Text>
                              <Text style={[styles.groupLocation, { color: colors.text.muted }]}>{group.location}</Text>
                            </>
                          )}
                        </View>
                      </View>
                      {group.is_verified && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                      )}
                    </View>

                    {group.description && (
                      <Text style={[styles.groupDescription, { color: colors.text.muted }]} numberOfLines={2}>
                        {group.description}
                      </Text>
                    )}

                    <View style={styles.groupStats}>
                      <View style={styles.stat}>
                        <Ionicons name="people" size={16} color={colors.text.muted} />
                        <Text style={[styles.statText, { color: colors.text.muted }]}>{group.member_count}</Text>
                      </View>
                      <View style={styles.stat}>
                        <Ionicons name="chatbubble" size={16} color={colors.text.muted} />
                        <Text style={[styles.statText, { color: colors.text.muted }]}>{group.post_count}</Text>
                      </View>
                      <View style={styles.stat}>
                        <Ionicons name="calendar" size={16} color={colors.text.muted} />
                        <Text style={[styles.statText, { color: colors.text.muted }]}>{group.event_count}</Text>
                      </View>
                    </View>

                    {activeTab === 'discover' && !group.is_member && (
                      <TouchableOpacity
                        style={[styles.joinButton, { backgroundColor: colors.primary }]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleJoinGroup(group.id);
                        }}
                        disabled={joinGroupMutation.isPending}
                      >
                        {joinGroupMutation.isPending ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.joinButtonText}>Join Group</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    paddingBottom: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  languageFilter: {
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
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyState: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  groupsList: {
    gap: 16,
  },
  groupCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    width: '100%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupContent: {
    padding: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupLanguage: {
    fontSize: 14,
    fontWeight: '500',
  },
  groupMetaDot: {
    marginHorizontal: 8,
  },
  groupLocation: {
    fontSize: 14,
  },
  groupDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  groupStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
  },
  joinButton: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

