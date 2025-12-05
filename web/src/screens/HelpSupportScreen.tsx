import { ArrowLeft, HelpCircle, MessageCircle, Mail, FileText, ExternalLink } from 'lucide-react';

interface HelpSupportScreenProps {
  onBack: () => void;
}

export function HelpSupportScreen({ onBack }: HelpSupportScreenProps) {
  const faqs = [
    {
      question: 'How do I find language partners?',
      answer: 'Use the Discover tab to browse sessions and the Map to find partners nearby.'
    },
    {
      question: 'How does matching work?',
      answer: 'We match you based on language compatibility, location, and shared interests.'
    },
    {
      question: 'Is TaalMeet free?',
      answer: 'Yes! TaalMeet is free with optional Premium features for enhanced experience.'
    },
    {
      question: 'How do I report inappropriate behavior?',
      answer: 'Go to Privacy & Safety settings and tap "Report an Issue".'
    }
  ];

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
          <h1 className="text-2xl font-bold text-white">Help & Support</h1>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase mb-3">Contact Us</h2>
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#222222] transition-colors active:scale-[0.99]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1DB954]/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[#1DB954]" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Live Chat</p>
                <p className="text-xs text-[#9CA3AF]">Chat with our support team</p>
              </div>
            </div>
            <span className="text-[#9CA3AF]">›</span>
          </button>
          <div className="h-px bg-[#2A2A2A]" />
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#222222] transition-colors active:scale-[0.99]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#5FB3B3]/20 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#5FB3B3]" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Email Support</p>
                <p className="text-xs text-[#9CA3AF]">support@taalmeet.com</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#9CA3AF]" />
          </button>
        </div>
      </div>

      {/* FAQs */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase mb-3">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden group"
            >
              <summary className="p-4 cursor-pointer hover:bg-[#222222] transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-[#E91E8C]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-4 h-4 text-[#E91E8C]" />
                  </div>
                  <p className="text-white font-medium">{faq.question}</p>
                </div>
                <span className="text-[#9CA3AF] group-open:rotate-180 transition-transform">
                  ›
                </span>
              </summary>
              <div className="px-4 pb-4 pt-0">
                <p className="text-sm text-[#9CA3AF] pl-11">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase mb-3">Resources</h2>
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#222222] transition-colors active:scale-[0.99]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F59E0B]/20 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">User Guide</p>
                <p className="text-xs text-[#9CA3AF]">Learn how to use TaalMeet</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#9CA3AF]" />
          </button>
          <div className="h-px bg-[#2A2A2A]" />
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#222222] transition-colors active:scale-[0.99]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Safety Tips</p>
                <p className="text-xs text-[#9CA3AF]">Stay safe while learning</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#9CA3AF]" />
          </button>
          <div className="h-px bg-[#2A2A2A]" />
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#222222] transition-colors active:scale-[0.99]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1DB954]/20 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#1DB954]" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Community Guidelines</p>
                <p className="text-xs text-[#9CA3AF]">Our community standards</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#9CA3AF]" />
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="p-4">
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-4 text-center">
          <p className="text-sm text-[#9CA3AF] mb-1">TaalMeet Version 1.0.0</p>
          <p className="text-xs text-[#6B7280]">© 2025 TaalMeet. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
