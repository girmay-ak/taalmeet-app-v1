import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { ConversationCard } from '../components/ConversationCard';
import { useConversations } from '../hooks/useMessages';

interface MessagesScreenProps {
  onConversationClick: (conversationId: string) => void;
}

export function MessagesScreen({ onConversationClick }: MessagesScreenProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get real conversations data
  const { data: conversations = [], isLoading } = useConversations();

  const tabs = [
    { id: 'all', label: 'All', count: conversations.length },
    { id: 'unread', label: 'Unread', count: conversations.filter((c: any) => (c.unread_count || 0) > 0).length },
    { id: 'archived', label: 'Archived', count: 0 }
  ];

  const filteredConversations = conversations.filter((conv: any) => {
    if (activeTab === 'unread') return (conv.unreadCount || conv.unread_count || 0) > 0;
    if (activeTab === 'archived') return false; // No archived for demo
    if (searchQuery) {
      // Support both camelCase (from backend) and snake_case (legacy)
      const otherUserName = conv.otherUser?.displayName 
        || conv.otherUser?.name
        || conv.other_user?.display_name 
        || conv.other_user?.name 
        || '';
      return otherUserName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="border-b safe-top" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="px-4 pt-4 pb-3">
          {/* Title Bar */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            <button className="p-2 bg-gradient-primary rounded-full active:scale-95 transition-transform">
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#E91E8C] transition-colors"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                  activeTab === tab.id
                    ? 'bg-gradient-primary text-white'
                    : 'bg-[#0F0F0F] text-[#9CA3AF]'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-white/20'
                      : 'bg-[#2A2A2A]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto pb-20">
        {filteredConversations.length > 0 ? (
          <div className="bg-[#1A1A1A]">
            {filteredConversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ConversationCard
                  conversation={conversation}
                  onClick={() => onConversationClick(conversation.id)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                <Search className="w-12 h-12 text-[#9CA3AF]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No {activeTab} messages
              </h3>
              <p className="text-[#9CA3AF] mb-6">
                {activeTab === 'all' 
                  ? 'Start chatting with language partners'
                  : `You don't have any ${activeTab} messages`
                }
              </p>
              <button className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium active:scale-95 transition-transform">
                Discover Partners
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}