import { ArrowLeft, Shield, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface PrivacySafetyScreenProps {
  onBack: () => void;
}

export function PrivacySafetyScreen({ onBack }: PrivacySafetyScreenProps) {
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showDistance, setShowDistance] = useState(true);
  const [showLastActive, setShowLastActive] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);

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
          <h1 className="text-2xl font-bold text-white">Privacy & Safety</h1>
        </div>
      </div>

      {/* Privacy Banner */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-[#5FB3B3]/20 to-[#1DB954]/20 border border-[#5FB3B3]/30 rounded-xl p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-[#5FB3B3]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-[#5FB3B3]" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Your Safety Matters</h3>
              <p className="text-sm text-[#9CA3AF]">
                Control who sees your information and how others can interact with you.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visibility Settings */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase mb-3">Profile Visibility</h2>
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1DB954]/20 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-[#1DB954]" />
              </div>
              <div>
                <p className="text-white font-medium">Show Online Status</p>
                <p className="text-xs text-[#9CA3AF]">Let others see when you're online</p>
              </div>
            </div>
            <Toggle checked={showOnlineStatus} onChange={() => setShowOnlineStatus(!showOnlineStatus)} />
          </div>
          <div className="h-px bg-[#2A2A2A]" />
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#5FB3B3]/20 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-[#5FB3B3]" />
              </div>
              <div>
                <p className="text-white font-medium">Show Distance</p>
                <p className="text-xs text-[#9CA3AF]">Display your approximate distance</p>
              </div>
            </div>
            <Toggle checked={showDistance} onChange={() => setShowDistance(!showDistance)} />
          </div>
          <div className="h-px bg-[#2A2A2A]" />
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E91E8C]/20 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-[#E91E8C]" />
              </div>
              <div>
                <p className="text-white font-medium">Show Last Active</p>
                <p className="text-xs text-[#9CA3AF]">Display when you were last active</p>
              </div>
            </div>
            <Toggle checked={showLastActive} onChange={() => setShowLastActive(!showLastActive)} />
          </div>
        </div>
      </div>

      {/* Messaging Settings */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase mb-3">Messaging</h2>
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F59E0B]/20 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-white font-medium">Read Receipts</p>
                <p className="text-xs text-[#9CA3AF]">Show when you've read messages</p>
              </div>
            </div>
            <Toggle checked={readReceipts} onChange={() => setReadReceipts(!readReceipts)} />
          </div>
        </div>
      </div>

      {/* Block & Report */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase mb-3">Safety Actions</h2>
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#222222] transition-colors active:scale-[0.99]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#EF4444]/20 rounded-full flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Blocked Users</p>
                <p className="text-xs text-[#9CA3AF]">Manage blocked accounts</p>
              </div>
            </div>
            <span className="text-[#9CA3AF]">›</span>
          </button>
          <div className="h-px bg-[#2A2A2A]" />
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#222222] transition-colors active:scale-[0.99]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F59E0B]/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Report an Issue</p>
                <p className="text-xs text-[#9CA3AF]">Report inappropriate behavior</p>
              </div>
            </div>
            <span className="text-[#9CA3AF]">›</span>
          </button>
        </div>
      </div>

      {/* Data & Account */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase mb-3">Data & Account</h2>
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#222222] transition-colors active:scale-[0.99]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#5FB3B3]/20 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#5FB3B3]" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Download My Data</p>
                <p className="text-xs text-[#9CA3AF]">Request a copy of your data</p>
              </div>
            </div>
            <span className="text-[#9CA3AF]">›</span>
          </button>
          <div className="h-px bg-[#2A2A2A]" />
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#222222] transition-colors active:scale-[0.99]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#EF4444]/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Delete Account</p>
                <p className="text-xs text-[#9CA3AF]">Permanently delete your account</p>
              </div>
            </div>
            <span className="text-[#9CA3AF]">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
