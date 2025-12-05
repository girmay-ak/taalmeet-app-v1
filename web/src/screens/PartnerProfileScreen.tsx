import { ArrowLeft, Share2, MoreVertical, MessageCircle, Video, Heart, MapPin, Star, Award, CheckCircle, Crown } from 'lucide-react';
import { mockPartners, mockReviews } from '../data/mockData';

interface PartnerProfileScreenProps {
  partnerId: string;
  onBack: () => void;
  onMessage: () => void;
}

export function PartnerProfileScreen({ partnerId, onBack, onMessage }: PartnerProfileScreenProps) {
  const partner = mockPartners.find(p => p.id === partnerId) || mockPartners[0];

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F] overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1A1A1A]/95 backdrop-blur-sm border-b border-[#2A2A2A] safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-[#2A2A2A] rounded-full transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-[#2A2A2A] rounded-full transition-colors active:scale-95">
              <Share2 className="w-5 h-5 text-white" />
            </button>
            <button className="p-2 hover:bg-[#2A2A2A] rounded-full transition-colors active:scale-95">
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] px-4 pt-6 pb-8">
        <div className="flex flex-col items-center animate-fade-in">
          {/* Avatar */}
          <div className="relative mb-4">
            <img
              src={partner.avatar}
              alt={partner.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-[#2A2A2A]"
            />
            {partner.isOnline && (
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-[#4FD1C5] border-4 border-[#0F0F0F] rounded-full" />
            )}
          </div>

          {/* Name & Badges */}
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-white">
              {partner.name}, {partner.age}
            </h2>
            {partner.verified && (
              <CheckCircle className="w-6 h-6 text-[#5FB3B3]" />
            )}
            {partner.premium && (
              <Crown className="w-6 h-6 text-[#F59E0B]" />
            )}
          </div>

          {/* Location & Status */}
          <div className="flex items-center gap-2 text-[#9CA3AF] mb-1">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{partner.location}</span>
            <span>•</span>
            <span className="text-sm">{partner.distance}km away</span>
          </div>

          {partner.availableNow && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-[#4FD1C5] rounded-full animate-pulse" />
              <span className="text-sm text-[#4FD1C5] font-medium">Available now</span>
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-6 mb-6 mt-2">
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center mb-1">
                <Star className="w-5 h-5 text-[#F59E0B] fill-current" />
                <span className="text-xl font-bold text-white">
                  {partner.rating}
                </span>
              </div>
              <div className="text-xs text-[#9CA3AF]">{partner.reviewCount} reviews</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white mb-1">
                {partner.exchangeCount}
              </div>
              <div className="text-xs text-[#9CA3AF]">Exchanges</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gradient-primary mb-1">
                {partner.matchScore}%
              </div>
              <div className="text-xs text-[#9CA3AF]">Match</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full mb-2">
            <button
              onClick={onMessage}
              className="flex-1 py-3 bg-gradient-primary text-white rounded-xl font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <MessageCircle className="w-5 h-5" />
              Chat Now
            </button>
            <button className="px-4 py-3 border border-[#2A2A2A] rounded-xl active:scale-95 transition-transform">
              <Heart className="w-5 h-5 text-white" />
            </button>
          </div>

          <button className="w-full py-3 border border-[#2A2A2A] text-white rounded-xl font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Video className="w-5 h-5" />
            Video Call
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="px-4 mb-6">
        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
          <h3 className="font-semibold text-white mb-3">About</h3>
          <p className="text-[#9CA3AF] text-sm leading-relaxed">
            {partner.bio}
          </p>
        </div>
      </div>

      {/* Languages Section */}
      <div className="px-4 mb-6">
        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
          <h3 className="font-semibold text-white mb-4">Languages</h3>

          {/* Teaching */}
          <div className="mb-4">
            <p className="text-xs text-[#9CA3AF] mb-2">Teaching</p>
            <div className="flex items-center gap-3 p-3 bg-[#0F0F0F] rounded-lg">
              <span className="text-2xl">{partner.teaching.flag}</span>
              <div className="flex-1">
                <p className="text-white font-medium">{partner.teaching.language}</p>
                <p className="text-xs text-[#4FD1C5]">{partner.teaching.level}</p>
              </div>
              <div className="w-20 h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#4FD1C5] to-[#5FB3B3] rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Learning */}
          <div>
            <p className="text-xs text-[#9CA3AF] mb-2">Learning</p>
            <div className="flex items-center gap-3 p-3 bg-[#0F0F0F] rounded-lg">
              <span className="text-2xl">{partner.learning.flag}</span>
              <div className="flex-1">
                <p className="text-white font-medium">{partner.learning.language}</p>
                <p className="text-xs text-[#5FB3B3]">{partner.learning.level}</p>
              </div>
              <div className="w-20 h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#5FB3B3] to-[#4A9999] rounded-full" style={{ width: '70%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interests Section */}
      <div className="px-4 mb-6">
        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
          <h3 className="font-semibold text-white mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {partner.interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1.5 bg-[#0F0F0F] border border-[#2A2A2A] rounded-full text-sm text-[#9CA3AF]"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="px-4 mb-6">
        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">
              Reviews ({partner.reviewCount})
            </h3>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[#F59E0B] fill-current" />
              <span className="font-semibold text-white">{partner.rating}</span>
            </div>
          </div>

          <div className="space-y-4">
            {mockReviews.map((review) => (
              <div key={review.id} className="pb-4 border-b border-[#2A2A2A] last:border-0 last:pb-0">
                <div className="flex items-start gap-3 mb-2">
                  <img
                    src={review.reviewerAvatar}
                    alt={review.reviewerName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-white text-sm">
                        {review.reviewerName}
                      </h4>
                      <span className="text-xs text-[#9CA3AF]">{review.date}</span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < review.rating
                              ? 'text-[#F59E0B] fill-current'
                              : 'text-[#2A2A2A]'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-[#9CA3AF] leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2 text-[#5FB3B3] text-sm font-medium">
            See all reviews
          </button>
        </div>
      </div>

      {/* Report */}
      <div className="px-4 mb-6">
        <button className="w-full py-3 text-[#EF4444] text-sm">
          Report User
        </button>
      </div>
    </div>
  );
}