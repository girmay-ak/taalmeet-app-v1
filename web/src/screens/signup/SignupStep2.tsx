import { useState } from 'react';
import { ArrowLeft, X, Search, Plus, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface SignupStep2Props {
  onNext: (data: { learning: Language[]; teaching: Language & { level: string } }) => void;
  onBack: () => void;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' }
];

const LEVELS = [
  { id: 'native', label: 'Native', color: '#F59E0B' },
  { id: 'advanced', label: 'Advanced (C1-C2)', color: '#3B82F6' },
  { id: 'intermediate', label: 'Intermediate (B1-B2)', color: '#10B981' },
  { id: 'beginner', label: 'Beginner (A1-A2)', color: '#6B7280' }
];

export function SignupStep2({ onNext, onBack }: SignupStep2Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [learningLanguages, setLearningLanguages] = useState<Language[]>([]);
  const [teachingLanguage, setTeachingLanguage] = useState<Language | null>(null);
  const [teachingLevel, setTeachingLevel] = useState('native');

  const filteredLanguages = LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleLearning = (lang: Language) => {
    if (learningLanguages.find(l => l.code === lang.code)) {
      setLearningLanguages(learningLanguages.filter(l => l.code !== lang.code));
    } else {
      setLearningLanguages([...learningLanguages, lang]);
    }
  };

  const canProceed = learningLanguages.length > 0 && teachingLanguage && teachingLevel;

  const handleSubmit = () => {
    if (canProceed && teachingLanguage) {
      onNext({
        learning: learningLanguages,
        teaching: { ...teachingLanguage, level: teachingLevel }
      });
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
        <span className="text-sm text-[#9CA3AF]">2/4</span>
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
            Your Languages 🌍
          </h1>
          <p className="text-[#9CA3AF] mb-6">
            What brings you here?
          </p>

          {/* I want to learn */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              I want to learn
            </h3>
            
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search languages..."
                className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#1DB954] transition-colors"
              />
            </div>

            {/* Language List */}
            <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] max-h-64 overflow-y-auto">
              {filteredLanguages.map((lang) => {
                const isSelected = learningLanguages.find(l => l.code === lang.code);
                return (
                  <button
                    key={lang.code}
                    onClick={() => toggleLearning(lang)}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#222222] transition-colors border-b border-[#2A2A2A] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="text-white">{lang.name}</span>
                    </div>
                    {isSelected ? (
                      <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-[#2A2A2A] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* I can teach */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              I can teach
            </h3>
            
            <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4 space-y-4">
              {/* Select Language */}
              <div>
                <label className="block text-sm text-[#9CA3AF] mb-2">
                  Language
                </label>
                <select
                  value={teachingLanguage?.code || ''}
                  onChange={(e) => {
                    const lang = LANGUAGES.find(l => l.code === e.target.value);
                    setTeachingLanguage(lang || null);
                  }}
                  className="w-full px-4 py-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-[#1DB954] transition-colors"
                >
                  <option value="">Select language...</option>
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Level */}
              {teachingLanguage && (
                <div>
                  <label className="block text-sm text-[#9CA3AF] mb-2">
                    Level
                  </label>
                  <div className="space-y-2">
                    {LEVELS.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setTeachingLevel(level.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                          teachingLevel === level.id
                            ? 'bg-[#0F0F0F] border-2 border-[#1DB954]'
                            : 'bg-[#0F0F0F] border border-[#2A2A2A]'
                        }`}
                      >
                        <span className="text-white">{level.label}</span>
                        {teachingLevel === level.id && (
                          <Check className="w-5 h-5 text-[#1DB954]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Summary */}
          {(learningLanguages.length > 0 || teachingLanguage) && (
            <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4 mb-6">
              <p className="text-sm text-[#9CA3AF] mb-2">Selected:</p>
              <div className="flex flex-wrap gap-2">
                {learningLanguages.map((lang) => (
                  <span
                    key={lang.code}
                    className="px-3 py-1 bg-[#0F0F0F] border border-[#2A2A2A] rounded-full text-sm text-white flex items-center gap-2"
                  >
                    <span>{lang.flag}</span>
                    <span>Learning {lang.name}</span>
                  </span>
                ))}
                {teachingLanguage && (
                  <span className="px-3 py-1 bg-gradient-primary text-white rounded-full text-sm flex items-center gap-2">
                    <span>{teachingLanguage.flag}</span>
                    <span>Teaching {teachingLanguage.name}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Next Button */}
          <button
            onClick={handleSubmit}
            disabled={!canProceed}
            className="w-full py-4 bg-gradient-primary text-white rounded-xl font-semibold active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
