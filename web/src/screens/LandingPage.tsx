import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, useAnimation } from 'motion/react';
import { MapPin, MessageCircle, Globe, Users, Calendar, Coffee, Video, ArrowRight, Check, Star, Menu, X, Download, Smartphone, Sparkles, Zap, Shield, TrendingUp, Award, Languages, Heart } from 'lucide-react';
import { TaalMeetLogo } from '../components/TaalMeetLogo';

// Animated Hello Component
function AnimatedHello() {
  const hellos = [
    { text: 'Hello', lang: 'English' },
    { text: 'Hola', lang: 'Spanish' },
    { text: 'Bonjour', lang: 'French' },
    { text: 'こんにちは', lang: 'Japanese' },
    { text: '안녕하세요', lang: 'Korean' },
    { text: 'Ciao', lang: 'Italian' },
    { text: 'Hallo', lang: 'German' },
    { text: 'Olá', lang: 'Portuguese' },
    { text: 'Привет', lang: 'Russian' },
    { text: 'مرحبا', lang: 'Arabic' },
    { text: 'Namaste', lang: 'Hindi' },
    { text: 'Nǐ hǎo', lang: 'Mandarin' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % hellos.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8 }}
      className="text-center"
    >
      <div className="text-3xl font-bold text-white mb-1">{hellos[currentIndex].text}</div>
      <div className="text-xs text-white/60">{hellos[currentIndex].lang}</div>
    </motion.div>
  );
}

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

