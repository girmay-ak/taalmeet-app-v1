import { ArrowLeft, Globe, Users, MapPin } from 'lucide-react';
import { useState } from 'react';

interface LanguagePreferencesScreenProps {
  onBack: () => void;
}

export function LanguagePreferencesScreen({ onBack }: LanguagePreferencesScreenProps) {
  const [showOnlyMyLanguages, setShowOnlyMyLanguages] = useState(false);
  const [showNearby, setShowNearby] = useState(true);
  const [maxDistance, setMaxDistance] = useState(10);

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-[#2A2A2A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#1DB954] peer-checked:to-[#1ED760]"></div>
    </label>
  );

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F] overflow-y-auto pb-20">
      {/* Header */}
      <div className="bg-[#1A1A1A] border-b border-[#2A2A2A] safe-top">
        <div className="flex items-center gap-4 px-4 py-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">Language Preferences</h1>
        </div>
      </div>

      {/* Discovery Settings */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase mb-3">Discovery</h2>
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1DB954]/20 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#1DB954]" />
              </div>
              <div>
                <p className="text-white font-medium">Only My Languages</p>
                <p className="text-xs text-[#9CA3AF]">Show partners for my languages only</p>
              </div>
            </div>
            <Toggle checked={showOnlyMyLanguages} onChange={() => setShowOnlyMyLanguages(!showOnlyMyLanguages)} />
          </div>
          <div className="h-px bg-[#2A2A2A]" />
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#5FB3B3]/20 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#5FB3B3]" />
              </div>
              <div>
                <p className="text-white font-medium">Show Nearby First</p>
                <p className="text-xs text-[#9CA3AF]">Prioritize nearby partners</p>
              </div>
            </div>
            <Toggle checked={showNearby} onChange={() => setShowNearby(!showNearby)} />
          </div>
        </div>
      </div>

      {/* Distance Settings */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase mb-3">Distance</h2>
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E91E8C]/20 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-[#E91E8C]" />
              </div>
              <div>
                <p className="text-white font-medium">Maximum Distance</p>
                <p className="text-xs text-[#9CA3AF]">Show partners within {maxDistance}km</p>
              </div>
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={maxDistance}
            onChange={(e) => setMaxDistance(parseInt(e.target.value))}
            className="w-full h-2 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
          />
          <div className="flex justify-between text-xs text-[#9CA3AF] mt-2">
            <span>1km</span>
            <span>{maxDistance}km</span>
            <span>50km</span>
          </div>
        </div>
      </div>

      {/* Language Level Preferences */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase mb-3">Preferred Levels</h2>
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4">
          <p className="text-sm text-[#9CA3AF] mb-3">
            Select which levels you'd like to practice with:
          </p>
          <div className="space-y-2">
            {['Beginner (A1-A2)', 'Intermediate (B1-B2)', 'Advanced (C1-C2)', 'Native'].map((level) => (
              <label key={level} className="flex items-center gap-3 p-3 bg-[#0F0F0F] rounded-lg cursor-pointer hover:bg-[#1A1A1A] transition-colors">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-[#2A2A2A] bg-[#0F0F0F] text-[#1DB954] focus:ring-2 focus:ring-[#1DB954] focus:ring-offset-0"
                />
                <span className="text-white">{level}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
