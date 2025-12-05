import { Pin } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConversationCardProps {
  conversation: {
    id: string;
    partnerName: string;
    partnerAvatar: string;
    isOnline: boolean;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    isPinned: boolean;
  };
  onClick?: () => void;
}

export function ConversationCard({ conversation, onClick }: ConversationCardProps) {
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
          src={conversation.partnerAvatar}
          alt={conversation.partnerName}
          className="w-14 h-14 rounded-full object-cover"
        />
        {conversation.isOnline && (
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#4FD1C5] border-2 border-[#0F0F0F] rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">
              {conversation.partnerName}
            </h3>
            {conversation.isPinned && (
              <Pin className="w-3.5 h-3.5 text-[#5FB3B3] flex-shrink-0" />
            )}
          </div>
          <span className="text-xs text-[#9CA3AF] flex-shrink-0 ml-2">
            {conversation.timestamp}
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <p 
            className={`text-sm truncate ${
              conversation.unreadCount > 0 ? 'text-white font-medium' : 'text-[#9CA3AF]'
            }`}
          >
            {conversation.lastMessage}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="flex-shrink-0 bg-gradient-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}