// Animated Counter Component
function AnimatedCounter({ end, duration = 2, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// Floating Particles Component
function FloatingParticles() {
  const particles = Array.from({ length: 20 });
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-primary rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

// Animated Gradient Orb
function GradientOrb({ delay = 0, className = '' }: { delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
      }}
    />
  );
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  
  const heroInView = useInView(heroRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });

  // Parallax effects
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const features = [
    {
      icon: MapPin,
      title: 'Location-Based Matching',
      description: 'Find language partners within walking distance using smart geolocation',
      gradient: 'from-[#5FB3B3] to-[#4A9999]',
      delay: 0.1
    },
    {
      icon: MessageCircle,
      title: 'Instant Messaging',
      description: 'Real-time chat with translation support and voice messages',
      gradient: 'from-[#1DB954] to-[#1ED760]',
      delay: 0.2
    },
    {
      icon: Video,
      title: 'Video Sessions',
      description: 'HD video calls with screen sharing and recording features',
      gradient: 'from-[#8B5CF6] to-[#A78BFA]',
      delay: 0.3
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'AI-powered calendar sync for perfect meeting times',
      gradient: 'from-[#E91E8C] to-[#F43F5E]',
      delay: 0.4
    },
    {
      icon: Users,
      title: 'Community Events',
      description: 'Join language cafés, meetups, and cultural exchanges',
      gradient: 'from-[#F59E0B] to-[#FCD34D]',
      delay: 0.5
    },
    {
      icon: Award,
      title: 'Achievement System',
      description: 'Earn badges, track progress, and level up your skills',
      gradient: 'from-[#10B981] to-[#34D399]',
      delay: 0.6
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Download & Sign Up',
      description: 'Get the app free on iOS or Android in under 2 minutes',
      icon: Smartphone,
      color: '#5FB3B3'
    },
    {
      step: '2',
      title: 'Create Your Profile',
      description: 'Tell us your languages, interests, and learning goals',
      icon: Users,
      color: '#1DB954'
    },
    {
      step: '3',
      title: 'Find Perfect Matches',
      description: 'Browse profiles, chat, and schedule your first session',
      icon: Heart,
      color: '#E91E8C'
    },
    {
      step: '4',
      title: 'Start Speaking!',
      description: 'Meet in person or virtually and make real progress',
      icon: Zap,
      color: '#F59E0B'
    }
  ];

  const testimonials = [
    {
      name: 'Emma Thompson',
      role: 'Learning Japanese 🇯🇵',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=1DB954',
      text: 'I found 5 amazing language partners in my neighborhood! We meet twice a week at a local café. My Japanese went from beginner to conversational in 3 months! 🎌✨',
      rating: 5,
      verified: true
    },
    {
      name: 'Carlos Rodriguez',
      role: 'Teaching Spanish, Learning German 🇩🇪',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos&backgroundColor=5FB3B3',
      text: 'TaalMeet changed my life! I\'ve helped 15+ people with Spanish while perfecting my German. The community is incredible and the app is so intuitive.',
      rating: 5,
      verified: true
    },
    {
      name: 'Yuki Tanaka',
      role: 'Learning English 🇬🇧',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki&backgroundColor=1ED760',
      text: 'Best language app ever! Video calls work perfectly, scheduling is automatic, and I made real friends. Already recommended to 20+ people! 💯',
      rating: 5,
      verified: true
    },
    {
      name: 'Sarah Mitchell',
      role: 'Learning French 🇫🇷',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=E91E8C',
      text: 'From zero French to having full conversations in 4 months! The in-person meetups are gold. Can\'t imagine learning without TaalMeet now.',
      rating: 5,
      verified: true
    },
    {
      name: 'Ahmed Hassan',
      role: 'Teaching Arabic 🇦🇪',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed&backgroundColor=F59E0B',
      text: 'The map feature is genius! Found learners nearby I never knew existed. Teaching Arabic has been so rewarding and fun through this app.',
      rating: 5,
      verified: true
    },
    {
      name: 'Maria Silva',
      role: 'Learning Korean 🇰🇷',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria&backgroundColor=8B5CF6',
      text: 'This app is addictive in the best way! Love the achievement badges and the community events. My Korean improved so fast! 감사합니다 💜',
      rating: 5,
      verified: true
    }
  ];

  const languages = [
    '🇪🇸 Spanish', '🇫🇷 French', '🇩🇪 German', '🇮🇹 Italian', '🇯🇵 Japanese',
    '🇰🇷 Korean', '🇨🇳 Mandarin', '🇷🇺 Russian', '🇵🇹 Portuguese', '🇦🇪 Arabic',
    '🇮🇳 Hindi', '🇳🇱 Dutch', '🇸🇪 Swedish', '🇹🇷 Turkish', '🇵🇱 Polish',
    '🇬🇷 Greek', '🇻🇳 Vietnamese', '🇹🇭 Thai', '🇮🇩 Indonesian', '🇮🇱 Hebrew'
  ];

  const appFeatures = [
    { icon: Shield, text: 'Verified Profiles' },
    { icon: Zap, text: 'Instant Matching' },
    { icon: Languages, text: '80+ Languages' },
    { icon: TrendingUp, text: 'Track Progress' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-x-hidden">
      {/* Video Background */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F0F] via-transparent to-[#1A1A1A]" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(95, 179, 179, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(29, 185, 84, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 40% 20%, rgba(233, 30, 140, 0.1) 0%, transparent 50%)`
        }} />
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: `linear-gradient(45deg, transparent 0%, rgba(95, 179, 179, 0.03) 50%, transparent 100%)`,
            backgroundSize: '200% 200%',
          }}
        />
      </div>

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Animated Gradient Orbs */}
      <GradientOrb 
        delay={0}
        className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#5FB3B3] rounded-full blur-3xl pointer-events-none"
      />
      <GradientOrb 
        delay={1}
        className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-[#1DB954] rounded-full blur-3xl pointer-events-none"
      />
      <GradientOrb 
        delay={2}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#E91E8C] rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10">
        {/* Navigation */}
        <motion.nav 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/60 backdrop-blur-2xl border-b border-white/5"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Logo */}
              <motion.div 
                className="flex items-center gap-2 sm:gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <TaalMeetLogo size={40} className="sm:w-12 sm:h-12" />
                <span className="text-xl sm:text-2xl font-bold text-white">TaalMeet</span>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                {['Features', 'How It Works', 'Testimonials', 'Download'].map((item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    className="text-[#9CA3AF] hover:text-white transition-colors relative group"
                    whileHover={{ scale: 1.05 }}
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300" />
                  </motion.a>
                ))}
                <motion.button
                  onClick={onLogin}
                  className="text-[#9CA3AF] hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Log In
                </motion.button>
                <motion.button
                  onClick={onGetStarted}
                  className="px-6 py-2.5 bg-gradient-primary text-white rounded-xl font-semibold relative overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">Get Started</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#1ED760] to-[#5FB3B3]"
                    initial={{ x: '100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#1A1A1A]/95 backdrop-blur-xl border-t border-white/5"
            >
              <div className="px-4 py-4 space-y-3">
                {['Features', 'How It Works', 'Testimonials', 'Download'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-[#9CA3AF] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {item}
                  </a>
                ))}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogin();
                  }}
                  className="block w-full text-left px-4 py-3 text-[#9CA3AF] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onGetStarted();
                  }}
                  className="block w-full px-4 py-3 bg-gradient-primary text-white rounded-lg font-semibold"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </motion.nav>

        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          <motion.div 
            style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center"
          >
            {/* Floating Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ 
                type: 'spring',
                stiffness: 100,
                damping: 15,
                delay: 0.2 
              }}
              className="flex justify-center mb-8"
            >
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative"
              >
                <div className="w-28 h-28 sm:w-36 sm:h-36">
                  <TaalMeetLogo size={144} />
                </div>
                <motion.div
                  className="absolute inset-0 bg-gradient-primary rounded-full blur-2xl opacity-50"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Main Headline with Gradient Animation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 relative">
                <motion.span
                  className="inline-block"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                  }}
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #5FB3B3, #1DB954, #1ED760, #5FB3B3)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Meet. Speak.
                </motion.span>
                <br />
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  Connect.
                </motion.span>
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-xl sm:text-2xl md:text-3xl text-[#9CA3AF] mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Find language partners <span className="text-gradient-primary font-semibold">nearby</span> for real conversations at local cafés or online.{' '}
              <span className="text-white font-semibold">Join 50,000+ learners worldwide.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <motion.button
                onClick={() => window.open('https://apps.apple.com/app/taalmeet', '_blank')}
                className="group relative w-full sm:w-auto px-10 py-5 bg-gradient-primary text-white rounded-2xl font-bold text-lg overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(29, 185, 84, 0.6)' }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="text-xs opacity-90">Download on</span>
                    <span className="text-base -mt-1">App Store</span>
                  </div>
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#1ED760] to-[#5FB3B3]"
                  initial={{ x: '100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>

              <motion.button
                onClick={() => window.open('https://play.google.com/store/apps/details?id=com.taalmeet', '_blank')}
                className="group relative w-full sm:w-auto px-10 py-5 bg-white/5 backdrop-blur-sm border-2 border-white/20 text-white rounded-2xl font-bold text-lg overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.05, borderColor: 'rgba(29, 185, 84, 0.5)', boxShadow: '0 0 40px rgba(95, 179, 179, 0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="text-xs opacity-90">GET IT ON</span>
                    <span className="text-base -mt-1">Google Play</span>
                  </div>
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#5FB3B3] to-[#1ED760]"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </motion.div>

            {/* App Features Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              {appFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full"
                  >
                    <Icon className="w-4 h-4 text-[#1DB954]" />
                    <span className="text-sm text-white">{feature.text}</span>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Global Map with Connected People */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="relative w-full max-w-6xl mx-auto h-80 sm:h-96"
            >
              {/* World Map SVG */}
              <svg className="w-full h-full opacity-20" viewBox="0 0 1000 500" fill="none">
                {/* Simplified world map paths */}
                <path
                  d="M100,150 L120,140 L140,145 L160,140 L180,150 L200,155 L220,150 L240,160 L260,165 L280,160 L300,170 L320,165 L340,175 L360,170 L380,180 L400,175 L420,185 L440,180 M450,190 L470,185 L490,195 L510,190 L530,200 L550,195 L570,205 L590,200 L610,210 L630,205 L650,215 L670,210 L690,220 L710,215 L730,225 L750,220 L770,230 L790,225 L810,235 L830,230 L850,240 L870,235 L890,245 L900,240"
                  stroke="url(#mapGradient)"
                  strokeWidth="2"
                  className="map-path"
                />
                <path
                  d="M150,250 Q200,240 250,245 T350,250 Q400,255 450,250 T550,255 Q600,250 650,255 T750,260 Q800,265 850,260"
                  stroke="url(#mapGradient)"
                  strokeWidth="2"
                  className="map-path"
                />
                <path
                  d="M100,300 L150,295 L200,305 L250,300 L300,310 L350,305 L400,315 L450,310"
                  stroke="url(#mapGradient)"
                  strokeWidth="2"
                  className="map-path"
                />
                
                <defs>
                  <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#5FB3B3" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#1DB954" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#5FB3B3" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Connection Lines Between Users */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 500">
                {[
                  { x1: 200, y1: 200, x2: 400, y2: 180, delay: 0 },
                  { x1: 400, y1: 180, x2: 600, y2: 220, delay: 0.2 },
                  { x1: 600, y1: 220, x2: 800, y2: 200, delay: 0.4 },
                  { x1: 250, y1: 280, x2: 450, y2: 260, delay: 0.1 },
                  { x1: 450, y1: 260, x2: 650, y2: 300, delay: 0.3 },
                  { x1: 350, y1: 150, x2: 550, y2: 170, delay: 0.15 },
                ].map((line, index) => (
                  <motion.line
                    key={`map-line-${index}`}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="url(#connectionGradient)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.4 }}
                    transition={{
                      delay: 1.8 + line.delay,
                      duration: 1.5,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
                
                <defs>
                  <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1ED760" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#1DB954" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#5FB3B3" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>

              {/* User Pins Around the World */}
              <div className="absolute inset-0">
                {[
                  { x: '20%', y: '40%', delay: 0, name: 'São Paulo' },
                  { x: '40%', y: '36%', delay: 0.1, name: 'New York' },
                  { x: '50%', y: '30%', delay: 0.2, name: 'London' },
                  { x: '60%', y: '44%', delay: 0.3, name: 'Dubai' },
                  { x: '70%', y: '38%', delay: 0.4, name: 'Mumbai' },
                  { x: '80%', y: '40%', delay: 0.5, name: 'Tokyo' },
                  { x: '85%', y: '60%', delay: 0.6, name: 'Sydney' },
                  { x: '25%', y: '56%', delay: 0.15, name: 'Buenos Aires' },
                  { x: '45%', y: '52%', delay: 0.25, name: 'Lagos' },
                  { x: '65%', y: '60%', delay: 0.35, name: 'Singapore' },
                ].map((pin, index) => (
                  <motion.div
                    key={`pin-${index}`}
                    initial={{ scale: 0, opacity: 0, y: -20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{
                      delay: 1.8 + pin.delay,
                      type: 'spring',
                      stiffness: 300,
                      damping: 15,
                    }}
                    className="absolute group cursor-pointer"
                    style={{ left: pin.x, top: pin.y }}
                  >
                    {/* Pin */}
                    <div className="relative">
                      <motion.div
                        animate={{
                          y: [0, -8, 0],
                        }}
                        transition={{
                          delay: 2 + pin.delay,
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="relative"
                      >
                        <MapPin className="w-6 h-6 text-[#1DB954] drop-shadow-lg" fill="#1ED760" />
                      </motion.div>
                      
                      {/* Ripple Effect */}
                      <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-[#1DB954]"
                        animate={{
                          scale: [1, 2, 1],
                          opacity: [0.6, 0, 0.6],
                        }}
                        transition={{
                          delay: 2 + pin.delay,
                          duration: 3,
                          repeat: Infinity,
                          ease: 'easeOut',
                        }}
                      />
                      
                      {/* City Label */}
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.2 + pin.delay }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <div className="bg-[#1DB954] text-white text-xs px-2 py-1 rounded-lg shadow-lg">
                          {pin.name}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Stats Overlay */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5 }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl"
              >
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 2.7, type: 'spring' }}
                        className="text-3xl font-bold text-[#1DB954] mb-1"
                      >
                        150+
                      </motion.div>
                      <div className="text-xs text-[#9CA3AF]">Countries</div>
                    </div>
                    <div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 2.8, type: 'spring' }}
                        className="text-3xl font-bold text-[#1ED760] mb-1"
                      >
                        50K+
                      </motion.div>
                      <div className="text-xs text-[#9CA3AF]">Active Users</div>
                    </div>
                    <div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 2.9, type: 'spring' }}
                        className="text-3xl font-bold text-[#5FB3B3] mb-1"
                      >
                        100+
                      </motion.div>
                      <div className="text-xs text-[#9CA3AF]">Languages</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Animated Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-xs text-[#9CA3AF]">Scroll to explore</span>
              <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2">
                <motion.div
                  animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-1.5 h-1.5 bg-gradient-primary rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" ref={featuresRef} className="py-24 sm:py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-2 bg-gradient-primary/10 border border-[#1DB954]/30 rounded-full mb-6"
              >
                <span className="text-gradient-primary font-semibold">✨ Powerful Features</span>
              </motion.div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
                Everything You Need to
                <br />
                <span className="text-gradient-primary">Master Any Language</span>
              </h2>
              <p className="text-xl text-[#9CA3AF] max-w-3xl mx-auto">
                Cutting-edge technology meets human connection for the ultimate language learning experience
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: feature.delay }}
                    whileHover={{ 
                      y: -10,
                      transition: { duration: 0.2 }
                    }}
                    className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-[#1DB954]/50 transition-all overflow-hidden"
                  >
                    {/* Gradient Overlay on Hover */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
                    />
                    
                    <div className="relative z-10">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:shadow-2xl`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                      
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-gradient-primary transition-all">
                        {feature.title}
                      </h3>
                      <p className="text-[#9CA3AF] leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Sparkle Effect */}
                    <motion.div
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-5 h-5 text-[#1DB954]" />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 sm:py-32 relative bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-2 bg-gradient-primary/10 border border-[#1DB954]/30 rounded-full mb-6"
              >
                <span className="text-gradient-primary font-semibold">🚀 Simple Process</span>
              </motion.div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
                Start Speaking in
                <br />
                <span className="text-gradient-primary">4 Easy Steps</span>
              </h2>
              <p className="text-xl text-[#9CA3AF] max-w-3xl mx-auto">
                From download to your first conversation in minutes, not months
              </p>
            </motion.div>

            <div className="relative">
              {/* Connection Line */}
              <div className="hidden lg:block absolute top-20 left-0 right-0 h-1">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#5FB3B3] via-[#1DB954] to-[#F59E0B] opacity-30"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                {howItWorks.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 }}
                      className="relative text-center group"
                    >
                      {/* Step Number Circle */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10 w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                        style={{ 
                          background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)`,
                          boxShadow: `0 10px 40px ${item.color}40`
                        }}
                      >
                        <span className="text-3xl font-bold text-white">{item.step}</span>
                        
                        {/* Pulse Ring */}
                        <motion.div
                          className="absolute inset-0 rounded-full border-2"
                          style={{ borderColor: item.color }}
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.div>

                      {/* Icon */}
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="mb-4"
                      >
                        <Icon className="w-12 h-12 mx-auto" style={{ color: item.color }} />
                      </motion.div>

                      {/* Content */}
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gradient-primary transition-all">
                        {item.title}
                      </h3>
                      <p className="text-[#9CA3AF]">{item.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-20"
            >
              <motion.button
                onClick={onGetStarted}
                className="px-10 py-5 bg-gradient-primary text-white rounded-2xl font-bold text-lg shadow-2xl"
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(29, 185, 84, 0.6)' }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </span>
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { number: 50000, label: 'Active Users', suffix: '+' },
                { number: 120, label: 'Countries', suffix: '+' },
                { number: 80, label: 'Languages', suffix: '+' },
                { number: 1000000, label: 'Conversations', suffix: '+' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl hover:border-[#1DB954]/50 transition-all"
                >
                  <motion.div 
                    className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #5FB3B3, #1DB954, #1ED760)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    <AnimatedCounter end={stat.number} duration={2.5} suffix={stat.suffix} />
                  </motion.div>
                  <div className="text-sm sm:text-base text-[#9CA3AF]">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 sm:py-32 relative bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-2 bg-gradient-primary/10 border border-[#1DB954]/30 rounded-full mb-6"
              >
                <span className="text-gradient-primary font-semibold">💬 Real Stories</span>
              </motion.div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
                Loved by Language Learners
                <br />
                <span className="text-gradient-primary">Worldwide</span>
              </h2>
              <p className="text-xl text-[#9CA3AF] max-w-3xl mx-auto">
                Join thousands who transformed their language skills with TaalMeet
              </p>
            </motion.div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => {
                // Alternate animation directions for variety
                const isEven = index % 2 === 0;
                const direction = index % 3 === 0 ? -50 : index % 3 === 1 ? 50 : 0;
                
                return (
                  <motion.div
                    key={testimonial.name}
                    initial={{ 
                      opacity: 0, 
                      y: 50,
                      x: direction,
                      scale: 0.8,
                      rotateY: isEven ? -15 : 15
                    }}
                    whileInView={{ 
                      opacity: 1, 
                      y: 0,
                      x: 0,
                      scale: 1,
                      rotateY: 0
                    }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ 
                      delay: index * 0.15,
                      duration: 0.6,
                      type: 'spring',
                      stiffness: 100,
                      damping: 15
                    }}
                    whileHover={{ 
                      y: -15, 
                      scale: 1.03,
                      rotateY: 5,
                      transition: { duration: 0.3 } 
                    }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-[#1DB954]/50 transition-all relative overflow-hidden group"
                  >
                    {/* Hover Gradient */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/5 to-[#5FB3B3]/5 opacity-0 group-hover:opacity-100 transition-opacity"
                    />

                    {/* Animated Border Glow */}
                    <motion.div
                      className="absolute inset-0 rounded-3xl"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: [0, 0.5, 0] }}
                      transition={{ 
                        delay: index * 0.15 + 0.3,
                        duration: 1.5,
                        ease: 'easeInOut'
                      }}
                      style={{
                        boxShadow: '0 0 30px rgba(29, 185, 84, 0.5)'
                      }}
                    />

                    <div className="relative z-10">
                      {/* Rating */}
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, rotate: -180, opacity: 0 }}
                            whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                            viewport={{ once: false }}
                            transition={{ 
                              delay: index * 0.15 + i * 0.08,
                              type: 'spring',
                              stiffness: 200,
                              damping: 10
                            }}
                            whileHover={{
                              scale: 1.3,
                              rotate: 360,
                              transition: { duration: 0.3 }
                            }}
                          >
                            <Star className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
                          </motion.div>
                        ))}
                      </div>

                      {/* Text */}
                      <motion.p 
                        className="text-white leading-relaxed mb-6 text-lg"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        transition={{ 
                          delay: index * 0.15 + 0.2,
                          duration: 0.5
                        }}
                      >
                        "{testimonial.text}"
                      </motion.p>

                      {/* Author */}
                      <motion.div 
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false }}
                        transition={{ 
                          delay: index * 0.15 + 0.4,
                          duration: 0.5
                        }}
                      >
                        <motion.img
                          whileHover={{ 
                            scale: 1.2, 
                            rotate: 360,
                            transition: { duration: 0.5 }
                          }}
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-[#1DB954]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-white">{testimonial.name}</p>
                            {testimonial.verified && (
                              <motion.div
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: false }}
                                transition={{ 
                                  delay: index * 0.15 + 0.5,
                                  type: 'spring',
                                  stiffness: 200
                                }}
                                whileHover={{ 
                                  rotate: 360,
                                  scale: 1.2,
                                  transition: { duration: 0.5 }
                                }}
                              >
                                <Check className="w-4 h-4 text-[#1DB954]" />
                              </motion.div>
                            )}
                          </div>
                          <p className="text-sm text-[#9CA3AF]">{testimonial.role}</p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Verified Badge */}
                    {testimonial.verified && (
                      <div className="absolute top-4 right-4">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          viewport={{ once: false }}
                          transition={{ 
                            delay: index * 0.15 + 0.3,
                            type: 'spring',
                            stiffness: 200
                          }}
                          whileHover={{ 
                            scale: 1.3, 
                            rotate: 360,
                            transition: { duration: 0.5 }
                          }}
                          className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center shadow-lg shadow-[#1DB954]/50"
                        >
                          <Check className="w-5 h-5 text-white" />
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Download App Section */}
        <section id="download" className="py-24 sm:py-32 relative overflow-hidden">
          {/* Animated Background */}
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              backgroundImage: 'radial-gradient(circle, #1DB954 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-2 bg-gradient-primary/10 border border-[#1DB954]/30 rounded-full mb-6"
              >
                <span className="text-gradient-primary font-semibold">📱 Get the App</span>
              </motion.div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
                Download TaalMeet
                <br />
                <span className="text-gradient-primary">Available on iOS & Android</span>
              </h2>
              <p className="text-xl text-[#9CA3AF] max-w-3xl mx-auto mb-12">
                Start your language learning journey today. Free forever, with premium features available.
              </p>

              {/* App Store Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
                {/* iOS App Store */}
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative w-full sm:w-auto"
                >
                  <div className="px-8 py-4 bg-white text-black rounded-2xl font-semibold flex items-center gap-4 shadow-2xl hover:shadow-white/20 transition-all">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs opacity-70">Download on the</div>
                      <div className="text-xl font-bold">App Store</div>
                    </div>
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#1DB954] to-[#5FB3B3] rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"
                  />
                </motion.a>

                {/* Google Play Store */}
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative w-full sm:w-auto"
                >
                  <div className="px-8 py-4 bg-white text-black rounded-2xl font-semibold flex items-center gap-4 shadow-2xl hover:shadow-white/20 transition-all">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs opacity-70">GET IT ON</div>
                      <div className="text-xl font-bold">Google Play</div>
                    </div>
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#1DB954] to-[#5FB3B3] rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"
                  />
                </motion.a>
              </div>

              {/* QR Code Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-block"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                  <p className="text-sm text-[#9CA3AF] mb-4">Scan to download</p>
                  <div className="w-40 h-40 bg-white rounded-2xl flex items-center justify-center">
                    <div className="text-center p-4">
                      <Smartphone className="w-12 h-12 mx-auto mb-2 text-[#1DB954]" />
                      <div className="text-xs text-gray-600">QR Code</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* App Preview */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-20 relative"
              >
                <div className="relative max-w-4xl mx-auto">
                  {/* Phone Mockups */}
                  <div className="flex items-end justify-center gap-8">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2 }}
                        whileHover={{ y: -20, scale: 1.05 }}
                        className={`bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-[3rem] border-8 border-white/20 shadow-2xl ${
                          i === 2 ? 'w-64 h-[32rem] hidden sm:block' : i === 1 ? 'w-72 h-[36rem]' : 'w-64 h-[32rem] hidden lg:block'
                        }`}
                        style={{
                          transform: i === 2 ? 'scale(0.9)' : i === 3 ? 'scale(0.9)' : 'scale(1)',
                        }}
                      >
                        <div className="w-full h-full rounded-[2.5rem] bg-[#0A0A0A] overflow-hidden flex items-center justify-center">
                          <TaalMeetLogo size={80} />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Floating Elements */}
                  <motion.div
                    animate={{
                      y: [0, -20, 0],
                      rotate: [0, 5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                    }}
                    className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br from-[#1DB954] to-[#5FB3B3] rounded-2xl shadow-2xl flex items-center justify-center"
                  >
                    <MessageCircle className="w-10 h-10 text-white" />
                  </motion.div>

                  {/* Animated Hello in Different Languages */}
                  <motion.div
                    animate={{
                      y: [0, 20, 0],
                      rotate: [0, -5, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                    }}
                    className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden"
                  >
                    <AnimatedHello />
                  </motion.div>

                  {/* Additional Language Icon */}
                  <motion.div
                    animate={{
                      y: [0, -15, 0],
                      rotate: [0, 10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: 0.5,
                    }}
                    className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-[#F59E0B] to-[#FCD34D] rounded-2xl shadow-2xl flex items-center justify-center"
                  >
                    <Languages className="w-10 h-10 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 sm:py-32 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-[3rem] overflow-hidden"
            >
              {/* Animated Background */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    'linear-gradient(135deg, #1DB954 0%, #5FB3B3 100%)',
                    'linear-gradient(135deg, #5FB3B3 0%, #1ED760 100%)',
                    'linear-gradient(135deg, #1ED760 0%, #1DB954 100%)',
                    'linear-gradient(135deg, #1DB954 0%, #5FB3B3 100%)',
                  ],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                }}
              />

              {/* Content */}
              <div className="relative z-10 p-12 sm:p-16 md:p-20 text-center">
                {/* Floating Icons */}
                {[Globe, Users, Languages, Zap].map((Icon, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: `${20 + i * 15}%`,
                      left: i % 2 === 0 ? '5%' : '90%',
                    }}
                    animate={{
                      y: [0, -20, 0],
                      rotate: [0, 360, 0],
                    }}
                    transition={{
                      duration: 3 + i,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  >
                    <Icon className="w-8 h-8 text-white/20" />
                  </motion.div>
                ))}

                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  <Sparkles className="w-16 h-16 mx-auto mb-6 text-white" />
                </motion.div>

                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
                  Ready to Start Speaking?
                </h2>
                <p className="text-xl sm:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
                  Join 50,000+ learners and find your perfect language partner today
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                  <motion.button
                    onClick={onGetStarted}
                    className="w-full sm:w-auto px-10 py-5 bg-white text-[#1DB954] rounded-2xl font-bold text-lg shadow-2xl"
                    whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      Get Started Free
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </motion.button>

                  <motion.button
                    onClick={onLogin}
                    className="w-full sm:w-auto px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-2xl font-bold text-lg"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Log In
                  </motion.button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/80">
                  {[
                    { icon: Check, text: 'Free forever' },
                    { icon: Shield, text: 'Safe & Verified' },
                    { icon: Zap, text: 'Start in 2 minutes' }
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.text}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.text}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-12 bg-[#0A0A0A]/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TaalMeetLogo size={32} />
                  <span className="text-xl font-bold text-white">TaalMeet</span>
                </div>
                <p className="text-sm text-[#9CA3AF] mb-4">
                  Connect with language learners worldwide for real conversations.
                </p>
                <div className="flex gap-4">
                  {[Globe, MessageCircle, Users].map((Icon, i) => (
                    <motion.a
                      key={i}
                      href="#"
                      whileHover={{ scale: 1.2, y: -2 }}
                      className="w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-[#9CA3AF] hover:text-white hover:border-[#1DB954]/50 transition-all"
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Product */}
              <div>
                <h4 className="font-semibold text-white mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-[#9CA3AF]">
                  {['Features', 'How It Works', 'Premium', 'Pricing'].map((item) => (
                    <li key={item}>
                      <motion.a
                        href="#"
                        whileHover={{ x: 5, color: '#ffffff' }}
                        className="hover:text-white transition-colors inline-block"
                      >
                        {item}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="font-semibold text-white mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-[#9CA3AF]">
                  {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                    <li key={item}>
                      <motion.a
                        href="#"
                        whileHover={{ x: 5, color: '#ffffff' }}
                        className="hover:text-white transition-colors inline-block"
                      >
                        {item}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-semibold text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-[#9CA3AF]">
                  {['Privacy', 'Terms', 'Security', 'Cookies'].map((item) => (
                    <li key={item}>
                      <motion.a
                        href="#"
                        whileHover={{ x: 5, color: '#ffffff' }}
                        className="hover:text-white transition-colors inline-block"
                      >
                        {item}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom */}
            <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-[#9CA3AF]">
                © 2025 TaalMeet. All rights reserved. Made with ❤️ for language learners.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 text-sm text-[#9CA3AF]"
              >
                <Globe className="w-4 h-4" />
                <span>Available in 80+ languages</span>
              </motion.div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
