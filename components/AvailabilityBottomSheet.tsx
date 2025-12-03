import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface AvailabilityBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: 'available' | 'soon' | 'busy' | 'offline';
  onStatusChange: (status: 'available' | 'soon' | 'busy' | 'offline', duration: number, preferences: string[]) => void;
}

export function AvailabilityBottomSheet({ 
  isOpen, 
  onClose, 
  currentStatus,
  onStatusChange 
}: AvailabilityBottomSheetProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [selectedDuration, setSelectedDuration] = useState('1h');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(['in-person', 'video']);

  const statuses = [
    { 
      id: 'available' as const, 
      emoji: '🟢', 
      title: 'Available', 
      subtitle: 'Right now!',
      color: 'border-[#10B981] bg-[#10B981]/10'
    },
    { 
      id: 'soon' as const, 
      emoji: '🟡', 
      title: 'Available', 
      subtitle: 'Soon (1-2h)',
      color: 'border-[#F59E0B] bg-[#F59E0B]/10'
    },
    { 
      id: 'busy' as const, 
      emoji: '🔴', 
      title: 'Busy', 
      subtitle: 'Not now',
      color: 'border-[#EF4444] bg-[#EF4444]/10'
    },
    { 
      id: 'offline' as const, 
      emoji: '⚫', 
      title: 'Offline', 
      subtitle: 'Invisible',
      color: 'border-[#6B7280] bg-[#6B7280]/10'
    }
  ];

  const durations = [
    { id: '30m', label: '30m', minutes: 30 },
    { id: '1h', label: '1h', minutes: 60 },
    { id: '2h', label: '2h', minutes: 120 },
    { id: 'all-day', label: 'All day', minutes: 1440 }
  ];

  const preferences = [
    { id: 'in-person', label: '☕ In person' },
    { id: 'video', label: '📹 Video' },
    { id: 'call', label: '📞 Call' },
    { id: 'chat', label: '💬 Chat only' }
  ];

  const togglePreference = (prefId: string) => {
    if (selectedPreferences.includes(prefId)) {
      setSelectedPreferences(selectedPreferences.filter(p => p !== prefId));
    } else {
      setSelectedPreferences([...selectedPreferences, prefId]);
    }
  };

  const handleSave = () => {
    const duration = durations.find(d => d.id === selectedDuration)?.minutes || 60;
    onStatusChange(selectedStatus, duration, selectedPreferences);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto"
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-[#2A2A2A] rounded-full" />
        </div>

        <div className="px-4 pb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Set Availability</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#2A2A2A] rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[#9CA3AF]" />
            </button>
          </div>

          <p className="text-sm text-[#9CA3AF] mb-4">Right now I'm...</p>

          {/* Status Selection */}
          <div className="space-y-2 mb-6">
            {statuses.map((status) => (
              <button
                key={status.id}
                onClick={() => setSelectedStatus(status.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  selectedStatus === status.id
                    ? status.color
                    : 'border-[#2A2A2A] bg-[#0F0F0F]'
                }`}
              >
                <span className="text-2xl">{status.emoji}</span>
                <div className="text-left">
                  <div className="text-white font-semibold">{status.title}</div>
                  <div className="text-sm text-[#9CA3AF]">{status.subtitle}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-[#2A2A2A] my-4" />

          {/* Quick Time Limit */}
          {(selectedStatus === 'available' || selectedStatus === 'soon') && (
            <>
              <p className="text-sm font-medium text-white mb-3">Quick time limit:</p>
              <div className="flex gap-2 mb-6">
                {durations.map((duration) => (
                  <button
                    key={duration.id}
                    onClick={() => setSelectedDuration(duration.id)}
                    className={`flex-1 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedDuration === duration.id
                        ? 'bg-gradient-primary text-white'
                        : 'bg-[#0F0F0F] text-[#9CA3AF] border border-[#2A2A2A]'
                    }`}
                  >
                    {duration.label}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-[#2A2A2A] my-4" />

              {/* Preferred Meeting */}
              <p className="text-sm font-medium text-white mb-3">Preferred meeting:</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {preferences.map((pref) => (
                  <button
                    key={pref.id}
                    onClick={() => togglePreference(pref.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedPreferences.includes(pref.id)
                        ? 'bg-gradient-primary text-white'
                        : 'bg-[#0F0F0F] text-[#9CA3AF] border border-[#2A2A2A]'
                    }`}
                  >
                    {pref.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <button
            onClick={handleSave}
            className="w-full py-4 bg-gradient-primary text-white font-semibold rounded-xl mb-3 active:scale-95 transition-transform"
          >
            Set Availability
          </button>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                // Navigate to schedule screen
                onClose();
              }}
              className="text-sm text-[#1DB954] font-medium"
            >
              Set Schedule
            </button>
            <button
              onClick={onClose}
              className="text-sm text-[#9CA3AF] font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
