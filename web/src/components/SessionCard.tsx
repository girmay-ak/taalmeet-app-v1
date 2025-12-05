import { ArrowUpRight } from 'lucide-react';
import { LanguageSession } from '../data/mockSessions';

interface SessionCardProps {
  session: LanguageSession;
  onClick: () => void;
}

export function SessionCard({ session, onClick }: SessionCardProps) {
  // Get background color based on language
  const getBgColor = () => {
    switch (session.language) {
      case 'Spanish': return 'bg-blue-50/5';
      case 'Japanese': return 'bg-pink-50/5';
      case 'French': return 'bg-purple-50/5';
      case 'Dutch': return 'bg-orange-50/5';
      case 'German': return 'bg-yellow-50/5';
      case 'English': return 'bg-green-50/5';
      default: return 'bg-[#1A1A1A]';
    }
  };

  const remainingAttendees = session.totalAttendees - session.attendees.length;

  return (
    <button
      onClick={onClick}
      className={`w-full ${getBgColor()} rounded-2xl p-4 border border-[#2A2A2A] hover:border-[#1DB954]/30 transition-all active:scale-[0.98]`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-white text-left">
            {session.title}
          </h3>
          <p className="text-xs text-[#9CA3AF] mt-1">{session.date}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-white">
            {session.joinedPercentage}%
          </div>
          <div className="text-xs text-[#9CA3AF]">Joined</div>
        </div>
      </div>

      {/* Attendees */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {session.attendees.slice(0, 3).map((avatar, index) => (
              <img
                key={index}
                src={avatar}
                alt="Attendee"
                className="w-8 h-8 rounded-full border-2 border-[#0F0F0F] object-cover"
              />
            ))}
            {remainingAttendees > 0 && (
              <div className="w-8 h-8 rounded-full border-2 border-[#0F0F0F] bg-[#1DB954] flex items-center justify-center">
                <span className="text-xs font-semibold text-white">
                  +{remainingAttendees}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Arrow Button */}
        <div className="w-10 h-10 bg-[#0F0F0F] rounded-full flex items-center justify-center">
          <ArrowUpRight className="w-5 h-5 text-white" />
        </div>
      </div>
    </button>
  );
}
