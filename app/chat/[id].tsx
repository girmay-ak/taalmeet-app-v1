/**
 * Chat Screen - React Native
 * Individual chat conversation with a partner
 */

import { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useMessages, useSendMessage, useMarkAsRead } from '@/hooks/useMessages';
import { useConversations } from '@/hooks/useMessages';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ActivityIndicator } from 'react-native';
import { useEffect } from 'react';

export default function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState('');
  
  // Fetch messages from backend
  const { data: messages = [], isLoading: messagesLoading } = useMessages(conversationId);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();
  const { data: currentUser } = useCurrentUser();
  
  // Get conversation info to find partner details
  const { data: conversations = [] } = useConversations();
  const conversation = conversations.find(c => c.id === conversationId);
  
  // Mark conversation as read when screen is focused
  useEffect(() => {
    if (conversationId) {
      markAsReadMutation.mutate(conversationId);
    }
  }, [conversationId]);

  const handleSend = async () => {
    if (!message.trim() || !conversationId) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId,
        text: message.trim(),
      });
      setMessage('');
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  // Format time for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        {conversation && (
          <TouchableOpacity 
            style={styles.partnerInfo} 
            onPress={() => router.push(`/partner/${conversation.otherUser.id}`)}
          >
            <View style={styles.avatarContainer}>
              <Image 
                source={{ 
                  uri: conversation.otherUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' 
                }} 
                style={styles.avatar} 
              />
            </View>
            <View style={styles.partnerText}>
              <Text style={[styles.partnerName, { color: colors.text.primary }]}>
                {conversation.otherUser.displayName}
              </Text>
              <Text style={[styles.partnerStatus, { color: '#4FD1C5' }]}>Active</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="call-outline" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="videocam-outline" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={22} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        {messagesLoading && messages.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text.muted }]}>Loading messages...</Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
          >
            {/* Date Divider */}
            {messages.length > 0 && (
              <View style={styles.dateDivider}>
                <View style={[styles.dateBadge, { backgroundColor: colors.background.secondary }]}>
                  <Text style={[styles.dateText, { color: colors.text.muted }]}>Today</Text>
                </View>
              </View>
            )}

            {/* Messages */}
            {messages.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.background.secondary }]}>
                  <Ionicons name="chatbubble-outline" size={48} color={colors.text.muted} />
                </View>
                <Text style={[styles.emptyText, { color: colors.text.primary }]}>
                  No messages yet
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.text.muted }]}>
                  Start the conversation!
                </Text>
              </View>
            ) : (
              messages.map((msg) => {
                const isMyMessage = msg.sender_id === currentUser?.id;
                return (
                  <View
                    key={msg.id}
                    style={[styles.messageRow, isMyMessage ? styles.sentRow : styles.receivedRow]}
                  >
                    {!isMyMessage && conversation && (
                      <Image 
                        source={{ 
                          uri: conversation.otherUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' 
                        }} 
                        style={styles.messageAvatar} 
                      />
                    )}
                    <View style={styles.messageContent}>
                      <View
                        style={[
                          styles.messageBubble,
                          isMyMessage
                            ? [styles.sentBubble, { backgroundColor: colors.primary }]
                            : [styles.receivedBubble, { backgroundColor: colors.background.secondary }],
                        ]}
                      >
                        <Text style={[styles.messageText, { color: isMyMessage ? '#FFFFFF' : colors.text.primary }]}>
                          {msg.content}
                        </Text>
                      </View>

                      {/* Message Actions */}
                      <View style={[styles.messageActions, isMyMessage ? styles.sentActions : styles.receivedActions]}>
                        <Text style={[styles.timestamp, { color: colors.text.muted }]}>
                          {formatTime(msg.created_at)}
                        </Text>
                        {isMyMessage && msg.is_read && (
                          <Ionicons name="checkmark-done" size={14} color={colors.text.muted} />
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
          <TouchableOpacity style={styles.inputAction}>
            <Ionicons name="add" size={24} color={colors.text.muted} />
          </TouchableOpacity>

          <View style={[styles.inputContainer, { backgroundColor: colors.background.primary, borderColor: colors.border.default }]}>
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              placeholder="Message..."
              placeholderTextColor={colors.text.muted}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity style={styles.emojiButton}>
              <Ionicons name="happy-outline" size={22} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendButton, { backgroundColor: message.trim() ? colors.primary : colors.border.default }]}
            disabled={!message.trim() || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color={message.trim() ? '#FFFFFF' : colors.text.muted} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  partnerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 4,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4FD1C5',
    borderWidth: 2,
  },
  partnerText: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  partnerStatus: {
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  dateDivider: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '85%',
  },
  sentRow: {
    alignSelf: 'flex-end',
  },
  receivedRow: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageContent: {
    flex: 1,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sentBubble: {
    borderBottomRightRadius: 6,
  },
  receivedBubble: {
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  translationContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  translationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  translationLabel: {
    fontSize: 11,
  },
  translationText: {
    fontSize: 14,
    lineHeight: 18,
  },
  messageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  sentActions: {
    justifyContent: 'flex-end',
  },
  receivedActions: {
    justifyContent: 'flex-start',
  },
  timestamp: {
    fontSize: 11,
  },
  actionButton: {
    padding: 2,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  inputAction: {
    padding: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
  },
  emojiButton: {
    padding: 4,
    marginLeft: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

