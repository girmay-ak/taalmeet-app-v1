import { useState } from 'react';
import { X, AlertCircle, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (issue: { category: string; subject: string; description: string; screenshot?: File }) => void;
}

const issueCategories = [
  { id: 'bug', label: 'Bug / Technical Issue', icon: '🐛' },
  { id: 'feature', label: 'Feature Request', icon: '💡' },
  { id: 'account', label: 'Account Issue', icon: '👤' },
  { id: 'payment', label: 'Payment Problem', icon: '💳' },
  { id: 'matching', label: 'Matching Issue', icon: '🔍' },
  { id: 'messaging', label: 'Messaging Problem', icon: '💬' },
  { id: 'performance', label: 'Performance Issue', icon: '⚡' },
  { id: 'other', label: 'Other', icon: '📝' },
];

export function ReportIssueModal({ isOpen, onClose, onSubmit }: ReportIssueModalProps) {
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!category || !subject || !description) return;

    onSubmit({
      category,
      subject,
      description,
      screenshot: screenshot || undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setCategory('');
    setSubject('');
    setDescription('');
    setScreenshot(null);
    setSubmitted(false);
    setShowCategoryDropdown(false);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const selectedCategory = issueCategories.find((c) => c.id === category);
  const isValid = category && subject.trim() && description.trim();

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
          {!submitted ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                    Report an Issue
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
                {/* Category Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Issue Category *
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors"
                      style={{
                        backgroundColor: 'var(--color-background)',
                        borderColor: 'var(--color-border)',
                        color: selectedCategory ? 'var(--color-text)' : 'var(--color-text-muted)',
                      }}
                    >
                      <span>
                        {selectedCategory ? (
                          <>
                            {selectedCategory.icon} {selectedCategory.label}
                          </>
                        ) : (
                          'Select a category'
                        )}
                      </span>
                      <ChevronDown className={`w-5 h-5 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {showCategoryDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 right-0 mt-2 rounded-xl border overflow-hidden z-10"
                          style={{
                            backgroundColor: 'var(--color-card)',
                            borderColor: 'var(--color-border)',
                          }}
                        >
                          {issueCategories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => {
                                setCategory(cat.id);
                                setShowCategoryDropdown(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2A2A2A] transition-colors text-left"
                            >
                              <span className="text-xl">{cat.icon}</span>
                              <span style={{ color: 'var(--color-text)' }}>{cat.label}</span>
                              {category === cat.id && (
                                <Check className="w-5 h-5 ml-auto text-[#1DB954]" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Subject */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of the issue"
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                    maxLength={100}
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {subject.length}/100
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide as much detail as possible..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all resize-none"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                    maxLength={1000}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      Include steps to reproduce, expected behavior, etc.
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {description.length}/1000
                    </span>
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Screenshot (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="screenshot-upload"
                    />
                    <label
                      htmlFor="screenshot-upload"
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed cursor-pointer transition-colors hover:bg-[#2A2A2A]"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      {screenshot ? (
                        <>
                          <Check className="w-5 h-5 text-[#10B981]" />
                          <span style={{ color: 'var(--color-text)' }}>
                            {screenshot.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <span style={{ color: 'var(--color-text-muted)' }}>
                            📸 Tap to upload screenshot
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                        We're here to help
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        Our team typically responds within 24 hours. We'll contact you via email.
                      </p>
                    </div>
                  </div>
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
                  onClick={handleSubmit}
                  disabled={!isValid}
                  className="flex-1 py-3 px-4 bg-gradient-primary text-white rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Report
                </button>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#10B981]/20 flex items-center justify-center"
              >
                <Check className="w-10 h-10 text-[#10B981]" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                Report Submitted!
              </h3>
              <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
                Thank you for helping us improve TaalMeet. We'll review your report and get back to you soon.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
