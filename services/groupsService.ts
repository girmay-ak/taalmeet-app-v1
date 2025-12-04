/**
 * Groups Service
 * Backend service for managing groups and communities
 */

import { supabase } from '@/lib/supabase';
import { parseSupabaseError } from '@/utils/errors';
import type {
  Group,
  GroupInsert,
  GroupUpdate,
  GroupMember,
  GroupMemberInsert,
  GroupPost,
  GroupPostInsert,
  GroupPostComment,
  GroupPostCommentInsert,
  GroupEvent,
  GroupEventInsert,
  GroupEventParticipant,
  GroupEventParticipantInsert,
  Profile,
} from '@/types/database';
import { excludeBlockedUsers } from './safetyService';

// ============================================================================
// TYPES
// ============================================================================

export interface GroupWithDetails extends Group {
  created_by_profile?: Profile;
  member_count: number;
  post_count: number;
  event_count: number;
  is_member?: boolean;
  user_role?: GroupMember['role'];
}

export interface GroupPostWithAuthor extends GroupPost {
  author?: Profile;
  is_liked?: boolean;
}

export interface GroupEventWithDetails extends GroupEvent {
  created_by_profile?: Profile;
  is_participating?: boolean;
  user_participation_status?: GroupEventParticipant['status'];
}

// ============================================================================
// GROUPS
// ============================================================================

/**
 * Get all public groups, optionally filtered
 */
export async function getGroups(filters?: {
  language?: string;
  location?: string;
  search?: string;
  limit?: number;
}): Promise<GroupWithDetails[]> {
  let query = supabase
    .from('groups')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (filters?.language) {
    query = query.eq('language', filters.language);
  }

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw parseSupabaseError(error);
  }

  return (data || []) as GroupWithDetails[];
}

/**
 * Get user's groups
 */
export async function getUserGroups(userId: string): Promise<GroupWithDetails[]> {
  const { data: memberships, error: membersError } = await supabase
    .from('group_members')
    .select('group_id, role, status')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (membersError) {
    throw parseSupabaseError(membersError);
  }

  if (!memberships || memberships.length === 0) {
    return [];
  }

  const groupIds = memberships.map((m) => m.group_id);
  const roleMap = new Map(memberships.map((m) => [m.group_id, m.role]));

  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('*')
    .in('id', groupIds)
    .order('created_at', { ascending: false });

  if (groupsError) {
    throw parseSupabaseError(groupsError);
  }

  return (groups || []).map((group) => ({
    ...group,
    is_member: true,
    user_role: roleMap.get(group.id),
  })) as GroupWithDetails[];
}

/**
 * Get group by ID with details
 */
export async function getGroupById(groupId: string, userId?: string): Promise<GroupWithDetails | null> {
  const { data: group, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw parseSupabaseError(error);
  }

  // Check if user is a member
  let isMember = false;
  let userRole: GroupMember['role'] | undefined;

  if (userId) {
    const { data: membership } = await supabase
      .from('group_members')
      .select('role, status')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (membership) {
      isMember = true;
      userRole = membership.role;
    }
  }

  return {
    ...group,
    is_member: isMember,
    user_role: userRole,
  } as GroupWithDetails;
}

/**
 * Create a new group
 */
export async function createGroup(userId: string, groupData: Omit<GroupInsert, 'created_by'>): Promise<Group> {
  const insertData: GroupInsert = {
    ...groupData,
    created_by: userId,
  };

  const { data: group, error } = await supabase
    .from('groups')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  // Add creator as owner
  await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: userId,
    role: 'owner',
    status: 'active',
  });

  return group as Group;
}

/**
 * Update group
 */
export async function updateGroup(
  groupId: string,
  updates: GroupUpdate
): Promise<Group> {
  const { data, error } = await supabase
    .from('groups')
    .update(updates)
    .eq('id', groupId)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data as Group;
}

// ============================================================================
// GROUP MEMBERS
// ============================================================================

/**
 * Join a group
 */
export async function joinGroup(groupId: string, userId: string): Promise<GroupMember> {
  const insertData: GroupMemberInsert = {
    group_id: groupId,
    user_id: userId,
    status: 'active',
  };

  const { data, error } = await supabase
    .from('group_members')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data as GroupMember;
}

/**
 * Leave a group
 */
export async function leaveGroup(groupId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('group_members')
    .update({ status: 'left' })
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (error) {
    throw parseSupabaseError(error);
  }
}

/**
 * Get group members
 */
export async function getGroupMembers(groupId: string, userId?: string): Promise<Array<GroupMember & { profile?: Profile }>> {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('group_id', groupId)
    .eq('status', 'active')
    .order('joined_at', { ascending: false });

  if (error) {
    throw parseSupabaseError(error);
  }

  const members = (data || []) as Array<GroupMember & { profile?: Profile }>;

  // Filter out blocked users
  if (userId) {
    return await excludeBlockedUsers(userId, members);
  }

  return members;
}

// ============================================================================
// GROUP POSTS
// ============================================================================

/**
 * Get group posts
 */
