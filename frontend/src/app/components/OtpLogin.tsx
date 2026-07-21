import { FormEvent, useEffect, useRef, useState, useTransition } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/firebase';
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';

const RESEND_COOLDOWN = 60; // seconds

export default function OtpLogin() {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [countdown, setCountdown] = useState(0);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Set up invisible reCAPTCHA once on mount
  useEffect(() => {
    recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });
    return () => {
      recaptchaRef.current?.clear();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Start 60-second countdown
  const startCountdown = () => {
    setCountdown(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGetOTP = (e?: FormEvent) => {
    e?.preventDefault();
    if (mobileNumber.length !== 10) return;

    setError('');
    setOtpSuccess(false);
    startTransition(async () => {
      try {
        const phoneWithCode = `+91${mobileNumber}`;
        const result = await signInWithPhoneNumber(
          auth,
          phoneWithCode,
          recaptchaRef.current!
        );
        setConfirmation(result);
        setOtp('');
        setOtpSuccess(true);
        startCountdown();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to send OTP.');
      }
    });
  };

  const handleVerifyOTP = (e?: FormEvent) => {
    e?.preventDefault();
    if (!confirmation || otp.length !== 6) return;

    setError('');
    setOtpSuccess(false);
    startTransition(async () => {
      try {
        await confirmation.confirm(otp);
        navigate('/home');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
      }
    });
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Invisible reCAPTCHA anchor — must be in the DOM */}
      <div id="recaptcha-container" />

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
            Enter your mobile number to get started
          </p>
        </div>

        <div className="space-y-4">
          {/* Phone number row */}
          <div>
            <label className="block text-sm font-medium mb-2">Mobile Number</label>
            <div className="flex gap-2">
              <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <span className="font-medium">+91</span>
              </div>
              <Input
                type="tel"
                placeholder="Enter 10-digit number"
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                className="flex-1 h-12 bg-gray-100 border-gray-200 rounded-lg"
                disabled={!!confirmation}
              />
            </div>
          </div>

          {/* Step 1: Send OTP */}
          {!confirmation ? (
            <Button
              onClick={handleGetOTP}
              disabled={mobileNumber.length !== 10 || isPending}
              className="w-full h-12 rounded-lg mt-6"
              style={{ backgroundColor: '#FF9933' }}
            >
              {isPending ? 'Sending OTP...' : 'Get OTP'}
            </Button>
          ) : (
            /* Step 2: Enter & verify OTP */
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium mb-2">Enter OTP</label>
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
                {/* Resend button — disabled while countdown is running */}
                <Button
                  variant="outline"
                  onClick={handleGetOTP}
                  disabled={isPending || countdown > 0}
                  className="h-12 rounded-lg flex-1"
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}` : 'Resend OTP'}
                </Button>
                <Button
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6 || isPending}
                  className="h-12 rounded-lg flex-1"
                  style={{ backgroundColor: '#FF9933' }}
                >
                  {isPending ? 'Verifying...' : 'Verify & Login'}
                </Button>
              </div>

              {/* OTP sent success message */}
              {otpSuccess && (
                <p className="text-sm font-medium" style={{ color: '#22c55e' }}>
                  ✓ OTP sent successfully.
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