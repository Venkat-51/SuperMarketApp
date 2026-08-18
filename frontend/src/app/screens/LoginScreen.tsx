import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../lib/api';
import { useCart } from '../context/CartContext';

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUserData } = useCart();

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

  // Google OAuth Initialization
  const handleGoogleCredentialResponse = async (response: any) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await authApi.googleLogin(response.credential);
      if (result.error || !result.data) {
        setError(result.error ?? 'Google Sign-In failed. Please try again.');
        setIsLoading(false);
        return;
      }

      await refreshUserData();

      if (result.data.user.role === 'Admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const from = (location.state as any)?.from || '/home';
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during Google login.');
    } finally {
      setIsLoading(false);
    }
  };

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    const initGsi = () => {
      if (!GOOGLE_CLIENT_ID) return false;
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });
        return true;
      }
      return false;
    };

    if (!initGsi()) {
      const timer = setInterval(() => {
        if (initGsi()) {
          clearInterval(timer);
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, []);

  const handleCustomGoogleClick = () => {
    setError('');
    
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Client ID is missing. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
      return;
    }

    // Check if OAuth2 token client is available for popup window auth
    if (window.google?.accounts?.oauth2) {
      setIsLoading(true);
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setError('Google Sign-In was cancelled or failed.');
              setIsLoading(false);
              return;
            }
            if (tokenResponse.access_token) {
              try {
                // Fetch user info from Google endpoint
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile = await res.json();
                const result = await authApi.googleLogin(JSON.stringify(profile));
                
                if (result.error || !result.data) {
                  setError(result.error ?? 'Google Sign-In failed on backend.');
                  setIsLoading(false);
                  return;
                }

                await refreshUserData();
                if (result.data.user.role === 'Admin') {
                  navigate('/admin/dashboard', { replace: true });
                } else {
                  const from = (location.state as any)?.from || '/home';
                  navigate(from, { replace: true });
                }
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Error completing Google Sign-In.');
              } finally {
                setIsLoading(false);
              }
            }
          },
        });
        client.requestAccessToken();
      } catch (e) {
        setIsLoading(false);
        setError('Failed to launch Google Sign-In popup window.');
      }
    } else if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
      });
      window.google.accounts.id.prompt();
    } else {
      setError('Google Sign-In SDK is loading... Please try clicking in a moment.');
    }
  };

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

        await refreshUserData();

        if (result.data.user.role === 'Admin') {
          navigate('/admin/dashboard', { replace: true });
          return;
        }
      } else {
        const result = await authApi.register(name.trim(), email.trim(), password, phone.trim());
        if (result.error || !result.data) {
          setError(result.error ?? 'Failed to create account.');
          return;
        }

        await refreshUserData();
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

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-3 text-gray-400 text-xs font-semibold">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleCustomGoogleClick}
            disabled={isLoading}
            className="w-full h-12 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold flex items-center justify-center gap-3 transition-all shadow-xs"
          >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>
      </div>

      {/* ── Footer ── */}
      <div className="p-6 text-center text-xs text-gray-400">
        By continuing, you agree to our Terms of Service &amp; Privacy Policy
      </div>
    </div>
  );
}
