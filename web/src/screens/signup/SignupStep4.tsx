import { useState } from 'react';
import { ArrowLeft, X, Camera, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';

interface SignupStep4Props {
  onNext: (data: { bio: string; interests: string[]; avatar?: string }) => void;
  onBack: () => void;
}

const INTERESTS = [
  '☕ Coffee', '🎵 Music', '✈️ Travel', '🎨 Art',
  '📚 Books', '🍕 Food', '⚽ Sports', '🎮 Gaming',
  '🎬 Movies', '📸 Photography', '🏃 Fitness', '🧘 Yoga',
  '🍷 Wine', '🎭 Theater', '🌿 Nature', '💻 Technology'
];

export function SignupStep4({ onNext, onBack }: SignupStep4Props) {
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  const MAX_BIO_LENGTH = 150;
  const canProceed = bio.trim() !== '' && selectedInterests.length > 0 && agreedToTerms;

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      if (selectedInterests.length < 8) {
        setSelectedInterests([...selectedInterests, interest]);
      }
    }
  };

  const handleAvatarClick = () => {
    // In real app, would open file picker
    // For demo, use a placeholder
    setAvatar('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop');
  };

  const handleSubmit = () => {
    if (canProceed) {
      onNext({ bio, interests: selectedInterests, avatar: avatar || undefined });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 safe-top">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-[#1A1A1A] rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <span className="text-sm text-[#9CA3AF]">4/4</span>
        <button
          onClick={onBack}
          className="p-2 -mr-2 hover:bg-[#1A1A1A] rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Complete Profile ✨
          </h1>
          <p className="text-[#9CA3AF] mb-6">
            Almost there!
          </p>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-6">
            <button
              onClick={handleAvatarClick}
              className="relative group mb-2"
            >
              <div className="w-24 h-24 rounded-full bg-[#1A1A1A] border-2 border-[#2A2A2A] flex items-center justify-center overflow-hidden group-hover:border-[#1DB954] transition-colors">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-10 h-10 text-[#9CA3AF]" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center border-2 border-[#0F0F0F]">
                <Edit3 className="w-4 h-4 text-white" />
              </div>
            </button>
            <button
              onClick={handleAvatarClick}
              className="text-sm text-[#1DB954] hover:text-[#1ED760] transition-colors"
            >
              Add Photo
            </button>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              About Me
            </label>
            <textarea
              value={bio}
              onChange={(e) => {
                if (e.target.value.length <= MAX_BIO_LENGTH) {
                  setBio(e.target.value);
                }
              }}
              placeholder="Hey! I'm learning languages and love meeting new people..."
              rows={4}
              className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#1DB954] transition-colors resize-none"
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${
                bio.length === MAX_BIO_LENGTH ? 'text-[#F59E0B]' : 'text-[#9CA3AF]'
              }`}>
                {bio.length} / {MAX_BIO_LENGTH} characters
              </span>
            </div>
          </div>

          {/* Interests */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">
                Interests 🎯
              </h3>
              <span className="text-xs text-[#9CA3AF]">
                {selectedInterests.length}/8 selected
              </span>
            </div>
            <p className="text-sm text-[#9CA3AF] mb-3">
              Tap to select:
            </p>
            
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    disabled={!isSelected && selectedInterests.length >= 8}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-primary text-white'
                        : 'bg-[#1A1A1A] border border-[#2A2A2A] text-[#9CA3AF] hover:border-[#1DB954]'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4 mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 accent-[#1DB954]"
              />
              <span className="text-sm text-[#9CA3AF]">
                I agree to the{' '}
                <button className="text-[#1DB954] hover:underline">
                  Terms of Service
                </button>
                {' '}and{' '}
                <button className="text-[#1DB954] hover:underline">
                  Privacy Policy
                </button>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!canProceed}
            className="w-full py-4 bg-gradient-primary text-white rounded-xl font-semibold active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Create Account 🎉
          </button>
        </motion.div>
      </div>
    </div>
  );
}
