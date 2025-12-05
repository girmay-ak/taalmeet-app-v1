import { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { mockPartners } from '../data/mockData';

interface ConnectionsScreenProps {
  onPartnerClick: (partnerId: string) => void;
}

export function ConnectionsScreen({ onPartnerClick }: ConnectionsScreenProps) {
  const [activeTab, setActiveTab] = useState<'connections' | 'requests' | 'suggested'>('connections');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const connections = mockPartners.slice(0, 4);
  const requests = mockPartners.slice(4, 6);
  const suggested = mockPartners.slice(2, 5);

  const tabs = [
    { id: 'connections', label: 'Connections', count: connections.length },
    { id: 'requests', label: 'Requests', count: requests.length },
    { id: 'suggested', label: 'Suggested', count: suggested.length }
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'connections':
        return connections;
      case 'requests':
        return requests;
      case 'suggested':
        return suggested;
      default:
        return [];
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F]">
      {/* Header */}
      <div className="bg-[#1A1A1A] border-b border-[#2A2A2A] safe-top">
        <div className="px-4 pt-4 pb-3">
          {/* Title Bar */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Connections</h1>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search connections..."
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 py-4 space-y-3">
          {getCurrentData().map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]"
            >
              <div className="flex gap-3">
                {/* Avatar */}
                <div
                  className="relative flex-shrink-0 cursor-pointer"
                  onClick={() => onPartnerClick(partner.id)}
                >
                  <img
                    src={partner.avatar}
                    alt={partner.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  {partner.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#4FD1C5] border-2 border-[#1A1A1A] rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div
                      className="cursor-pointer"
                      onClick={() => onPartnerClick(partner.id)}
                    >
                      <h3 className="font-semibold text-white">
                        {partner.name}, {partner.age}
                      </h3>
                    </div>
                    {activeTab === 'connections' && (
                      <div className="px-2 py-0.5 bg-gradient-primary rounded-full text-white text-xs">
                        {partner.matchScore}%
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-2">
                    <span>{partner.distance}km away</span>
                    <span>•</span>
                    <span>{partner.lastActive}</span>
                  </div>

                  {/* Languages */}
                  <div className="flex gap-2 mb-3">
                    <div className="flex items-center gap-1 px-2 py-1 bg-[#0F0F0F] rounded text-xs">
                      <span>{partner.teaching.flag}</span>
                      <span className="text-[#4FD1C5]">Teaching</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-[#0F0F0F] rounded text-xs">
                      <span>{partner.learning.flag}</span>
                      <span className="text-[#5FB3B3]">Learning</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {activeTab === 'connections' && (
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-gradient-primary text-white rounded-lg text-sm font-medium active:scale-95 transition-transform">
                        Message
                      </button>
                      <button className="flex-1 py-2 border border-[#2A2A2A] text-white rounded-lg text-sm font-medium active:scale-95 transition-transform">
                        Video Call
                      </button>
                    </div>
                  )}

                  {activeTab === 'requests' && (
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-gradient-primary text-white rounded-lg text-sm font-medium active:scale-95 transition-transform">
                        Accept
                      </button>
                      <button className="flex-1 py-2 border border-[#2A2A2A] text-white rounded-lg text-sm font-medium active:scale-95 transition-transform">
                        Decline
                      </button>
                    </div>
                  )}

                  {activeTab === 'suggested' && (
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-gradient-primary text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1 active:scale-95 transition-transform">
                        <UserPlus className="w-4 h-4" />
                        Connect
                      </button>
                      <button
                        onClick={() => onPartnerClick(partner.id)}
                        className="px-4 py-2 border border-[#2A2A2A] text-white rounded-lg text-sm font-medium active:scale-95 transition-transform"
                      >
                        View
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {getCurrentData().length === 0 && (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                <UserPlus className="w-12 h-12 text-[#9CA3AF]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No {activeTab} yet
              </h3>
              <p className="text-[#9CA3AF] mb-6">
                Start connecting with language partners
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
