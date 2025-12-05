import { X, Camera, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: {
    name: string;
    age: number;
    location: string;
    bio: string;
    avatar: string;
  };
  onSave: (data: any) => void;
}

export function EditProfileModal({ isOpen, onClose, currentData, onSave }: EditProfileModalProps) {
  const [name, setName] = useState(currentData.name);
  const [age, setAge] = useState(currentData.age.toString());
  const [location, setLocation] = useState(currentData.location);
  const [bio, setBio] = useState(currentData.bio);

  const handleSave = () => {
    onSave({
      name,
      age: parseInt(age),
      location,
      bio,
      avatar: currentData.avatar
    });
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
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-2">
                  <img
                    src={currentData.avatar}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#2A2A2A]"
                  />
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center border-2 border-[#1A1A1A] active:scale-95 transition-transform">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                <p className="text-sm text-[#9CA3AF]">Change Photo</p>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#5FB3B3]"
                  placeholder="Enter your name"
                />
              </div>

              {/* Age */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#5FB3B3]"
                  placeholder="Enter your age"
                />
              </div>

              {/* Location */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#5FB3B3]"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  maxLength={300}
                  className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#5FB3B3] resize-none"
                  placeholder="Tell others about yourself..."
                />
                <div className="text-xs text-[#9CA3AF] mt-1 text-right">
                  {bio.length}/300
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