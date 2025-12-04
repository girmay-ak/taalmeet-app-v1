/**
 * Chat Screen - React Native
 * Individual chat conversation with a partner
 */

import { useState, useRef, useEffect } from 'react';
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
import { useUserProfile } from '@/hooks/useUser';
import { useIsBlocked, useBlockUser } from '@/hooks/useSafety';
import { ReportUserModal } from '@/components/modals/ReportUserModal';
import { ActivityIndicator, Alert } from 'react-native';

export default function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Fetch messages from backend
  const { data: messages = [], isLoading: messagesLoading, isError: messagesError, error: messagesErrorObj } = useMessages(conversationId);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();
  const { data: currentUser } = useCurrentUser();
  
  // Get conversation info to find partner details
  const { data: conversations = [] } = useConversations();
  const conversation = conversations.find(c => c.id === conversationId);
  
  // Get partner profile for online status
  const partnerId = conversation?.otherUser.id;
  const { data: partnerProfile } = useUserProfile(partnerId);
  
  // Check if user is blocked
  const { data: isBlocked = false } = useIsBlocked(currentUser?.id, partnerId);
  const blockUserMutation = useBlockUser();

  // Debug logging (only in development)
  if (__DEV__) {
    console.log('[ChatScreen] Render state:', {
      conversationId,
      messagesLoading,
      messagesError,
      messagesCount: messages?.length || 0,
      currentUserId: currentUser?.id,
      conversationFound: !!conversation,
    });
  }
  
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

  // Handle block user
  const handleBlockUser = () => {
    if (!partnerId) return;
    
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${conversation?.otherUser.displayName || 'this user'}? You won't be able to see each other's messages or profiles.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockUserMutation.mutateAsync(partnerId);
              setShowMenu(false);
              router.back();
            } catch (error) {
              // Error handled by hook
            }
          },
        },
      ]
    );
  };

  // Handle report user
  const handleReportUser = () => {
    setShowMenu(false);
    setShowReportModal(true);
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
                  uri: (conversation.otherUser.avatarUrl && conversation.otherUser.avatarUrl.trim() !== '') 
                    ? conversation.otherUser.avatarUrl 
                    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' 
                }} 
                style={styles.avatar} 
              />
          </View>
          <View style={styles.partnerText}>
              <Text style={[styles.partnerName, { color: colors.text.primary }]}>
                {conversation.otherUser.displayName}
              </Text>
              <Text style={[styles.partnerStatus, { color: partnerProfile?.is_online ? '#4FD1C5' : colors.text.muted }]}>
                {partnerProfile?.is_online ? 'Active now' : 'Offline'}
              </Text>
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
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowMenu(!showMenu)}
          >
            <Ionicons name="ellipsis-vertical" size={22} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Menu Dropdown */}
        {showMenu && (
          <View style={[styles.menuDropdown, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleReportUser}
            >
              <Ionicons name="flag-outline" size={20} color={colors.text.primary} />
              <Text style={[styles.menuItemText, { color: colors.text.primary }]}>Report User</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemDanger]}
              onPress={handleBlockUser}
            >
              <Ionicons name="ban-outline" size={20} color={colors.semantic.error} />
              <Text style={[styles.menuItemText, { color: colors.semantic.error }]}>Block User</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        {messagesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text.muted }]}>Loading messages...</Text>
          </View>
        ) : messagesError ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.background.secondary }]}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.text.muted} />
            </View>
            <Text style={[styles.emptyText, { color: colors.text.primary }]}>
              Error loading messages
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.text.muted }]}>
              Please try again later
            </Text>
          </View>
        ) : !messages || messages.length === 0 ? (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.background.secondary }]}>
                <Ionicons name="chatbubble-outline" size={48} color={colors.text.muted} />
              </View>
              <Text style={[styles.emptyText, { color: colors.text.primary }]}>
                Say hi and start the conversation
              </Text>
            </View>
          </ScrollView>
        ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        >
          {/* Date Divider */}
          <View style={styles.dateDivider}>
            <View style={[styles.dateBadge, { backgroundColor: colors.background.secondary }]}>
              <Text style={[styles.dateText, { color: colors.text.muted }]}>Today</Text>
            </View>
          </View>

          {/* Messages */}
            {messages.map((msg) => {
              const isMyMessage = msg.sender_id === currentUser?.id;
              return (
            <View
              key={msg.id}
              style={[styles.messageRow, isMyMessage ? styles.sentRow : styles.receivedRow]}
            >
              {!isMyMessage && conversation && (
                <Image 
                  source={{ 
                    uri: (conversation.otherUser.avatarUrl && conversation.otherUser.avatarUrl.trim() !== '') 
                      ? conversation.otherUser.avatarUrl 
                      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' 
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
                  {!isMyMessage && (
                    <>
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="language-outline" size={14} color={colors.text.muted} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="volume-high-outline" size={14} color={colors.text.muted} />
                      </TouchableOpacity>
                    </>
                  )}
                  {isMyMessage && msg.is_read && (
                    <Ionicons name="checkmark-done" size={14} color={colors.text.muted} />
                  )}
                </View>
              </View>
            </View>
              );
            })}
        </ScrollView>
        )}

        {/* Input Bar - Disabled if blocked */}
        {isBlocked ? (
          <View style={[styles.inputBar, styles.inputBarBlocked, { backgroundColor: colors.background.secondary, borderColor: colors.border.default }]}>
            <Text style={[styles.blockedMessage, { color: colors.text.muted }]}>
              This user has been blocked. You cannot send messages.
            </Text>
          </View>
        ) : (
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
                onSubmitEditing={() => {
                  // Prevent auto-submit on Enter - only send via button
                  // On mobile, Enter creates new line in multiline TextInput
                }}
                blurOnSubmit={false}
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
        )}
      </KeyboardAvoidingView>
      
      {/* Report User Modal */}
      {partnerId && conversation && (
        <ReportUserModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetUserId={partnerId}
          targetUserName={conversation.otherUser.displayName}
        />
      )}
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
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  sentRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  receivedRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    flexShrink: 0,
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
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    borderBottomLeftRadius: 4,
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
    padding: 4,
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
    minHeight: 48,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingRight: 8,
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
  menuDropdown: {
    position: 'absolute',
    top: 60,
    right: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemDanger: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputBarBlocked: {
    padding: 16,
    alignItems: 'center',
  },
  blockedMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
});

