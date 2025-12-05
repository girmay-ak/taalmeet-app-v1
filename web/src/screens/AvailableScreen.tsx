import { useState } from 'react';
import { Clock, Plus, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AvailabilityBottomSheet } from '../components/AvailabilityBottomSheet';
import { TimeSlotModal } from '../components/TimeSlotModal';
import { StatusIndicator } from '../components/StatusIndicator';

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  repeat: boolean;
}

interface Schedule {
  [day: string]: TimeSlot[];
}

export function AvailableScreen() {
  const [currentStatus, setCurrentStatus] = useState<'available' | 'soon' | 'busy' | 'offline'>('available');
  const [duration, setDuration] = useState(120); // minutes
  const [timeLeft, setTimeLeft] = useState(135); // 2h 15m
  const [preferences, setPreferences] = useState<string[]>(['in-person', 'video']);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  
  const [schedule, setSchedule] = useState<Schedule>({
    Monday: [{ id: '1', start: '18:00', end: '20:00', repeat: true }],
    Tuesday: [],
    Wednesday: [
      { id: '2', start: '19:00', end: '21:00', repeat: true },
      { id: '3', start: '21:00', end: '22:00', repeat: true }
    ],
    Thursday: [],
    Friday: [{ id: '4', start: '17:00', end: '19:00', repeat: true }],
    Saturday: [
      { id: '5', start: '10:00', end: '12:00', repeat: true },
      { id: '6', start: '14:00', end: '18:00', repeat: true }
    ],
    Sunday: [{ id: '7', start: '11:00', end: '13:00', repeat: true }]
  });

  const [meetingTypes, setMeetingTypes] = useState({
    'in-person': true,
    'video': true,
    'voice': true,
    'chat': true
  });

  const [notifications, setNotifications] = useState({
    favorites: true,
    nearby: true,
    messages: false,
    reminders: true
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleStatusChange = (
    status: 'available' | 'soon' | 'busy' | 'offline',
    newDuration: number,
    newPreferences: string[]
  ) => {
    setCurrentStatus(status);
    setDuration(newDuration);
    setTimeLeft(newDuration);
    setPreferences(newPreferences);
  };

  const handleAddTimeSlot = (start: string, end: string, repeat: boolean) => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      start,
      end,
      repeat
    };
    setSchedule({
      ...schedule,
      [selectedDay]: [...schedule[selectedDay], newSlot]
    });
  };

  const handleRemoveTimeSlot = (day: string, slotId: string) => {
    setSchedule({
      ...schedule,
      [day]: schedule[day].filter(slot => slot.id !== slotId)
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatTimeLeft = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const toggleMeetingType = (type: string) => {
    setMeetingTypes({ ...meetingTypes, [type]: !meetingTypes[type] });
  };

  const toggleNotification = (type: string) => {
    setNotifications({ ...notifications, [type]: !notifications[type] });
  };

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F]">
      {/* Header */}
      <div className="bg-[#1A1A1A] border-b border-[#2A2A2A] safe-top px-4 py-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-white">Availability</h1>
          <button
            onClick={() => {}}
            className="text-sm text-[#1DB954] font-medium hover:text-[#1ED760] transition-colors"
          >
            Save
          </button>
        </div>
        <p className="text-sm text-[#9CA3AF]">
          Let others know when you're free to meet
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20 px-4 py-6">
        {/* Quick Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] p-4 mb-6"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                currentStatus === 'available' ? 'bg-[#10B981]/20' :
                currentStatus === 'soon' ? 'bg-[#F59E0B]/20' :
                currentStatus === 'busy' ? 'bg-[#EF4444]/20' :
                'bg-[#6B7280]/20'
              }`}>
                <Clock className={`w-6 h-6 ${
                  currentStatus === 'available' ? 'text-[#10B981]' :
                  currentStatus === 'soon' ? 'text-[#F59E0B]' :
                  currentStatus === 'busy' ? 'text-[#EF4444]' :
                  'text-[#6B7280]'
                }`} />
              </div>
              <div>
                <StatusIndicator status={currentStatus} showLabel size="medium" />
                {currentStatus === 'available' && (
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    Auto-off in: {formatTimeLeft(timeLeft)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {/* ON/OFF Switch */}
              <button
                onClick={() => {
                  if (currentStatus === 'offline') {
                    setShowBottomSheet(true); // Open to select status
                  } else {
                    setCurrentStatus('offline'); // Turn off
                  }
                }}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  currentStatus !== 'offline' ? 'bg-gradient-primary' : 'bg-[#2A2A2A]'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  currentStatus !== 'offline' ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
              {currentStatus !== 'offline' && (
                <button
                  onClick={() => setShowBottomSheet(true)}
                  className="text-xs text-[#1DB954] font-medium hover:text-[#1ED760] transition-colors"
                >
                  Change
                </button>
              )}
            </div>
          </div>

          {currentStatus === 'available' && (
            <div className="flex gap-2 pt-3 border-t border-[#2A2A2A]">
              <button className="flex-1 py-2 bg-gradient-primary text-white text-sm font-semibold rounded-lg active:scale-95 transition-transform">
                Extend 1h
              </button>
              <button className="flex-1 py-2 bg-[#0F0F0F] border border-[#2A2A2A] text-white text-sm font-semibold rounded-lg active:scale-95 transition-transform">
                Stop
              </button>
            </div>
          )}
        </motion.div>

        {/* Weekly Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-white">📅 Weekly Schedule</h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                When are you usually free?
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {days.map((day) => (
              <div key={day} className="bg-[#0F0F0F] rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-sm">{day}</span>
                  <button
                    onClick={() => {
                      setSelectedDay(day);
                      setShowScheduleModal(true);
                    }}
                    className="p-1.5 hover:bg-[#2A2A2A] rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#1DB954]" />
                  </button>
                </div>

                {schedule[day].length === 0 ? (
                  <p className="text-xs text-[#9CA3AF]">No times set</p>
                ) : (
                  <div className="space-y-2">
                    {schedule[day].map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between bg-[#1A1A1A] rounded-lg p-2"
                      >
                        <span className="text-sm text-white">
                          {formatTime(slot.start)} - {formatTime(slot.end)}
                        </span>
                        <button
                          onClick={() => handleRemoveTimeSlot(day, slot.id)}
                          className="p-1 hover:bg-[#EF4444]/20 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] p-4 mb-6"
        >
          <h2 className="font-semibold text-white mb-3">Meeting Preferences</h2>
          
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 bg-[#0F0F0F] rounded-xl cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-lg">☕</span>
                <span className="text-white">In person</span>
              </div>
              <input
                type="checkbox"
                checked={meetingTypes['in-person']}
                onChange={() => toggleMeetingType('in-person')}
                className="w-5 h-5 accent-[#1DB954]"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-[#0F0F0F] rounded-xl cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-lg">📹</span>
                <span className="text-white">Video call</span>
              </div>
              <input
                type="checkbox"
                checked={meetingTypes['video']}
                onChange={() => toggleMeetingType('video')}
                className="w-5 h-5 accent-[#1DB954]"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-[#0F0F0F] rounded-xl cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-lg">📞</span>
                <span className="text-white">Voice call</span>
              </div>
              <input
                type="checkbox"
                checked={meetingTypes['voice']}
                onChange={() => toggleMeetingType('voice')}
                className="w-5 h-5 accent-[#1DB954]"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-[#0F0F0F] rounded-xl cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-lg">💬</span>
                <span className="text-white">Text chat</span>
              </div>
              <input
                type="checkbox"
                checked={meetingTypes['chat']}
                onChange={() => toggleMeetingType('chat')}
                className="w-5 h-5 accent-[#1DB954]"
              />
            </label>
          </div>

          {/* Time Zone */}
          <div className="mt-4 p-3 bg-[#0F0F0F] rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#9CA3AF]">Time zone:</span>
              <span className="text-sm text-white font-medium">
                🌍 Amsterdam (GMT+1)
              </span>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] p-4 mb-6"
        >
          <h2 className="font-semibold text-white mb-3">Notifications</h2>
          <p className="text-xs text-[#9CA3AF] mb-4">Notify me when:</p>
          
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 bg-[#0F0F0F] rounded-xl cursor-pointer">
              <span className="text-white text-sm">Favorites come online</span>
              <input
                type="checkbox"
                checked={notifications.favorites}
                onChange={() => toggleNotification('favorites')}
                className="w-5 h-5 accent-[#1DB954]"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-[#0F0F0F] rounded-xl cursor-pointer">
              <span className="text-white text-sm">Partners available nearby</span>
              <input
                type="checkbox"
                checked={notifications.nearby}
                onChange={() => toggleNotification('nearby')}
                className="w-5 h-5 accent-[#1DB954]"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-[#0F0F0F] rounded-xl cursor-pointer">
              <span className="text-white text-sm">New messages</span>
              <input
                type="checkbox"
                checked={notifications.messages}
                onChange={() => toggleNotification('messages')}
                className="w-5 h-5 accent-[#1DB954]"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-[#0F0F0F] rounded-xl cursor-pointer">
              <span className="text-white text-sm">Meeting reminders</span>
              <input
                type="checkbox"
                checked={notifications.reminders}
                onChange={() => toggleNotification('reminders')}
                className="w-5 h-5 accent-[#1DB954]"
              />
            </label>
          </div>
        </motion.div>

        {/* Active Status Info */}
        {currentStatus === 'available' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-2xl p-4"
          >
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-[#10B981]/20 rounded-full flex items-center justify-center flex-shrink-0">
                ✨
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  You're visible to partners!
                </h3>
                <p className="text-sm text-[#9CA3AF] leading-relaxed">
                  Language learners nearby can now see you're available and send you connection requests.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {showBottomSheet && (
          <AvailabilityBottomSheet
            isOpen={showBottomSheet}
            onClose={() => setShowBottomSheet(false)}
            currentStatus={currentStatus}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>

      {/* Time Slot Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <TimeSlotModal
            isOpen={showScheduleModal}
            onClose={() => setShowScheduleModal(false)}
            day={selectedDay}
            onAdd={handleAddTimeSlot}
          />
        )}
      </AnimatePresence>
    </div>
  );
}