export async function getGroupPosts(
  groupId: string,
  userId?: string,
  limit: number = 50
): Promise<GroupPostWithAuthor[]> {
  const { data, error } = await supabase
    .from('group_posts')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('group_id', groupId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw parseSupabaseError(error);
  }

  const posts = (data || []) as GroupPostWithAuthor[];

  // Check if user liked each post
  if (userId && posts.length > 0) {
    const postIds = posts.map((p) => p.id);
    const { data: likes } = await supabase
      .from('group_post_likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds);

    const likedPostIds = new Set(likes?.map((l) => l.post_id) || []);
    posts.forEach((post) => {
      post.is_liked = likedPostIds.has(post.id);
    });
  }

  // Filter out blocked users
  if (userId) {
    return await excludeBlockedUsers(userId, posts);
  }

  return posts;
}

/**
 * Create a group post
 */
export async function createGroupPost(
  groupId: string,
  userId: string,
  postData: Omit<GroupPostInsert, 'group_id' | 'author_id'>
): Promise<GroupPost> {
  const insertData: GroupPostInsert = {
    ...postData,
    group_id: groupId,
    author_id: userId,
  };

  const { data, error } = await supabase
    .from('group_posts')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data as GroupPost;
}

/**
 * Like/unlike a post
 */
export async function togglePostLike(postId: string, userId: string): Promise<boolean> {
  // Check if already liked
  const { data: existing } = await supabase
    .from('group_post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    // Unlike
    const { error } = await supabase
      .from('group_post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) {
      throw parseSupabaseError(error);
    }
    return false;
  } else {
    // Like
    const { error } = await supabase
      .from('group_post_likes')
      .insert({
        post_id: postId,
        user_id: userId,
      });

    if (error) {
      throw parseSupabaseError(error);
    }
    return true;
  }
}

// ============================================================================
// GROUP POST COMMENTS
// ============================================================================

/**
 * Get post comments
 */
export async function getPostComments(postId: string): Promise<Array<GroupPostComment & { author?: Profile }>> {
  const { data, error } = await supabase
    .from('group_post_comments')
    .select(`
      *,
      author:profiles(*)
    `)
    .eq('post_id', postId)
    .is('parent_comment_id', null) // Top-level comments only
    .order('created_at', { ascending: true });

  if (error) {
    throw parseSupabaseError(error);
  }

  return (data || []) as Array<GroupPostComment & { author?: Profile }>;
}

/**
 * Create a comment
 */
export async function createPostComment(
  postId: string,
  userId: string,
  commentData: Omit<GroupPostCommentInsert, 'post_id' | 'author_id'>
): Promise<GroupPostComment> {
  const insertData: GroupPostCommentInsert = {
    ...commentData,
    post_id: postId,
    author_id: userId,
  };

  const { data, error } = await supabase
    .from('group_post_comments')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data as GroupPostComment;
}

// ============================================================================
// GROUP EVENTS
// ============================================================================

/**
 * Get group events
 */
export async function getGroupEvents(
  groupId: string,
  userId?: string,
  filters?: {
    status?: GroupEvent['status'];
    limit?: number;
  }
): Promise<GroupEventWithDetails[]> {
  let query = supabase
    .from('group_events')
    .select(`
      *,
      created_by_profile:profiles!group_events_created_by_fkey(*)
    `)
    .eq('group_id', groupId)
    .order('start_time', { ascending: true });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw parseSupabaseError(error);
  }

  const events = (data || []) as GroupEventWithDetails[];

  // Check if user is participating
  if (userId && events.length > 0) {
    const eventIds = events.map((e) => e.id);
    const { data: participations } = await supabase
      .from('group_event_participants')
      .select('event_id, status')
      .eq('user_id', userId)
      .in('event_id', eventIds);

    const participationMap = new Map(
      participations?.map((p) => [p.event_id, p.status]) || []
    );

    events.forEach((event) => {
      const status = participationMap.get(event.id);
      event.is_participating = !!status;
      event.user_participation_status = status;
    });
  }

  return events;
}

/**
 * Create a group event
 */
export async function createGroupEvent(
  groupId: string,
  userId: string,
  eventData: Omit<GroupEventInsert, 'group_id' | 'created_by'>
): Promise<GroupEvent> {
  const insertData: GroupEventInsert = {
    ...eventData,
    group_id: groupId,
    created_by: userId,
  };

  const { data, error } = await supabase
    .from('group_events')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data as GroupEvent;
}

/**
 * Join/update event participation
 */
export async function updateEventParticipation(
  eventId: string,
  userId: string,
  status: GroupEventParticipant['status']
): Promise<GroupEventParticipant> {
  // Check if already participating
  const { data: existing } = await supabase
    .from('group_event_participants')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('group_event_participants')
      .update({ status })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }

    return data as GroupEventParticipant;
  } else {
    // Create new
    const insertData: GroupEventParticipantInsert = {
      event_id: eventId,
      user_id: userId,
      status,
    };

    const { data, error } = await supabase
      .from('group_event_participants')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }

    return data as GroupEventParticipant;
  }
}

