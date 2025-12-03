import { useState } from 'react';
import { X, Eye, EyeOff, Lock, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (passwords: { currentPassword: string; newPassword: string }) => void;
}

export function ChangePasswordModal({ isOpen, onClose, onSave }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: '#EF4444' };
    if (strength <= 3) return { strength, label: 'Fair', color: '#F59E0B' };
    if (strength <= 4) return { strength, label: 'Good', color: '#10B981' };
    return { strength, label: 'Strong', color: '#10B981' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({ currentPassword, newPassword });
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full max-w-lg mx-4 rounded-t-3xl sm:rounded-3xl overflow-hidden safe-bottom"
          style={{ backgroundColor: 'var(--color-card)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                Change Password
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[#2A2A2A] rounded-full transition-colors"
            >
              <X className="w-5 h-5" style={{ color: 'var(--color-text)' }} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Current Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: errors.currentPassword ? '#EF4444' : 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#2A2A2A] rounded transition-colors"
                >
                  {showCurrent ? (
                    <EyeOff className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                  ) : (
                    <Eye className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <div className="flex items-center gap-1 mt-2 text-sm text-[#EF4444]">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.currentPassword}</span>
                </div>
              )}
            </div>

            {/* New Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: errors.newPassword ? '#EF4444' : 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#2A2A2A] rounded transition-colors"
                >
                  {showNew ? (
                    <EyeOff className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                  ) : (
                    <Eye className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <div className="flex items-center gap-1 mt-2 text-sm text-[#EF4444]">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.newPassword}</span>
                </div>
              )}

              {/* Password Strength */}
              {newPassword && !errors.newPassword && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      Password Strength:
                    </span>
                    <span className="text-sm font-medium" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      className="h-full rounded-full transition-all"
                      style={{ backgroundColor: passwordStrength.color }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Password Requirements */}
            <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>
                Password must contain:
              </p>
              <div className="space-y-2">
                <PasswordRequirement
                  met={newPassword.length >= 8}
                  text="At least 8 characters"
                />
                <PasswordRequirement
                  met={/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)}
                  text="Uppercase and lowercase letters"
                />
                <PasswordRequirement
                  met={/[0-9]/.test(newPassword)}
                  text="At least one number"
                />
                <PasswordRequirement
                  met={/[^a-zA-Z0-9]/.test(newPassword)}
                  text="At least one special character"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: errors.confirmPassword ? '#EF4444' : 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#2A2A2A] rounded transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                  ) : (
                    <Eye className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center gap-1 mt-2 text-sm text-[#EF4444]">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <div className="flex items-center gap-1 mt-2 text-sm text-[#10B981]">
                  <Check className="w-4 h-4" />
                  <span>Passwords match</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={handleClose}
              className="flex-1 py-3 px-4 rounded-xl font-medium border transition-all active:scale-95"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 px-4 bg-gradient-primary text-white rounded-xl font-medium transition-all active:scale-95"
            >
              Change Password
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

interface PasswordRequirementProps {
  met: boolean;
  text: string;
}

function PasswordRequirement({ met, text }: PasswordRequirementProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${met ? 'bg-[#10B981]' : 'bg-[#2A2A2A]'}`}>
        {met && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className={`text-sm ${met ? 'text-[#10B981]' : 'text-[#9CA3AF]'}`}>
        {text}
      </span>
    </div>
  );
}
