import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Language {
  name: string;
  flag: string;
  code: string;
}

const languages: Language[] = [
  { name: 'English', flag: '🇬🇧', code: 'en' },
  { name: 'Spanish', flag: '🇪🇸', code: 'es' },
  { name: 'French', flag: '🇫🇷', code: 'fr' },
  { name: 'German', flag: '🇩🇪', code: 'de' },
  { name: 'Italian', flag: '🇮🇹', code: 'it' },
  { name: 'Portuguese', flag: '🇵🇹', code: 'pt' },
  { name: 'Dutch', flag: '🇳🇱', code: 'nl' },
  { name: 'Russian', flag: '🇷🇺', code: 'ru' },
  { name: 'Chinese', flag: '🇨🇳', code: 'zh' },
  { name: 'Japanese', flag: '🇯🇵', code: 'ja' },
  { name: 'Korean', flag: '🇰🇷', code: 'ko' },
  { name: 'Arabic', flag: '🇸🇦', code: 'ar' },
  { name: 'Hindi', flag: '🇮🇳', code: 'hi' },
  { name: 'Turkish', flag: '🇹🇷', code: 'tr' },
  { name: 'Polish', flag: '🇵🇱', code: 'pl' },
];

const levels = [
  'A1 - Beginner',
  'A2 - Elementary',
  'B1 - Intermediate',
  'B2 - Upper Intermediate',
  'C1 - Advanced',
  'C2 - Proficient',
  'Native'
];

interface LanguageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'teaching' | 'learning';
  currentLanguage: { language: string; level: string; flag: string };
  onSave: (data: { language: string; level: string; flag: string }) => void;
}

export function LanguageEditorModal({ 
  isOpen, 
  onClose, 
  type, 
  currentLanguage, 
  onSave 
}: LanguageEditorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    languages.find(l => l.name === currentLanguage.language) || null
  );
  const [selectedLevel, setSelectedLevel] = useState(currentLanguage.level);

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    if (selectedLanguage) {
      onSave({
        language: selectedLanguage.name,
        level: selectedLevel,
        flag: selectedLanguage.flag
      });
      onClose();
    }
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
              <h2 className="text-xl font-bold text-white">
                {type === 'teaching' ? 'Teaching Language' : 'Learning Language'}
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[70vh] overflow-y-auto">
              {/* Search */}
              <div className="p-4 border-b border-[#2A2A2A]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#5FB3B3]"
                    placeholder="Search languages..."
                  />
                </div>
              </div>

              {/* Language Selection */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-white mb-3">Select Language</h3>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {filteredLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`p-3 rounded-xl border transition-all active:scale-95 ${
                        selectedLanguage?.code === lang.code
                          ? 'bg-[#1DB954]/20 border-[#1DB954]'
                          : 'bg-[#0F0F0F] border-[#2A2A2A]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="text-white font-medium text-sm">{lang.name}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Level Selection */}
                <h3 className="text-sm font-medium text-white mb-3">Select Level</h3>
                <div className="space-y-2">
                  {levels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`w-full p-3 rounded-xl border transition-all active:scale-95 text-left ${
                        selectedLevel === level
                          ? 'bg-[#5FB3B3]/20 border-[#5FB3B3]'
                          : 'bg-[#0F0F0F] border-[#2A2A2A]'
                      }`}
                    >
                      <span className="text-white font-medium">{level}</span>
                    </button>
                  ))}
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
                disabled={!selectedLanguage}
                className="flex-1 py-3 bg-gradient-primary text-white rounded-xl font-medium active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}