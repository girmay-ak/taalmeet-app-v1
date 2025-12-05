import { useState } from 'react';
import { ArrowLeft, Phone, Video, MoreVertical, Send, Smile, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { mockMessages, mockPartners } from '../data/mockData';

interface ChatScreenProps {
  conversationId: string;
  onBack: () => void;
}

export function ChatScreen({ conversationId, onBack }: ChatScreenProps) {
  const [message, setMessage] = useState('');
  const [messages] = useState(mockMessages);
  
  // Get partner from conversation (using Sophie for demo)
  const partner = mockPartners[1];

  const handleSend = () => {
    if (message.trim()) {
      // In a real app, would send message here
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F]">
      {/* Header */}
      <div className="bg-[#1A1A1A] border-b border-[#2A2A2A] safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-[#2A2A2A] rounded-full transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={partner.avatar}
                alt={partner.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {partner.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4FD1C5] border-2 border-[#1A1A1A] rounded-full" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-white truncate">
                {partner.name}
              </h2>
              <p className="text-xs text-[#4FD1C5]">
                {partner.isOnline ? 'Active now' : partner.lastActive}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-[#2A2A2A] rounded-full transition-colors active:scale-95">
              <Phone className="w-5 h-5 text-white" />
            </button>
            <button className="p-2 hover:bg-[#2A2A2A] rounded-full transition-colors active:scale-95">
              <Video className="w-5 h-5 text-white" />
            </button>
            <button className="p-2 hover:bg-[#2A2A2A] rounded-full transition-colors active:scale-95">
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        {/* Date Divider */}
        <div className="flex items-center justify-center mb-4">
          <div className="px-3 py-1 bg-[#1A1A1A] rounded-full text-xs text-[#9CA3AF]">
            Today
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-3">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${msg.isSent ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[80%] ${msg.isSent ? 'flex-row-reverse' : 'flex-row'}`}>
                {!msg.isSent && (
                  <img
                    src={partner.avatar}
                    alt={partner.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                )}
                
                <div>
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      msg.isSent
                        ? 'bg-gradient-primary text-white rounded-br-md'
                        : 'bg-[#1A1A1A] text-white rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                  <p className={`text-xs text-[#9CA3AF] mt-1 ${msg.isSent ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="bg-[#1A1A1A] border-t border-[#2A2A2A] safe-bottom">
        <div className="flex items-end gap-2 px-4 py-3">
          <button className="p-2 text-[#9CA3AF] hover:text-white transition-colors active:scale-95">
            <Plus className="w-6 h-6" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message..."
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#E91E8C] transition-colors resize-none max-h-32"
              style={{ minHeight: '48px' }}
            />
            <button className="absolute right-3 bottom-3 text-[#9CA3AF] hover:text-white transition-colors active:scale-95">
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`p-3 rounded-full transition-all active:scale-95 ${
              message.trim()
                ? 'bg-gradient-primary text-white'
                : 'bg-[#2A2A2A] text-[#9CA3AF]'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
