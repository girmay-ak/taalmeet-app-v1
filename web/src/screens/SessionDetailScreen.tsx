import { X, MapPin, Clock, Users, Video, Calendar, Share2, MessageCircle, Star, BadgeCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LanguageSession } from '../data/mockSessions';

interface SessionDetailScreenProps {
  session: LanguageSession | null;
  onClose: () => void;
}

export function SessionDetailScreen({ session, onClose }: SessionDetailScreenProps) {
  if (!session) return null;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-400 bg-green-400/10';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/10';
      case 'advanced': return 'text-red-400 bg-red-400/10';
      default: return 'text-[#5FB3B3] bg-[#5FB3B3]/10';
    }
  };

  const spotsLeft = session.maxAttendees - session.totalAttendees;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-full max-w-[393px] bg-[#0F0F0F] rounded-t-3xl overflow-hidden"
          style={{ maxHeight: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Image/Banner */}
          <div className="relative h-48 bg-gradient-to-br from-[#1DB954]/20 to-[#5FB3B3]/20 overflow-hidden">
            {session.venue?.photos?.[0] ? (
              <img 
                src={session.venue.photos[0]} 
                alt={session.venue.name}
                className="w-full h-full object-cover opacity-60"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl">{session.languageFlag}</span>
              </div>
            )}
            
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <button className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform">
                <Share2 className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* External Source Badge */}
            {session.externalSource === 'evento' && (
              <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-[#1DB954]/90 backdrop-blur-md">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-semibold text-white">Via Evento</span>
                </div>
              </div>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 12rem)' }}>
            <div className="p-6 space-y-6">
              {/* Title & Language */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{session.languageFlag}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getLevelColor(session.level)}`}>
                    {session.level.charAt(0).toUpperCase() + session.level.slice(1)}
                  </span>
                  {session.isVirtual && (
                    <div className="px-2.5 py-1 rounded-full bg-purple-400/10">
                      <span className="text-xs font-semibold text-purple-400">Virtual</span>
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{session.title}</h1>
                <p className="text-sm text-[#9CA3AF] leading-relaxed">{session.description}</p>
              </div>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1A1A1A] rounded-xl p-3 border border-[#2A2A2A]">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-[#1DB954]" />
                    <span className="text-xs text-[#9CA3AF]">Date</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{session.date}</p>
                  <p className="text-xs text-[#9CA3AF]">{session.time}</p>
                </div>

                <div className="bg-[#1A1A1A] rounded-xl p-3 border border-[#2A2A2A]">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-[#5FB3B3]" />
                    <span className="text-xs text-[#9CA3AF]">Duration</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{session.duration} min</p>
                  <p className="text-xs text-[#9CA3AF]">{Math.floor(session.duration / 60)}h {session.duration % 60}m</p>
                </div>
              </div>

              {/* Location/Meeting Link */}
              <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
                <div className="flex items-start gap-3">
                  {session.isVirtual ? (
                    <div className="w-10 h-10 rounded-full bg-purple-400/10 flex items-center justify-center flex-shrink-0">
                      <Video className="w-5 h-5 text-purple-400" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#1DB954]/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#1DB954]" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-[#9CA3AF] mb-1">
                      {session.isVirtual ? 'Meeting Link' : 'Location'}
                    </p>
                    <p className="text-sm font-medium text-white">{session.location}</p>
                    {session.venue && (
                      <p className="text-xs text-[#9CA3AF] mt-1">{session.venue.address}, {session.venue.city}</p>
                    )}
                  </div>
                  {session.isVirtual && session.isUserJoined && (
                    <button className="px-3 py-1.5 rounded-lg bg-[#1DB954] text-white text-xs font-semibold active:scale-95 transition-transform">
                      Join
                    </button>
                  )}
                </div>

                {/* Venue Amenities */}
                {session.venue?.amenities && session.venue.amenities.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
                    <div className="flex flex-wrap gap-2">
                      {session.venue.amenities.map((amenity, index) => (
                        <span key={index} className="px-2 py-1 rounded-md bg-[#0F0F0F] text-xs text-[#9CA3AF]">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Organizer Card */}
              <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
                <p className="text-xs text-[#9CA3AF] mb-3">
                  {session.organizer.type === 'business' ? 'Organized by' : 'Hosted by'}
                </p>
                <div className="flex items-center gap-3">
                  <img 
                    src={session.organizer.avatar} 
                    alt={session.organizer.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="text-sm font-semibold text-white">{session.organizer.name}</h3>
                      {session.organizer.verified && (
                        <BadgeCheck className="w-4 h-4 text-[#1DB954]" />
                      )}
                    </div>
                    
                    {session.organizer.type === 'business' ? (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-[#9CA3AF]">{session.organizer.rating}</span>
                        </div>
                        <span className="text-xs text-[#9CA3AF]">
                          {session.organizer.totalEvents} events
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#9CA3AF]">
                          {session.organizer.hostingCount} sessions hosted
                        </span>
                      </div>
                    )}
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-[#0F0F0F] border border-[#2A2A2A] text-white text-xs font-semibold active:scale-95 transition-transform">
                    View
                  </button>
                </div>

                {session.organizer.bio && (
                  <p className="text-xs text-[#9CA3AF] mt-3 leading-relaxed">
                    {session.organizer.bio}
                  </p>
                )}
              </div>

              {/* Attendees */}
              <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#5FB3B3]" />
                    <span className="text-sm font-semibold text-white">
                      {session.totalAttendees} / {session.maxAttendees} Attendees
                    </span>
                  </div>
                  {spotsLeft > 0 && (
                    <span className="text-xs text-[#1DB954]">{spotsLeft} spots left</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {session.attendees.slice(0, 8).map((avatar, index) => (
                      <img
                        key={index}
                        src={avatar}
                        alt="Attendee"
                        className="w-9 h-9 rounded-full border-2 border-[#0F0F0F] object-cover"
                      />
                    ))}
                    {session.totalAttendees - session.attendees.length > 0 && (
                      <div className="w-9 h-9 rounded-full border-2 border-[#0F0F0F] bg-[#1DB954] flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                          +{session.totalAttendees - session.attendees.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button className="w-full mt-3 py-2 rounded-lg bg-[#0F0F0F] border border-[#2A2A2A] text-white text-xs font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  View All Attendees
                </button>
              </div>

              {/* Tags */}
              {session.tags && session.tags.length > 0 && (
                <div>
                  <p className="text-xs text-[#9CA3AF] mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {session.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1.5 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-white"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="bg-gradient-to-r from-[#1DB954]/10 to-[#5FB3B3]/10 rounded-xl p-4 border border-[#1DB954]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-1">Price</p>
                    <p className="text-2xl font-bold text-white">
                      {session.price === 0 ? 'Free' : `${session.currency} ${session.price}`}
                    </p>
                  </div>
                  {session.price === 0 && (
                    <div className="px-3 py-1.5 rounded-full bg-[#1DB954]">
                      <span className="text-xs font-semibold text-white">Free Event</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pb-6">
                <button className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#1DB954] to-[#1ED760] text-white font-semibold active:scale-95 transition-transform shadow-lg shadow-[#1DB954]/20">
                  {session.isUserJoined ? 'Joined ✓' : 'Join Session'}
                </button>
                <button className="w-14 h-14 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center active:scale-95 transition-transform">
                  <MessageCircle className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
