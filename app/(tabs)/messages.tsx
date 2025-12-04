/**
 * Messages Screen
 * Conversations list with search and tabs
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { useConversations, useCreateConversation } from '@/hooks/useMessages';
import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { useDiscoverFeed } from '@/hooks/useDiscover';

type TabType = 'all' | 'unread' | 'archived';

export default function MessagesScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch conversations from backend
  const { data: conversations = [], isLoading, isError, error } = useConversations();
  const createConversationMutation = useCreateConversation();
  
  // Get discover feed to find users to chat with
  const { data: discoverData } = useDiscoverFeed({ limit: 10 });

  // Handle new chat button press
  const handleNewChat = async () => {
    // Option 1: Navigate to discover screen to select a user
    // router.push('/(tabs)');
    
    // Option 2: For development - create conversation with first available user
    // This is a temporary solution until we have a proper user selection screen
    if (discoverData?.activeUsers && discoverData.activeUsers.length > 0) {
      const firstUser = discoverData.activeUsers[0];
      try {
        const conversationId = await createConversationMutation.mutateAsync(firstUser.id);
        router.push(`/chat/${conversationId}`);
      } catch (error) {
        // Error is handled by the hook
      }
    } else if (discoverData?.recommendedUsers && discoverData.recommendedUsers.length > 0) {
      const firstUser = discoverData.recommendedUsers[0];
      try {
        const conversationId = await createConversationMutation.mutateAsync(firstUser.id);
        router.push(`/chat/${conversationId}`);
      } catch (error) {
        // Error is handled by the hook
      }
    } else {
      // No users available, navigate to discover screen
      router.push('/(tabs)');
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const tabs = [
    { id: 'all' as TabType, label: 'All', count: conversations?.length || 0 },
    {
      id: 'unread' as TabType,
      label: 'Unread',
      count: (conversations || []).filter((c) => c.unreadCount > 0).length,
    },
    { id: 'archived' as TabType, label: 'Archived', count: 0 },
  ];

  const filteredConversations = (conversations || []).filter((conv) => {
    // Tab filter
    if (activeTab === 'unread' && conv.unreadCount === 0) return false;
    if (activeTab === 'archived') return false;

    // Search filter
    if (searchQuery) {
      return conv.otherUser.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  });

  // Debug logging (after filteredConversations is calculated)
  console.log('[MessagesScreen] Render state:', {
    isLoading,
    isError,
    error: error ? JSON.stringify(error, null, 2) : null,
    conversationsCount: conversations?.length || 0,
    conversations,
    filteredCount: filteredConversations?.length || 0,
  });

  const renderConversation = (conversation: typeof conversations[0]) => (
    <TouchableOpacity
      key={conversation.id}
      style={[
        styles.conversationCard,
        { borderBottomColor: colors.border.default },
      ]}
      activeOpacity={0.7}
      onPress={() => router.push(`/chat/${conversation.id}`)}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image 
          source={{ 
            uri: (conversation.otherUser.avatarUrl && conversation.otherUser.avatarUrl.trim() !== '') 
              ? conversation.otherUser.avatarUrl 
              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' 
          }} 
          style={styles.avatar} 
        />
      </View>

      {/* Content */}
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text.primary }]}>
              {conversation.otherUser.displayName}
            </Text>
          </View>
          <Text style={[styles.timestamp, { color: colors.text.muted }]}>
            {formatTimestamp(conversation.lastMessageAt)}
          </Text>
        </View>
        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              {
                color: conversation.unreadCount > 0 ? colors.text.primary : colors.text.muted,
                fontWeight: conversation.unreadCount > 0 ? '600' : '400',
              },
            ]}
            numberOfLines={1}
          >
            {conversation.lastMessage || 'No messages yet'}
          </Text>
          {conversation.unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadCount}>
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.secondary, borderBottomColor: colors.border.default }]}>
        {/* Title Bar */}
        <View style={styles.titleBar}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Messages</Text>
          <TouchableOpacity 
            style={[styles.newChatButton, { backgroundColor: colors.primary }]}
            onPress={handleNewChat}
            disabled={createConversationMutation.isPending}
          >
            {createConversationMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
            <Ionicons name="add" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}>
          <Ionicons name="search" size={20} color={colors.text.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text.primary }]}
            placeholder="Search conversations..."
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.text.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && { backgroundColor: colors.primary },
                activeTab !== tab.id && { backgroundColor: colors.background.primary },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabLabel,
                  { color: activeTab === tab.id ? '#FFFFFF' : colors.text.muted },
                ]}
              >
                {tab.label}
              </Text>
              {tab.count > 0 && (
                <View
                  style={[
                    styles.tabBadge,
                    {
                      backgroundColor:
                        activeTab === tab.id ? 'rgba(255,255,255,0.2)' : colors.background.tertiary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabBadgeText,
                      { color: activeTab === tab.id ? '#FFFFFF' : colors.text.muted },
                    ]}
                  >
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Conversations List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text.muted }]}>Loading conversations...</Text>
        </View>
      ) : isError ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.background.secondary }]}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.text.muted} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>Error loading conversations</Text>
          <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>
            Please try again later
          </Text>
        </View>
      ) : !conversations || conversations.length === 0 || filteredConversations.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.background.secondary }]}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.text.muted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
            {activeTab === 'all' ? 'No conversations yet' : `No ${activeTab} messages`}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>
              {activeTab === 'all'
                ? 'Start chatting with language partners'
                : `You don't have any ${activeTab} messages`}
            </Text>
              <TouchableOpacity 
                style={[styles.discoverButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(tabs)')}
              >
                <Text style={styles.discoverButtonText}>Discover Language Partners</Text>
              </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.conversationsList}
          contentContainerStyle={styles.conversationsContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.conversationsContainer, { backgroundColor: colors.background.secondary }]}>
            {filteredConversations.map(renderConversation)}
          </View>
        </ScrollView>
        )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  conversationsList: {
    flex: 1,
  },
  conversationsContent: {
    paddingBottom: 100,
  },
  conversationsContainer: {
    marginTop: 0,
  },
  conversationCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  languageFlag: {
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  discoverButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  discoverButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
});
