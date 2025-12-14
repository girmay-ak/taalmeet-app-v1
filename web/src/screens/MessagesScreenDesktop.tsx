import { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, Phone, Video, Send, Smile, Paperclip, ArrowLeft, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConversationCard } from '../components/ConversationCard';
import { useConversations, useMessages, useSendMessage, useMarkAsRead } from '../hooks/useMessages';
import { useAuth } from '../providers/AuthProvider';

interface MessagesScreenDesktopProps {
  initialConversationId?: string;
}

export function MessagesScreenDesktop({ initialConversationId }: MessagesScreenDesktopProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'groups'>('all');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId || null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get conversations from backend
  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  
  // Get messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useMessages(selectedConversationId || undefined);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversationId) {
      markAsReadMutation.mutate(selectedConversationId);
    }
  }, [selectedConversationId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set initial conversation if provided
  useEffect(() => {
    if (initialConversationId && !selectedConversationId) {
      setSelectedConversationId(initialConversationId);
    } else if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [initialConversationId, conversations, selectedConversationId]);

  const tabs = [
    { id: 'all' as const, label: 'All' },
    { id: 'unread' as const, label: 'Unread' },
    { id: 'groups' as const, label: 'Groups' }
  ];

  // Filter conversations
  const filteredConversations = conversations.filter((conv: any) => {
    // Support both camelCase (from backend) and snake_case (legacy)
    const otherUserName = conv.otherUser?.displayName 
      || conv.otherUser?.name
      || conv.other_user?.display_name 
      || conv.other_user?.name 
      || '';
    const lastMessage = conv.lastMessage 
      || conv.last_message?.content 
      || '';
    const matchesSearch = otherUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'unread' && (conv.unreadCount || conv.unread_count || 0) > 0) ||
                      (activeTab === 'groups' && false); // No groups yet
    return matchesSearch && matchesTab;
  });

  // Get selected conversation
  const selectedConversation = conversations.find((c: any) => c.id === selectedConversationId);
  // Support both camelCase (from backend) and snake_case (legacy)
  const partner = selectedConversation?.otherUser || selectedConversation?.other_user;
  const partnerName = partner?.displayName 
    || partner?.display_name 
    || partner?.name 
    || 'User';
  const partnerAvatar = partner?.avatarUrl 
    || partner?.avatar_url 
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerName)}&background=1DB954&color=fff`;
  const isPartnerOnline = partner?.isOnline || partner?.is_online || false;

  const handleSendMessage = async () => {
    if (messageInput.trim() && selectedConversationId && partner?.id) {
      try {
        await sendMessageMutation.mutateAsync({
          conversationId: selectedConversationId,
          receiverId: partner.id,
          content: messageInput.trim(),
        });
        setMessageInput('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  return (
    <div className="flex h-full" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Left Panel - Conversations List */}
      <div className="w-96 border-r flex flex-col" style={{ borderColor: 'var(--color-border)' }}>
        {/* Header */}
        <div className="border-b p-4" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <h1 className="text-2xl mb-4" style={{ color: 'var(--color-text)' }}>Messages</h1>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl placeholder-[#9CA3AF] focus:outline-none transition-colors"
              style={{ 
                backgroundColor: 'var(--color-background)',
                borderWidth: '1px',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                  activeTab === tab.id
                    ? 'bg-gradient-primary text-white'
                    : 'text-[#9CA3AF]'
                }`}
                style={activeTab !== tab.id ? { backgroundColor: 'var(--color-background)' } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <div className="flex items-center justify-center h-full">
              <div style={{ color: 'var(--color-text)' }}>Loading conversations...</div>
            </div>
          ) : filteredConversations.length > 0 ? (
            <div style={{ backgroundColor: 'var(--color-card)' }}>
              {filteredConversations.map((conversation: any, index: number) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`cursor-pointer transition-colors ${
                    selectedConversationId === conversation.id ? 'bg-opacity-50' : ''
                  }`}
                  style={selectedConversationId === conversation.id ? { backgroundColor: 'var(--color-background)' } : {}}
                  onClick={() => setSelectedConversationId(conversation.id)}
                >
                  <ConversationCard conversation={conversation} onClick={() => {}} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-card)' }}>
                <Search className="w-12 h-12 text-[#9CA3AF]" />
              </div>
              <p style={{ color: 'var(--color-text)' }}>No conversations found</p>
              <p className="text-sm text-[#9CA3AF] mt-1">
                {searchQuery ? 'Try adjusting your search' : 'Start a conversation to get started'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Active Chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={partnerAvatar}
                    alt={partnerName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {isPartnerOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#10B981] border-2 rounded-full" style={{ borderColor: 'var(--color-card)' }} />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>{partnerName}</h2>
                  <p className="text-sm text-[#9CA3AF]">
                    {isPartnerOnline ? 'Active now' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95" style={{ backgroundColor: 'var(--color-background)' }}>
                  <Phone className="w-5 h-5" style={{ color: 'var(--color-text)' }} />
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95" style={{ backgroundColor: 'var(--color-background)' }}>
                  <Video className="w-5 h-5" style={{ color: 'var(--color-text)' }} />
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95" style={{ backgroundColor: 'var(--color-background)' }}>
                  <MoreVertical className="w-5 h-5" style={{ color: 'var(--color-text)' }} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div style={{ color: 'var(--color-text)' }}>Loading messages...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="w-12 h-12 text-[#9CA3AF] mb-4 opacity-50" />
                  <p style={{ color: 'var(--color-text)' }}>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <>
                  {messages.map((message: any, index: number) => {
                    const isMine = message.sender_id === user?.id;
                    const messageDate = new Date(message.created_at || message.timestamp);
                    const formattedTime = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2 max-w-[70%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isMine && (
                            <img
                              src={partnerAvatar}
                              alt={partnerName}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          )}
                          <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`px-4 py-3 rounded-2xl ${
                                isMine
                                  ? 'bg-gradient-primary text-white'
                                  : ''
                              }`}
                              style={!isMine ? { backgroundColor: 'var(--color-card)', color: 'var(--color-text)' } : {}}
                            >
                              <p className="text-sm">{message.content || message.text}</p>
                            </div>
                            <span className="text-xs text-[#9CA3AF] mt-1">{formattedTime}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t p-4" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-end gap-3">
                <button className="w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95" style={{ backgroundColor: 'var(--color-background)' }}>
                  <Paperclip className="w-5 h-5" style={{ color: 'var(--color-text)' }} />
                </button>
                <div className="flex-1 rounded-2xl p-3 flex items-center gap-2" style={{ backgroundColor: 'var(--color-background)' }}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 bg-transparent outline-none placeholder-[#9CA3AF]"
                    style={{ color: 'var(--color-text)' }}
                    disabled={sendMessageMutation.isPending}
                  />
                  <button className="text-[#9CA3AF] hover:text-[#5FB3B3] transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-primary opacity-20 flex items-center justify-center">
              <MessageCircle className="w-16 h-16 text-white" />
            </div>
            <h3 className="text-xl mb-2" style={{ color: 'var(--color-text)' }}>Select a conversation</h3>
            <p className="text-sm text-[#9CA3AF] text-center">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}