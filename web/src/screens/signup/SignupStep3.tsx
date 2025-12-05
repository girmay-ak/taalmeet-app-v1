import { useState } from 'react';
import { ArrowLeft, X, MapPin, Globe, Locate } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedBackground } from '../../components/AnimatedBackground';

interface SignupStep3Props {
  onNext: (data: { city: string; country: string }) => void;
  onBack: () => void;
}

const COUNTRIES = [
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' }
];

export function SignupStep3({ onNext, onBack }: SignupStep3Props) {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('NL');

  const canProceed = city.trim() !== '' && country;

  const handleEnableGPS = () => {
    // In real app, would use geolocation API
    setCity('Den Haag');
    setCountry('NL');
  };

  const handleSubmit = () => {
    if (canProceed) {
      const selectedCountry = COUNTRIES.find(c => c.code === country);
      onNext({
        city,
        country: selectedCountry?.name || 'Netherlands'
      });
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0A0A0A] overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Content */}
      <div className="relative z-10 min-h-screen w-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 safe-top">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-[#1A1A1A] rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <span className="text-sm text-[#9CA3AF]">3/4</span>
          <button
            onClick={onBack}
            className="p-2 -mr-2 hover:bg-[#1A1A1A] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 pb-6">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold text-white mb-2">
                Your Location 📍
              </h1>
              <p className="text-[#9CA3AF] mb-6">
                Find partners nearby
              </p>

              <div className="space-y-4 mb-6">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Den Haag"
                      className="w-full pl-12 pr-4 py-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#1DB954] transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white focus:outline-none focus:border-[#1DB954] transition-colors appearance-none"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Map Preview */}
              <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4 mb-6">
                <div className="relative h-32 bg-[#0F0F0F] rounded-lg overflow-hidden">
                  {/* Map placeholder with grid */}
                  <div className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `
                        linear-gradient(#2A2A2A 1px, transparent 1px),
                        linear-gradient(90deg, #2A2A2A 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px'
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <MapPin className="w-8 h-8 text-[#1DB954]" />
                      <div className="absolute -inset-4 border-2 border-[#1DB954] rounded-full opacity-30 animate-ping" />
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-[#9CA3AF] mt-3">
                  Approximate location: {city || 'Select city'}, {COUNTRIES.find(c => c.code === country)?.flag}
                </p>
              </div>

              {/* Enable GPS */}
              <button
                onClick={handleEnableGPS}
                className="w-full py-4 border border-[#2A2A2A] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#1A1A1A] active:scale-[0.98] transition-all mb-2"
              >
                <Locate className="w-5 h-5 text-[#1DB954]" />
                Enable GPS
              </button>
              <p className="text-center text-xs text-[#9CA3AF] mb-6">
                Auto-detect location
              </p>

              {/* Privacy Note */}
              <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4 mb-6">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-[#0F0F0F] rounded-full flex items-center justify-center flex-shrink-0">
                    🛡️
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">
                      Privacy Protected
                    </h4>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">
                      Your exact location is never shared. We only show approximate distance to partners.
                    </p>
                  </div>
                </div>
              </div>

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
      </div>
    </div>
  );
}