import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { ArrowLeft, Mail } from 'lucide-react';
import { authApi } from '../../lib/api';

const RESEND_COOLDOWN = 60;

export default function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [error, setError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const startCountdown = () => {
    setCountdown(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGetOTP = async () => {
    if (!isValidEmail) return;
    setError('');
    setOtpSuccess(false);
    setIsSendingOtp(true);
    try {
      const result = await authApi.sendOtp(email);
      if (result.error) { setError(result.error); return; }
      setIsOtpSent(true);
      setOtp('');
      setOtpSuccess(true);
      startCountdown();
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!isValidEmail || otp.length !== 6) return;
    setError('');
    setOtpSuccess(false);
    setIsVerifyingOtp(true);
    try {
      const result = await authApi.verifyOtp(email, otp);
      if (result.error) { setError(result.error); return; }
      navigate('/home');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      <div className="p-4">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to</h1>
          <h2 className="text-3xl font-bold" style={{ color: '#FF9933' }}>
            Super Market App
          </h2>
          <p className="text-gray-600 mt-3">
            Enter your email address to get started
          </p>
        </div>

        <div className="space-y-4">
          {/* Email input */}
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <div className="flex gap-2">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <Mail className="w-5 h-5 text-gray-500" />
              </div>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                className="flex-1 h-12 bg-gray-100 border-gray-200 rounded-lg"
                disabled={isOtpSent}
              />
            </div>
          </div>

          {/* Step 1 — Send OTP */}
          {!isOtpSent ? (
            <Button
              onClick={handleGetOTP}
              disabled={!isValidEmail || isSendingOtp}
              className="w-full h-12 rounded-lg mt-6"
              style={{ backgroundColor: '#FF9933' }}
            >
              {isSendingOtp ? 'Sending OTP...' : 'Get OTP'}
            </Button>
          ) : (
            /* Step 2 — Enter & verify OTP */
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium mb-2">Enter OTP</label>
                <p className="text-xs text-gray-500 mb-3">
                  Check your inbox at <strong>{email}</strong>
                </p>
                <InputOTP
                  value={otp}
                  onChange={setOtp}
                  maxLength={6}
                  containerClassName="justify-start"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleGetOTP}
                  disabled={isSendingOtp || countdown > 0}
                  className="h-12 rounded-lg flex-1"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </Button>
                <Button
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6 || isVerifyingOtp}
                  className="h-12 rounded-lg flex-1"
                  style={{ backgroundColor: '#FF9933' }}
                >
                  {isVerifyingOtp ? 'Verifying...' : 'Verify & Login'}
                </Button>
              </div>

              {otpSuccess && (
                <p className="text-sm font-medium text-green-600">
                  ✓ OTP sent successfully. Check your email!
                </p>
              )}
            </div>
          )}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
