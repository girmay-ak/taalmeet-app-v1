import { MapPin, Heart, MessageCircle, MoreVertical, CheckCircle, Crown, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { StatusIndicator } from './StatusIndicator';

interface Partner {
  id: string;
  name: string;
  age: number;
  avatar: string;
  isOnline: boolean;
  distance: number;
  matchScore: number;
  verified: boolean;
  premium: boolean;
  bio: string;
  teaching: { language: string; level: string; flag: string };
  learning: { language: string; level: string; flag: string };
  interests: string[];
  availableNow: boolean;
  lastActive: string;
  availability?: {
    status: 'available' | 'soon' | 'busy' | 'offline';
    timeLeft?: number;
    preferences?: string[];
  };
}

interface PartnerCardProps {
  partner: Partner;
  onClick?: () => void;
}

export function PartnerCard({ partner, onClick }: PartnerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 border hover:border-[#E91E8C]/30 transition-all cursor-pointer active:scale-[0.98]"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={partner.avatar}
            alt={partner.name}
            className="w-14 h-14 rounded-full object-cover"
          />
          {partner.isOnline && (
            <>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#4FD1C5] border-2 border-[#1A1A1A] rounded-full" />
              {partner.availableNow && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#4FD1C5] rounded-full animate-pulse-ring" />
              )}
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-semibold text-white truncate">
                {partner.name}, {partner.age}
              </h3>
              {partner.verified && (
                <CheckCircle className="w-4 h-4 text-[#5FB3B3] flex-shrink-0" />
              )}
              {partner.premium && (
                <Crown className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="px-2 py-0.5 bg-gradient-primary rounded-full text-white text-xs">
                {partner.matchScore}%
              </div>
            </div>
          </div>

          {/* Location & Status */}
          <div className="flex items-center gap-3 text-xs text-[#9CA3AF] mb-2">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{partner.distance}km away</span>
            </div>
            <span>•</span>
            <span>{partner.lastActive}</span>
          </div>

          {/* Languages */}
          <div className="flex gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0F0F0F] rounded-lg text-xs">
              <span>{partner.teaching.flag}</span>
              <span className="text-[#4FD1C5]">Teaching</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0F0F0F] rounded-lg text-xs">
              <span>{partner.learning.flag}</span>
              <span className="text-[#5FB3B3]">Learning</span>
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-[#9CA3AF] line-clamp-2 mb-3">
            {partner.bio}
          </p>

          {/* Interests */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {partner.interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="px-2 py-0.5 bg-[#2A2A2A] rounded-full text-xs text-[#9CA3AF]"
              >
                {interest}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="flex-1 py-2 bg-gradient-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity active:scale-95"
            >
              <MessageCircle className="w-4 h-4 inline mr-1" />
              Message
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="w-10 h-10 flex items-center justify-center border border-[#2A2A2A] rounded-lg hover:border-[#E91E8C] transition-colors active:scale-95"
            >
              <Heart className="w-5 h-5 text-[#9CA3AF]" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="w-10 h-10 flex items-center justify-center border border-[#2A2A2A] rounded-lg hover:border-[#2A2A2A] transition-colors active:scale-95"
            >
              <MoreVertical className="w-5 h-5 text-[#9CA3AF]" />
            </button>
          </div>
        </div>
      </div>

      {/* Availability Info */}
      {partner.availability && (
        <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIndicator 
                status={partner.availability.status} 
                showLabel 
                timeLeft={partner.availability.timeLeft}
              />
              {partner.availability.timeLeft && partner.availability.status === 'available' && (
                <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                  <Clock className="w-3 h-3" />
                  <span>Free for {Math.floor(partner.availability.timeLeft / 60)}h {partner.availability.timeLeft % 60}m</span>
                </div>
              )}
            </div>
            
            {partner.availability.preferences && partner.availability.preferences.length > 0 && (
              <div className="flex gap-1">
                {partner.availability.preferences.includes('in-person') && <span className="text-sm">☕</span>}
                {partner.availability.preferences.includes('video') && <span className="text-sm">📹</span>}
                {partner.availability.preferences.includes('call') && <span className="text-sm">📞</span>}
                {partner.availability.preferences.includes('chat') && <span className="text-sm">💬</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}