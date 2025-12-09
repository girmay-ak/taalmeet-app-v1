import { Settings, Share2, Edit, MapPin, Star, Award, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useMemo } from 'react';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { useAuth } from '../providers/AuthProvider';
import { getLanguageFlag } from '@/utils/languageFlags';
import { EditProfileModal } from '../components/modals/EditProfileModal';
import { LanguageEditorModal } from '../components/modals/LanguageEditorModal';
import { InterestsEditorModal } from '../components/modals/InterestsEditorModal';
import { PremiumUpgradeModal } from '../components/modals/PremiumUpgradeModal';
import { LogoutConfirmationModal } from '../components/modals/LogoutConfirmationModal';

interface ProfileScreenProps {
  onNavigateToSettings?: () => void;
  onNavigateToLanguagePreferences?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToHelp?: () => void;
  onLogout?: () => void;
}

export function ProfileScreen({ 
  onNavigateToSettings,
  onNavigateToLanguagePreferences,
  onNavigateToPrivacy,
  onNavigateToHelp,
  onLogout
}: ProfileScreenProps) {
  const { user, profile } = useAuth();
  const { data: profileData, isLoading: profileLoading, error: profileError } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  
  // Use profile from AuthProvider or from useProfile hook
  const currentProfile = profile || profileData;

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLanguageEditor, setShowLanguageEditor] = useState(false);
  const [languageEditType, setLanguageEditType] = useState<'teaching' | 'learning'>('teaching');
  const [showInterestsEditor, setShowInterestsEditor] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Map backend profile data to UI format
  const currentUser = useMemo(() => {
    if (!currentProfile) return null;

    const teachingLang = currentProfile.languages?.teaching?.[0];
    const learningLang = currentProfile.languages?.learning?.[0];

    return {
      id: currentProfile.id,
      name: currentProfile.displayName || 'User',
      age: 0, // Age not stored in backend currently
      avatar: currentProfile.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentProfile.displayName || 'User') + '&background=1DB954&color=fff',
      bio: currentProfile.bio || 'No bio yet.',
      location: [currentProfile.city, currentProfile.country].filter(Boolean).join(', ') || 'Location not set',
      verified: true, // TODO: Add verification status to backend
      premium: false, // TODO: Add premium status to backend
      connectionCount: 0, // TODO: Get from connections hook
      exchangeCount: 0, // TODO: Get from sessions/exchanges table
      rating: 4.8, // TODO: Calculate from reviews
      teaching: teachingLang ? {
        language: teachingLang.language || 'Not set',
        level: teachingLang.level || 'Native',
        flag: getLanguageFlag(teachingLang.language || '')
      } : { language: 'Not set', level: 'Native', flag: '🌐' },
      learning: learningLang ? {
        language: learningLang.language || 'Not set',
        level: learningLang.level || 'Beginner',
        flag: getLanguageFlag(learningLang.language || '')
      } : { language: 'Not set', level: 'Beginner', flag: '🌐' },
      interests: currentProfile.interests || []
    };
  }, [currentProfile]);

  const isAvailable = false; // TODO: Get from availability hook

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleSaveProfile = async (data: any) => {
    if (!user?.id) return;
    
    try {
      await updateProfileMutation.mutateAsync({
        displayName: data.name,
        bio: data.bio,
        city: data.location?.split(',')[0]?.trim(),
        country: data.location?.split(',')[1]?.trim(),
      });
      setShowEditProfile(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleEditLanguage = (type: 'teaching' | 'learning') => {
    setLanguageEditType(type);
    setShowLanguageEditor(true);
  };

  const handleSaveLanguage = async (data: any) => {
    // TODO: Implement language update using useUpdateLanguages hook
    console.log('Save language:', data);
    setShowLanguageEditor(false);
  };

  const handleSaveInterests = async (interests: string[]) => {
    // TODO: Implement interests update
    console.log('Save interests:', interests);
    setShowInterestsEditor(false);
  };

  const handleUpgrade = (planId: string) => {
    console.log('Upgrading to:', planId);
    // TODO: Implement premium upgrade
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TaalMeet Profile',
          text: `Check out ${currentUser?.name}'s language exchange profile on TaalMeet!`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleToggleAvailability = async (checked: boolean) => {
    // TODO: Implement availability toggle
    console.log('Toggle availability:', checked);
  };

  if (profileLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
        <p className="mt-4 text-[#9CA3AF]">Loading profile...</p>
      </div>
    );
  }

  if (profileError || !currentUser) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-4" style={{ backgroundColor: 'var(--color-background)' }}>
        <p className="text-[#EF4444] mb-4">Failed to load profile</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gradient-primary text-white rounded-xl"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="safe-top" style={{ backgroundColor: 'var(--color-card)' }}>
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <button className="p-2 hover:bg-[#2A2A2A] rounded-full transition-colors active:scale-95" onClick={onNavigateToSettings}>
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] px-4 pt-6 pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          {/* Avatar */}
          <div className="relative mb-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-[#2A2A2A]"
            />
            <button 
              className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center border-4 border-[#0F0F0F] active:scale-95 transition-transform"
              onClick={handleEditProfile}
            >
              <Edit className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Name & Badges */}
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-white">
              {currentUser.name}
              {currentUser.age > 0 && `, ${currentUser.age}`}
            </h2>
            {currentUser.verified && (
              <CheckCircle className="w-6 h-6 text-[#5FB3B3]" />
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-[#9CA3AF] mb-4">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{currentUser.location}</span>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {currentUser.connectionCount}
              </div>
              <div className="text-xs text-[#9CA3AF]">Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {currentUser.exchangeCount}
              </div>
              <div className="text-xs text-[#9CA3AF]">Exchanges</div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center mb-1">
                <Star className="w-5 h-5 text-[#F59E0B] fill-current" />
                <span className="text-2xl font-bold text-white">
                  {currentUser.rating}
                </span>
              </div>
              <div className="text-xs text-[#9CA3AF]">Rating</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full">
            <button className="flex-1 py-3 bg-gradient-primary text-white rounded-xl font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform" onClick={handleEditProfile}>
              <Edit className="w-5 h-5" />
              Edit Profile
            </button>
            <button className="px-4 py-3 border border-[#2A2A2A] rounded-xl active:scale-95 transition-transform" onClick={handleShare}>
              <Share2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Premium Banner */}
      {!currentUser.premium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-6 p-4 bg-gradient-to-r from-[#E91E8C] to-[#C71976] rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">
                Upgrade to Premium
              </h3>
              <p className="text-sm text-white/80">
                Get unlimited matches and more features
              </p>
            </div>
            <button className="px-4 py-2 bg-white text-[#E91E8C] rounded-lg font-medium text-sm active:scale-95 transition-transform" onClick={() => setShowPremiumModal(true)}>
              Upgrade
            </button>
          </div>
        </motion.div>
      )}

      {/* About Section */}
      <div className="px-4 mb-6">
        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">About</h3>
            <button className="text-[#5FB3B3] text-sm" onClick={handleEditProfile}>Edit</button>
          </div>
          <p className="text-[#9CA3AF] text-sm leading-relaxed">
            {currentUser.bio}
          </p>
        </div>
      </div>

      {/* Languages Section */}
      <div className="px-4 mb-6">
        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Languages</h3>
            <button className="text-[#5FB3B3] text-sm" onClick={() => handleEditLanguage('teaching')}>Edit</button>
          </div>

          {/* Teaching */}
          <div className="mb-4">
            <p className="text-xs text-[#9CA3AF] mb-2">Teaching</p>
            <div className="flex items-center gap-3 p-3 bg-[#0F0F0F] rounded-lg">
              <span className="text-2xl">{currentUser.teaching.flag}</span>
              <div className="flex-1">
                <p className="text-white font-medium">{currentUser.teaching.language}</p>
                <p className="text-xs text-[#4FD1C5]">{currentUser.teaching.level}</p>
              </div>
              <div className="w-20 h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#4FD1C5] to-[#5FB3B3] rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Learning */}
          <div>
            <p className="text-xs text-[#9CA3AF] mb-2">Learning</p>
            <div className="flex items-center gap-3 p-3 bg-[#0F0F0F] rounded-lg">
              <span className="text-2xl">{currentUser.learning.flag}</span>
              <div className="flex-1">
                <p className="text-white font-medium">{currentUser.learning.language}</p>
                <p className="text-xs text-[#5FB3B3]">{currentUser.learning.level}</p>
              </div>
              <div className="w-20 h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#5FB3B3] to-[#4A9999] rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interests Section */}
      {currentUser.interests && currentUser.interests.length > 0 && (
        <div className="px-4 mb-6">
          <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Interests</h3>
              <button className="text-[#5FB3B3] text-sm" onClick={() => setShowInterestsEditor(true)}>Edit</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentUser.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-[#0F0F0F] border border-[#2A2A2A] rounded-full text-sm text-[#9CA3AF]"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Availability Section */}
      <div className="px-4 mb-6">
        <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Availability</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isAvailable} 
                onChange={(e) => handleToggleAvailability(e.target.checked)} 
              />
              <div className="w-11 h-6 bg-[#2A2A2A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#4FD1C5] peer-checked:to-[#5FB3B3]"></div>
            </label>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#4FD1C5]">
            <div className="w-2 h-2 bg-[#4FD1C5] rounded-full animate-pulse" />
            <span>{isAvailable ? 'Available now' : 'Not available'}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-[#9CA3AF]">
            <Calendar className="w-4 h-4" />
            <span>Usually available: Evenings & Weekends</span>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="px-4 mb-6">
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#222222] transition-colors active:scale-[0.99]" onClick={onNavigateToLanguagePreferences}>
            <span className="text-white">Language Preferences</span>
            <span className="text-[#9CA3AF]">›</span>
          </button>
          <div className="h-px bg-[#2A2A2A]" />
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#222222] transition-colors active:scale-[0.99]" onClick={onNavigateToPrivacy}>
            <span className="text-white">Privacy & Safety</span>
            <span className="text-[#9CA3AF]">›</span>
          </button>
          <div className="h-px bg-[#2A2A2A]" />
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#222222] transition-colors active:scale-[0.99]" onClick={onNavigateToHelp}>
            <span className="text-white">Help & Support</span>
            <span className="text-[#9CA3AF]">›</span>
          </button>
          <div className="h-px bg-[#2A2A2A]" />
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#222222] transition-colors active:scale-[0.99]" onClick={() => setShowLogoutModal(true)}>
            <span className="text-[#EF4444]">Log Out</span>
            <span className="text-[#9CA3AF]">›</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {showEditProfile && currentUser && (
        <EditProfileModal
          isOpen={showEditProfile}
          currentData={{
            name: currentUser.name,
            age: currentUser.age,
            location: currentUser.location,
            bio: currentUser.bio,
            avatar: currentUser.avatar
          }}
          onSave={handleSaveProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}
      {showLanguageEditor && currentUser && (
        <LanguageEditorModal
          isOpen={showLanguageEditor}
          type={languageEditType}
          currentLanguage={languageEditType === 'teaching' ? currentUser.teaching : currentUser.learning}
          onSave={handleSaveLanguage}
          onClose={() => setShowLanguageEditor(false)}
        />
      )}
      {showInterestsEditor && currentUser && (
        <InterestsEditorModal
          isOpen={showInterestsEditor}
          currentInterests={currentUser.interests}
          onSave={handleSaveInterests}
          onClose={() => setShowInterestsEditor(false)}
        />
      )}
      {showPremiumModal && (
        <PremiumUpgradeModal
          isOpen={showPremiumModal}
          onUpgrade={handleUpgrade}
          onClose={() => setShowPremiumModal(false)}
        />
      )}
      {showLogoutModal && (
        <LogoutConfirmationModal
          isOpen={showLogoutModal}
          onConfirm={handleLogout}
          onClose={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
}