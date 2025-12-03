import { X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

const availableInterests = [
  'Coffee', 'Travel', 'Music', 'Hiking', 'Photography', 'Art', 'Cooking',
  'Literature', 'Yoga', 'Wine', 'Movies', 'Gaming', 'Sports', 'Dancing',
  'Reading', 'Technology', 'Fashion', 'Fitness', 'Nature', 'Meditation',
  'Food', 'Culture', 'History', 'Science', 'Business', 'Volunteering'
];

interface InterestsEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInterests: string[];
  onSave: (interests: string[]) => void;
}

export function InterestsEditorModal({ 
  isOpen, 
  onClose, 
  currentInterests, 
  onSave 
}: InterestsEditorModalProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(currentInterests);
  const [customInterest, setCustomInterest] = useState('');

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else if (selectedInterests.length < 10) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim()) && selectedInterests.length < 10) {
      setSelectedInterests([...selectedInterests, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const handleSave = () => {
    onSave(selectedInterests);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1A1A1A] w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2A2A2A]">
              <div>
                <h2 className="text-xl font-bold text-white">Edit Interests</h2>
                <p className="text-sm text-[#9CA3AF] mt-1">
                  Select up to 10 interests ({selectedInterests.length}/10)
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {/* Add Custom Interest */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">
                  Add Custom Interest
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
                    className="flex-1 px-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#5FB3B3]"
                    placeholder="Type your interest..."
                    maxLength={20}
                  />
                  <button
                    onClick={addCustomInterest}
                    disabled={!customInterest.trim() || selectedInterests.length >= 10}
                    className="px-4 py-3 bg-gradient-primary text-white rounded-xl active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Available Interests */}
              <div>
                <h3 className="text-sm font-medium text-white mb-3">Popular Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);
                    const canSelect = selectedInterests.length < 10 || isSelected;
                    
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        disabled={!canSelect}
                        className={`px-4 py-2 rounded-full transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-primary text-white'
                            : canSelect
                            ? 'bg-[#0F0F0F] border border-[#2A2A2A] text-[#9CA3AF]'
                            : 'bg-[#0F0F0F] border border-[#2A2A2A] text-[#4A4A4A] cursor-not-allowed'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#2A2A2A] flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-[#2A2A2A] text-white rounded-xl font-medium active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-gradient-primary text-white rounded-xl font-medium active:scale-95 transition-transform"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
