import { Pin } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConversationCardProps {
  conversation: {
    id: string;
    partnerName?: string;
    partnerAvatar?: string;
    isOnline?: boolean;
    lastMessage?: string;
    timestamp?: string;
    unreadCount?: number;
    isPinned?: boolean;
    // Backend fields (camelCase from messagesService)
    otherUser?: {
      id: string;
      displayName?: string;
      name?: string;
      avatarUrl?: string;
      isOnline?: boolean;
    };
    lastMessageAt?: string;
    // Backend fields (snake_case - legacy support)
    other_user?: {
      id: string;
      display_name?: string;
      name?: string;
      avatar_url?: string;
      is_online?: boolean;
    };
    last_message?: {
      content?: string;
      created_at?: string;
    };
    unread_count?: number;
    updated_at?: string;
  };
  onClick?: () => void;
}

export function ConversationCard({ conversation, onClick }: ConversationCardProps) {
  // Support both mock and backend data structures
  // Check camelCase first (from messagesService), then snake_case (legacy), then mock format
  const partnerName = conversation.partnerName 
    || conversation.otherUser?.displayName 
    || conversation.otherUser?.name
    || conversation.other_user?.display_name 
    || conversation.other_user?.name 
    || 'Unknown';
  
  const partnerAvatar = conversation.partnerAvatar 
    || conversation.otherUser?.avatarUrl
    || conversation.other_user?.avatar_url 
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerName)}&background=1DB954&color=fff`;
  
  const isOnline = conversation.isOnline 
    || conversation.otherUser?.isOnline 
    || conversation.other_user?.is_online 
    || false;
  
  const lastMessage = conversation.lastMessage 
    || conversation.last_message?.content 
    || 'No messages yet';
  
  const unreadCount = conversation.unreadCount 
    || conversation.unread_count 
    || 0;
  
  const timestamp = conversation.timestamp 
    || (conversation.lastMessageAt
      ? new Date(conversation.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : conversation.last_message?.created_at 
      ? new Date(conversation.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : conversation.updated_at 
      ? new Date(conversation.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '');
  
  const isPinned = conversation.isPinned || false;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-4 hover:bg-[#1A1A1A] active:bg-[#222222] transition-colors cursor-pointer border-b last:border-0"
      style={{ borderColor: 'var(--color-border)' }}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={partnerAvatar}
          alt={partnerName}
          className="w-14 h-14 rounded-full object-cover"
        />
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#4FD1C5] border-2 border-[#0F0F0F] rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">
              {partnerName}
            </h3>
            {isPinned && (
              <Pin className="w-3.5 h-3.5 text-[#5FB3B3] flex-shrink-0" />
            )}
          </div>
          {timestamp && (
            <span className="text-xs text-[#9CA3AF] flex-shrink-0 ml-2">
              {timestamp}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <p 
            className={`text-sm truncate ${
              unreadCount > 0 ? 'text-white font-medium' : 'text-[#9CA3AF]'
            }`}
          >
            {lastMessage}
          </p>
          {unreadCount > 0 && (
            <span className="flex-shrink-0 bg-gradient-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}