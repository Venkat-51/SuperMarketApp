import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../lib/api';

export default function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'register' && name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const result = await authApi.login(email.trim(), password);
        if (result.error || !result.data) {
          setError(result.error ?? 'Failed to log in. Please check your credentials.');
          return;
        }
      } else {
        const result = await authApi.register(name.trim(), email.trim(), password, phone.trim());
        if (result.error || !result.data) {
          setError(result.error ?? 'Failed to create account.');
          return;
        }
      }

      const from = (location.state as any)?.from || '/home';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* ── Top Bar ── */}
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* ── Main Container ── */}
      <div className="flex-1 flex flex-col justify-center px-6 max-w-md w-full mx-auto pb-10">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome to
          </h1>
          <h2 className="text-3xl font-extrabold" style={{ color: '#FF9933' }}>
            Super Market App
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            {mode === 'login'
              ? 'Sign in with your email and password'
              : 'Create a new account to start shopping'}
          </p>
        </div>

        {/* ── Mode Toggle Tabs ── */}
        <div className="bg-gray-200 p-1 rounded-xl flex mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* ── Auth Form ── */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl text-sm"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-gray-400" />
              </div>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl text-sm"
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 rounded-xl text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              ⚠️ {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl text-sm font-bold mt-2 text-white shadow-md transition-all"
            style={{
              backgroundColor: '#FF9933',
              boxShadow: '0 4px 14px rgba(255, 153, 51, 0.4)',
            }}
          >
            {isLoading
              ? mode === 'login' ? 'Signing In...' : 'Creating Account...'
              : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </div>

      {/* ── Footer ── */}
      <div className="p-6 text-center text-xs text-gray-400">
        By continuing, you agree to our Terms of Service &amp; Privacy Policy
      </div>
    </div>
  );
}
