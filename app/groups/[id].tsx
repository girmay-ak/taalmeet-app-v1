/**
 * Group Detail Screen
 * View group details, posts, members, and events
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
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import {
  useGroup,
  useGroupPosts,
  useGroupMembers,
  useGroupEvents,
  useJoinGroup,
  useLeaveGroup,
  useCreateGroupPost,
  useTogglePostLike,
  useCreatePostComment,
} from '@/hooks/useGroups';
import { useAuth } from '@/providers';
import { getLanguageFlag } from '@/utils/languageFlags';

export default function GroupDetailScreen() {
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'events'>('posts');
  const [refreshing, setRefreshing] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [showPostInput, setShowPostInput] = useState(false);

  const { data: group, isLoading: groupLoading, refetch: refetchGroup } = useGroup(groupId, user?.id);
  const { data: posts = [], isLoading: postsLoading, refetch: refetchPosts } = useGroupPosts(groupId, user?.id);
  const { data: members = [], isLoading: membersLoading, refetch: refetchMembers } = useGroupMembers(groupId, user?.id);
  const { data: events = [], isLoading: eventsLoading, refetch: refetchEvents } = useGroupEvents(groupId, user?.id, {
    status: 'upcoming',
  });

  const joinGroupMutation = useJoinGroup();
  const leaveGroupMutation = useLeaveGroup();
  const createPostMutation = useCreateGroupPost();
  const toggleLikeMutation = useTogglePostLike();
  const createCommentMutation = useCreatePostComment();

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchGroup(), refetchPosts(), refetchMembers(), refetchEvents()]);
    setRefreshing(false);
  };

  const handleJoinLeave = async () => {
    if (!groupId) return;
    if (group?.is_member) {
      await leaveGroupMutation.mutateAsync(groupId);
    } else {
      await joinGroupMutation.mutateAsync(groupId);
    }
  };

  const handleCreatePost = async () => {
    if (!groupId || !newPostContent.trim()) return;

    try {
      await createPostMutation.mutateAsync({
        groupId,
        postData: { content: newPostContent.trim() },
      });
      setNewPostContent('');
      setShowPostInput(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!groupId) return;
    await toggleLikeMutation.mutateAsync({ postId, groupId });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (groupLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text.primary }]}>Group not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]} numberOfLines={1}>
          {group.name}
        </Text>
        <TouchableOpacity onPress={handleJoinLeave} disabled={joinGroupMutation.isPending || leaveGroupMutation.isPending}>
          {joinGroupMutation.isPending || leaveGroupMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.joinButtonText, { color: colors.primary }]}>
              {group.is_member ? 'Leave' : 'Join'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Group Info */}
        <View style={styles.section}>
          {group.cover_image_url ? (
            <Image source={{ uri: group.cover_image_url }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverPlaceholder, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="people" size={64} color={colors.primary} />
            </View>
          )}

          <View style={styles.groupInfo}>
            <View style={styles.groupHeader}>
              <Text style={[styles.groupName, { color: colors.text.primary }]}>{group.name}</Text>
              {group.is_verified && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
            </View>

            <View style={styles.groupMeta}>
              <Text style={[styles.groupLanguage, { color: colors.primary }]}>
                {getLanguageFlag(group.language)} {group.language}
              </Text>
              {group.location && (
                <>
                  <Text style={[styles.metaDot, { color: colors.text.muted }]}>•</Text>
                  <Text style={[styles.groupLocation, { color: colors.text.muted }]}>{group.location}</Text>
                </>
              )}
            </View>

            {group.description && (
              <Text style={[styles.groupDescription, { color: colors.text.muted }]}>{group.description}</Text>
            )}

            <View style={styles.groupStats}>
              <View style={styles.stat}>
                <Ionicons name="people" size={18} color={colors.text.muted} />
                <Text style={[styles.statText, { color: colors.text.muted }]}>{group.member_count} members</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="chatbubble" size={18} color={colors.text.muted} />
                <Text style={[styles.statText, { color: colors.text.muted }]}>{group.post_count} posts</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="calendar" size={18} color={colors.text.muted} />
                <Text style={[styles.statText, { color: colors.text.muted }]}>{group.event_count} events</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'posts' ? colors.primary : colors.text.muted }]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'members' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab('members')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'members' ? colors.primary : colors.text.muted }]}>
              Members
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'events' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab('events')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'events' ? colors.primary : colors.text.muted }]}>
              Events
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.section}>
          {activeTab === 'posts' && (
            <>
              {/* Create Post */}
              {group.is_member && (
                <View style={[styles.createPostContainer, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
                  {!showPostInput ? (
                    <TouchableOpacity
                      style={styles.createPostButton}
                      onPress={() => setShowPostInput(true)}
                    >
                      <Text style={[styles.createPostPlaceholder, { color: colors.text.muted }]}>
                        Write something to the group...
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View>
                      <TextInput
                        style={[
                          styles.postInput,
                          { backgroundColor: colors.background.primary, borderColor: colors.border.default, color: colors.text.primary },
                        ]}
                        placeholder="What's on your mind?"
                        placeholderTextColor={colors.text.muted}
                        value={newPostContent}
                        onChangeText={setNewPostContent}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                      <View style={styles.postActions}>
                        <TouchableOpacity onPress={() => setShowPostInput(false)}>
                          <Text style={[styles.cancelText, { color: colors.text.muted }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.postButton, { backgroundColor: colors.primary }]}
                          onPress={handleCreatePost}
                          disabled={!newPostContent.trim() || createPostMutation.isPending}
                        >
                          {createPostMutation.isPending ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Text style={styles.postButtonText}>Post</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* Posts List */}
              {postsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : posts.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
                  <Ionicons name="chatbubble-outline" size={48} color={colors.text.muted} />
                  <Text style={[styles.emptyText, { color: colors.text.primary }]}>No posts yet</Text>
                  <Text style={[styles.emptySubtext, { color: colors.text.muted }]}>
                    Be the first to post in this group!
                  </Text>
                </View>
              ) : (
                <View style={styles.postsList}>
                  {posts.map((post) => (
                    <View
                      key={post.id}
                      style={[styles.postCard, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
                    >
                      <View style={styles.postHeader}>
                        <Image
                          source={{
                            uri: post.author?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                          }}
                          style={styles.postAvatar}
                        />
                        <View style={styles.postAuthorInfo}>
                          <Text style={[styles.postAuthorName, { color: colors.text.primary }]}>
                            {post.author?.display_name || 'Unknown'}
                          </Text>
                          <Text style={[styles.postTime, { color: colors.text.muted }]}>{formatTime(post.created_at)}</Text>
                        </View>
                      </View>

                      <Text style={[styles.postContent, { color: colors.text.primary }]}>{post.content}</Text>

                      <View style={styles.postActions}>
                        <TouchableOpacity
                          style={styles.postAction}
                          onPress={() => handleToggleLike(post.id)}
                        >
                          <Ionicons
                            name={post.is_liked ? 'heart' : 'heart-outline'}
                            size={20}
                            color={post.is_liked ? '#EF4444' : colors.text.muted}
                          />
                          <Text style={[styles.postActionText, { color: colors.text.muted }]}>
                            {post.like_count}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.postAction}>
                          <Ionicons name="chatbubble-outline" size={20} color={colors.text.muted} />
                          <Text style={[styles.postActionText, { color: colors.text.muted }]}>
                            {post.comment_count}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {activeTab === 'members' && (
            <>
              {membersLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : members.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
                  <Ionicons name="people-outline" size={48} color={colors.text.muted} />
                  <Text style={[styles.emptyText, { color: colors.text.primary }]}>No members</Text>
                </View>
              ) : (
                <View style={styles.membersList}>
                  {members.map((member) => (
                    <TouchableOpacity
                      key={member.id}
                      style={styles.memberCard}
                      onPress={() => router.push(`/partner/${member.user_id}`)}
                    >
                      <Image
                        source={{
                          uri: member.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                        }}
                        style={styles.memberAvatar}
                      />
                      <View style={styles.memberInfo}>
                        <Text style={[styles.memberName, { color: colors.text.primary }]}>
                          {member.profile?.display_name || 'Unknown'}
                        </Text>
                        <Text style={[styles.memberRole, { color: colors.text.muted }]}>
                          {member.role === 'owner' ? 'Owner' : member.role === 'admin' ? 'Admin' : member.role === 'moderator' ? 'Moderator' : 'Member'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}

          {activeTab === 'events' && (
            <>
              {group.is_member && (
                <TouchableOpacity
                  style={[styles.createEventButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push(`/groups/${groupId}/events/create`)}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.createEventButtonText}>Create Event</Text>
                </TouchableOpacity>
              )}

              {eventsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : events.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
                  <Ionicons name="calendar-outline" size={48} color={colors.text.muted} />
                  <Text style={[styles.emptyText, { color: colors.text.primary }]}>No upcoming events</Text>
                  <Text style={[styles.emptySubtext, { color: colors.text.muted }]}>
                    {group.is_member ? 'Create an event to bring the group together!' : 'Join the group to see events'}
                  </Text>
                </View>
              ) : (
                <View style={styles.eventsList}>
                  {events.map((event) => (
                    <TouchableOpacity
                      key={event.id}
                      style={[styles.eventCard, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}
                      onPress={() => router.push(`/groups/${groupId}/events/${event.id}`)}
                    >
                      <View style={styles.eventHeader}>
                        <Text style={[styles.eventTitle, { color: colors.text.primary }]}>{event.title}</Text>
                        <View style={[styles.eventTypeBadge, { backgroundColor: colors.primary + '20' }]}>
                          <Text style={[styles.eventTypeText, { color: colors.primary }]}>{event.event_type}</Text>
                        </View>
                      </View>
                      {event.description && (
                        <Text style={[styles.eventDescription, { color: colors.text.muted }]} numberOfLines={2}>
                          {event.description}
                        </Text>
                      )}
                      <View style={styles.eventMeta}>
                        <Ionicons name="time-outline" size={16} color={colors.text.muted} />
                        <Text style={[styles.eventMetaText, { color: colors.text.muted }]}>
                          {new Date(event.start_time).toLocaleString()}
                        </Text>
                        {event.location && (
                          <>
                            <Ionicons name="location-outline" size={16} color={colors.text.muted} style={styles.eventMetaIcon} />
                            <Text style={[styles.eventMetaText, { color: colors.text.muted }]}>{event.location}</Text>
                          </>
                        )}
                      </View>
                      <View style={styles.eventFooter}>
                        <View style={styles.eventParticipants}>
                          <Ionicons name="people" size={16} color={colors.text.muted} />
                          <Text style={[styles.eventParticipantsText, { color: colors.text.muted }]}>
                            {event.participant_count} going
                          </Text>
                        </View>
                        {event.is_participating && (
                          <View style={[styles.goingBadge, { backgroundColor: colors.primary + '20' }]}>
                            <Text style={[styles.goingText, { color: colors.primary }]}>Going</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
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
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginHorizontal: 12,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  section: {
    padding: 16,
  },
  coverImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 16,
    marginBottom: 16,
  },
  coverPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  groupInfo: {
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupLanguage: {
    fontSize: 16,
    fontWeight: '500',
  },
  metaDot: {
    marginHorizontal: 8,
  },
  groupLocation: {
    fontSize: 16,
  },
  groupDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  groupStats: {
    flexDirection: 'row',
    gap: 24,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
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
  createPostContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  createPostButton: {
    paddingVertical: 12,
  },
  createPostPlaceholder: {
    fontSize: 15,
  },
  postInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
  },
  postButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  postsList: {
    gap: 16,
  },
  postCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postAuthorInfo: {
    flex: 1,
  },
  postAuthorName: {
    fontSize: 15,
    fontWeight: '600',
  },
  postTime: {
    fontSize: 12,
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postActionText: {
    fontSize: 14,
  },
  membersList: {
    gap: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberRole: {
    fontSize: 13,
    marginTop: 2,
  },
  createEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  createEventButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  eventsList: {
    gap: 16,
  },
  eventCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  eventMetaIcon: {
    marginLeft: 12,
  },
  eventMetaText: {
    fontSize: 13,
    marginLeft: 4,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventParticipantsText: {
    fontSize: 14,
  },
  goingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goingText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

