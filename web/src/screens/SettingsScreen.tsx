import { ArrowLeft, Bell, Lock, Globe, Volume2, Moon, Eye, Shield } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface SettingsScreenProps {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { colorTheme, setColorTheme, mode, setMode } = useTheme();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [matchNotifications, setMatchNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-[#2A2A2A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#1DB954] peer-checked:to-[#1ED760]"></div>
    </label>
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="border-b safe-top" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-4 px-4 py-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            style={{ backgroundColor: 'var(--color-border)' }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--color-text)' }} />
          </button>
          <h1 className="text-2xl" style={{ color: 'var(--color-text)' }}>Settings</h1>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase mb-3">Notifications</h2>
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1DB954]/20 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#1DB954]" />
              </div>
              <div>
                <p style={{ color: 'var(--color-text)' }} className="font-medium">Push Notifications</p>
                <p className="text-xs text-[#9CA3AF]">Receive app notifications</p>
              </div>
            </div>
            <Toggle checked={pushNotifications} onChange={() => setPushNotifications(!pushNotifications)} />
          </div>
          <div className="h-px" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#5FB3B3]/20 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#5FB3B3]" />
              </div>
              <div>
                <p style={{ color: 'var(--color-text)' }} className="font-medium">New Messages</p>
                <p className="text-xs text-[#9CA3AF]">Get notified of new messages</p>
              </div>
            </div>
            <Toggle checked={messageNotifications} onChange={() => setMessageNotifications(!messageNotifications)} />
          </div>
          <div className="h-px" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E91E8C]/20 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#E91E8C]" />
              </div>
              <div>
                <p style={{ color: 'var(--color-text)' }} className="font-medium">New Matches</p>
                <p className="text-xs text-[#9CA3AF]">Get notified of new matches</p>
              </div>
            </div>
            <Toggle checked={matchNotifications} onChange={() => setMatchNotifications(!matchNotifications)} />
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase mb-3">Appearance</h2>
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          {/* Color Theme Selector */}
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Color Theme</p>
                <p className="text-xs text-[#9CA3AF]">Choose your app colors</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setColorTheme('green')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all active:scale-95 ${
                  colorTheme === 'green' 
                    ? 'border-[#1DB954] bg-[#1DB954]/10' 
                    : 'border-[#2A2A2A] bg-[#0F0F0F]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ED760] flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-white font-medium">Green</p>
                    <p className="text-xs text-[#9CA3AF]">Teal & Mint</p>
                  </div>
                  {colorTheme === 'green' && (
                    <svg className="w-5 h-5 text-[#1DB954] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
              <button
                onClick={() => setColorTheme('purple')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all active:scale-95 ${
                  colorTheme === 'purple' 
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' 
                    : 'border-[#2A2A2A] bg-[#0F0F0F]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-white font-medium">Purple</p>
                    <p className="text-xs text-[#9CA3AF]">Violet & Pink</p>
                  </div>
                  {colorTheme === 'purple' && (
                    <svg className="w-5 h-5 text-[#8B5CF6] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          </div>
          <div className="h-px" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F59E0B]/20 rounded-full flex items-center justify-center">
                <Moon className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-white font-medium">Dark Mode</p>
                <p className="text-xs text-[#9CA3AF]">Use dark theme</p>
              </div>
            </div>
            <Toggle checked={mode === 'dark'} onChange={() => setMode(mode === 'dark' ? 'light' : 'dark')} />
          </div>
          <div className="h-px" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <p className="text-white font-medium">Sound Effects</p>
                <p className="text-xs text-[#9CA3AF]">Play sounds for actions</p>
              </div>
            </div>
            <Toggle checked={soundEffects} onChange={() => setSoundEffects(!soundEffects)} />
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase mb-3">Account</h2>
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#222222] transition-colors active:scale-[0.99]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#5FB3B3]/20 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#5FB3B3]" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Change Password</p>
                <p className="text-xs text-[#9CA3AF]">Update your password</p>
              </div>
            </div>
            <span className="text-[#9CA3AF]">›</span>
          </button>
          <div className="h-px" style={{ backgroundColor: 'var(--color-border)' }} />
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#222222] transition-colors active:scale-[0.99]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1DB954]/20 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#1DB954]" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Language</p>
                <p className="text-xs text-[#9CA3AF]">English</p>
              </div>
            </div>
            <span className="text-[#9CA3AF]">›</span>
          </button>
          <div className="h-px" style={{ backgroundColor: 'var(--color-border)' }} />
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#222222] transition-colors active:scale-[0.99]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E91E8C]/20 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-[#E91E8C]" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Blocked Users</p>
                <p className="text-xs text-[#9CA3AF]">Manage blocked users</p>
              </div>
            </div>
            <span className="text-[#9CA3AF]">›</span>
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase mb-3">About</h2>
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#222222] transition-colors active:scale-[0.99]">
            <span className="text-white">Terms of Service</span>
            <span className="text-[#9CA3AF]">›</span>
          </button>
          <div className="h-px" style={{ backgroundColor: 'var(--color-border)' }} />
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#222222] transition-colors active:scale-[0.99]">
            <span className="text-white">Privacy Policy</span>
            <span className="text-[#9CA3AF]">›</span>
          </button>
          <div className="h-px" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="flex items-center justify-between p-4">
            <span className="text-white">Version</span>
            <span className="text-[#9CA3AF]">1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}