import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { TaalMeetLogo } from '../components/TaalMeetLogo';

interface LoginScreenProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function LoginScreen({ onLogin, onSignup }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F] overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        {/* Logo & Title */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <TaalMeetLogo size={80} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to TaalMeet
          </h1>
          <p className="text-[#9CA3AF]">
            Meet. Speak. Connect.
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-4 mb-6 animate-slide-up"
          style={{ animationDelay: '0.1s' }}
        >
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full pl-12 pr-4 py-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#1DB954] transition-colors"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#1DB954] transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-[#5FB3B3] hover:text-[#4A9999] transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-primary text-white rounded-xl font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Logging in...</span>
              </div>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex-1 h-px bg-[#2A2A2A]" />
          <span className="text-sm text-[#9CA3AF]">or continue with</span>
          <div className="flex-1 h-px bg-[#2A2A2A]" />
        </div>

        {/* Social Login */}
        <div className="space-y-3 mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <button
            type="button"
            onClick={onLogin}
            className="w-full py-4 bg-white text-[#0F0F0F] rounded-xl font-medium flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={onLogin}
            className="w-full py-4 bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-xl font-medium flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-[#9CA3AF]">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSignup}
              className="text-[#1DB954] font-semibold hover:text-[#1ED760] transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}