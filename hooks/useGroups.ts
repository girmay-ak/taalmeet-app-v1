/**
 * Groups Hooks
 * React Query hooks for groups and communities
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import * as groupsService from '@/services/groupsService';
import { getUserFriendlyMessage } from '@/utils/errors';
import { useAuth } from '@/providers';
import type {
  GroupInsert,
  GroupPostInsert,
  GroupPostCommentInsert,
  GroupEventInsert,
  GroupEventParticipant,
} from '@/types/database';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const groupKeys = {
  all: ['groups'] as const,
  list: (filters?: any) => [...groupKeys.all, 'list', filters] as const,
  detail: (groupId: string) => [...groupKeys.all, 'detail', groupId] as const,
  userGroups: (userId: string) => [...groupKeys.all, 'userGroups', userId] as const,
  members: (groupId: string) => [...groupKeys.all, 'members', groupId] as const,
  posts: (groupId: string) => [...groupKeys.all, 'posts', groupId] as const,
  postComments: (postId: string) => [...groupKeys.all, 'postComments', postId] as const,
  events: (groupId: string) => [...groupKeys.all, 'events', groupId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all public groups
 */
export function useGroups(filters?: {
  language?: string;
  location?: string;
  search?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: groupKeys.list(filters),
    queryFn: () => groupsService.getGroups(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get user's groups
 */
export function useUserGroups(userId: string | undefined) {
  return useQuery({
    queryKey: groupKeys.userGroups(userId || ''),
    queryFn: () => (userId ? groupsService.getUserGroups(userId) : []),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Get group by ID
 */
export function useGroup(groupId: string | undefined, userId?: string) {
  return useQuery({
    queryKey: groupKeys.detail(groupId || ''),
    queryFn: () => (groupId ? groupsService.getGroupById(groupId, userId) : null),
    enabled: !!groupId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Get group members
 */
export function useGroupMembers(groupId: string | undefined, userId?: string) {
  return useQuery({
    queryKey: groupKeys.members(groupId || ''),
    queryFn: () => (groupId ? groupsService.getGroupMembers(groupId, userId) : []),
    enabled: !!groupId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Get group posts
 */
export function useGroupPosts(groupId: string | undefined, userId?: string, limit: number = 50) {
  return useQuery({
    queryKey: [...groupKeys.posts(groupId || ''), limit],
    queryFn: () => (groupId ? groupsService.getGroupPosts(groupId, userId, limit) : []),
    enabled: !!groupId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Get post comments
 */
export function usePostComments(postId: string | undefined) {
  return useQuery({
    queryKey: groupKeys.postComments(postId || ''),
    queryFn: () => (postId ? groupsService.getPostComments(postId) : []),
    enabled: !!postId,
    staleTime: 30 * 1000,
  });
}

/**
 * Get group events
 */
export function useGroupEvents(
  groupId: string | undefined,
  userId?: string,
  filters?: { status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'; limit?: number }
) {
  return useQuery({
    queryKey: [...groupKeys.events(groupId || ''), filters],
    queryFn: () => (groupId ? groupsService.getGroupEvents(groupId, userId, filters) : []),
    enabled: !!groupId,
    staleTime: 1 * 60 * 1000,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create group mutation
 */
export function useCreateGroup() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (groupData: Omit<GroupInsert, 'created_by'>) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return groupsService.createGroup(user.id, groupData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: groupKeys.userGroups(user.id) });
      }
      Alert.alert('Success', 'Group created successfully!');
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Error', message);
    },
  });
}

/**
 * Join group mutation
 */
export function useJoinGroup() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return groupsService.joinGroup(groupId, user.id);
    },
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: groupKeys.userGroups(user.id) });
      }
      Alert.alert('Success', 'Joined group successfully!');
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Error', message);
    },
  });
}

/**
 * Leave group mutation
 */
export function useLeaveGroup() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return groupsService.leaveGroup(groupId, user.id);
    },
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: groupKeys.userGroups(user.id) });
      }
      Alert.alert('Success', 'Left group successfully');
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Error', message);
    },
  });
}

/**
 * Create group post mutation
 */
export function useCreateGroupPost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      groupId,
      postData,
    }: {
      groupId: string;
      postData: Omit<GroupPostInsert, 'group_id' | 'author_id'>;
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return groupsService.createGroupPost(groupId, user.id, postData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.posts(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(variables.groupId) });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Error', message);
    },
  });
}

/**
 * Toggle post like mutation
 */
export function useTogglePostLike() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, groupId }: { postId: string; groupId: string }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return groupsService.togglePostLike(postId, user.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.posts(variables.groupId) });
    },
    onError: (error) => {
      console.error('Failed to toggle like:', error);
    },
  });
}

/**
 * Create post comment mutation
 */
export function useCreatePostComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      postId,
      commentData,
    }: {
      postId: string;
      commentData: Omit<GroupPostCommentInsert, 'post_id' | 'author_id'>;
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return groupsService.createPostComment(postId, user.id, commentData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.postComments(variables.postId) });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Error', message);
    },
  });
}

/**
 * Create group event mutation
 */
export function useCreateGroupEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      groupId,
      eventData,
    }: {
      groupId: string;
      eventData: Omit<GroupEventInsert, 'group_id' | 'created_by'>;
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return groupsService.createGroupEvent(groupId, user.id, eventData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.events(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(variables.groupId) });
      Alert.alert('Success', 'Event created successfully!');
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Error', message);
    },
  });
}

/**
 * Update event participation mutation
 */
export function useUpdateEventParticipation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      eventId,
      groupId,
      status,
    }: {
      eventId: string;
      groupId: string;
      status: GroupEventParticipant['status'];
    }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return groupsService.updateEventParticipation(eventId, user.id, status);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.events(variables.groupId) });
    },
    onError: (error) => {
      const message = getUserFriendlyMessage(error);
      Alert.alert('Error', message);
    },
  });
}

