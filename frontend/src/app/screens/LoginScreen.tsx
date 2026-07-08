import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { ArrowLeft } from 'lucide-react';
import { authApi } from '../../lib/api';

export default function LoginScreen() {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const handleGetOTP = async () => {
    if (mobileNumber.length !== 10) return;

    setError('');
    setIsSendingOtp(true);
    try {
      const result = await authApi.sendOtp(mobileNumber);
      if (result.error) {
        setError(result.error);
        return;
      }

      setIsOtpSent(true);
      setOtp('');
      setDevOtp(result.data?.otp ?? '');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (mobileNumber.length !== 10 || otp.length !== 6) return;

    setError('');
    setIsVerifyingOtp(true);
    try {
      const result = await authApi.verifyOtp(mobileNumber, otp);
      if (result.error) {
        setError(result.error);
        return;
      }

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
            Shree Sai Mega Mart
          </h2>
          <p className="text-gray-600 mt-3">
            Enter your mobile number to get started
          </p>
        </div>

        <div className="space-y-4">
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
              />
            </div>
          </div>

          {!isOtpSent ? (
            <Button
              onClick={handleGetOTP}
              disabled={mobileNumber.length !== 10 || isSendingOtp}
              className="w-full h-12 rounded-lg mt-6"
              style={{ backgroundColor: '#FF9933' }}
            >
              {isSendingOtp ? 'Sending OTP...' : 'Get OTP'}
            </Button>
          ) : (
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
                <Button
                  variant="outline"
                  onClick={handleGetOTP}
                  disabled={isSendingOtp}
                  className="h-12 rounded-lg flex-1"
                >
                  Resend OTP
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

              {devOtp ? (
                <p className="text-xs text-gray-500">
                  Development OTP for this number: {devOtp}
                </p>
              ) : null}
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
