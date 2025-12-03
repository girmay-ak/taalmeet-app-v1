import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface TimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: string;
  onAdd: (start: string, end: string, repeat: boolean) => void;
}

export function TimeSlotModal({ isOpen, onClose, day, onAdd }: TimeSlotModalProps) {
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('20:00');
  const [repeatWeekly, setRepeatWeekly] = useState(true);

  const handleAdd = () => {
    onAdd(startTime, endTime, repeatWeekly);
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
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#1A1A1A] rounded-2xl p-6 mx-4 w-full max-w-sm border border-[#2A2A2A]"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Add Time Slot</h3>
              <p className="text-sm text-[#9CA3AF]">{day}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#2A2A2A] rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[#9CA3AF]" />
            </button>
          </div>

          {/* From Time */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">From:</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl text-white focus:outline-none focus:border-[#1DB954] transition-colors"
            />
          </div>

          {/* To Time */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">To:</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl text-white focus:outline-none focus:border-[#1DB954] transition-colors"
            />
          </div>

          {/* Repeat Weekly Toggle */}
          <div className="flex items-center justify-between mb-6 p-3 bg-[#0F0F0F] rounded-xl">
            <span className="text-white font-medium">Repeat weekly</span>
            <button
              onClick={() => setRepeatWeekly(!repeatWeekly)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                repeatWeekly ? 'bg-gradient-primary' : 'bg-[#2A2A2A]'
              }`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                repeatWeekly ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleAdd}
            className="w-full py-3 bg-gradient-primary text-white font-semibold rounded-xl mb-2 active:scale-95 transition-transform"
          >
            Add Slot
          </button>

          <button
            onClick={onClose}
            className="w-full text-sm text-[#9CA3AF] font-medium py-2"
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </>
  );
}
