import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft } from 'lucide-react';

export default function LoginScreen() {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');

  const handleGetOTP = () => {
    if (mobileNumber.length === 10) {
      // Simulate OTP sent - directly navigate to home
      navigate('/home');
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

          <Button
            onClick={handleGetOTP}
            disabled={mobileNumber.length !== 10}
            className="w-full h-12 rounded-lg mt-6"
            style={{ backgroundColor: '#FF9933' }}
          >
            Get OTP
          </Button>
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
