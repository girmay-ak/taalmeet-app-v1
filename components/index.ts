// Export all components from this file

// Base Components (Working)
export { Button } from './Button';
export { Input } from './Input';
export { SessionCard } from './SessionCard';
export { StatusIndicator } from './StatusIndicator';
export { BottomNav } from './BottomNav';
export { ThemeToggle } from './ThemeToggle';

// TODO: Fix these - they use lucide-react (web-only icons)
// export { PartnerCard } from './PartnerCard';
// export { ConversationCard } from './ConversationCard';
// export { MatchFoundPopup } from './MatchFoundPopup';
// export { AvailabilityBottomSheet } from './AvailabilityBottomSheet';
// export { AvailabilityNotifications } from './AvailabilityNotifications';
// export { TimeSlotModal } from './TimeSlotModal';

// Animations (React Native Only)
export { FlowingWavesRN } from './animations/FlowingWavesRN';
export { ConfettiRN } from './animations/ConfettiRN';

// Match Components
export { MatchFoundPopup } from './matches/MatchFoundPopup';

// Notification Components
export { NotificationContainer } from './notifications/NotificationContainer';
export { ConnectionNotificationComponent } from './notifications/ConnectionNotification';

// Event Components
export { EventCard } from './events/EventCard';
export { EventHorizontalCard } from './events/EventHorizontalCard';

// Profile Components
export { EditProfileModal } from './profile/EditProfileModal';
export { ChangePasswordModal } from './profile/ChangePasswordModal';

// TODO: Fix these animations (use motion/react - web-only)
// export { AnimatedGradient } from './animations/AnimatedGradient';
// export { FloatingBadge } from './animations/FloatingBadge';
// export { FloatingParticles } from './animations/FloatingParticles';
// export { RippleButton } from './animations/RippleButton';
// export { SkeletonLoader } from './animations/SkeletonLoader';
// export { Confetti } from './animations/Confetti';
// export { FlowingWaves } from './animations/FlowingWaves';
// export { PullToRefresh } from './animations/PullToRefresh';
// export { Toast } from './animations/Toast';

// Modals - TODO: Fix these (use lucide-react)
// export { ChangePasswordModal } from './modals/ChangePasswordModal';
// export { EditProfileModal } from './modals/EditProfileModal';
// export { InterestsEditorModal } from './modals/InterestsEditorModal';
// export { LanguageEditorModal } from './modals/LanguageEditorModal';
// export { LanguageSelectionModal } from './modals/LanguageSelectionModal';
// export { LogoutConfirmationModal } from './modals/LogoutConfirmationModal';
// export { PremiumUpgradeModal } from './modals/PremiumUpgradeModal';
// export { ReportIssueModal } from './modals/ReportIssueModal';

// Safety Modals (React Native)
export { ReportUserModal } from './modals/ReportUserModal';
export { DeleteAccountModal } from './modals/DeleteAccountModal';
export { ActionModal } from './modals/ActionModal';

// Icons
export * from './icons';

// Signup Flow Components
export * from './signup';

// Figma Components - TODO: Convert to React Native (uses HTMLImageElement)
// export { ImageWithFallback } from './figma/ImageWithFallback';

// UI Library - Web-based Shadcn/Radix components (use @radix-ui, class-variance-authority)
// These are REFERENCE ONLY - use them as inspiration for building RN versions
// TODO: Convert to React Native equivalents as needed
// export * from './ui/button';
// export * from './ui/input';
// export * from './ui/card';
// export * from './ui/avatar';
// export * from './ui/badge';
// export * from './ui/dialog';
// export * from './ui/sheet';
// export * from './ui/sonner';
// export * from './ui/skeleton';
// ... 38 more ui components available in components/ui/ folder
