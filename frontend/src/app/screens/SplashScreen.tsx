import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen flex items-center justify-center" style={{ backgroundColor: '#FF9933' }}>
      <div className="text-center">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg">
            <span className="text-5xl">🛒</span>
          </div>
        </div>
        <h1 className="text-white text-3xl font-bold mb-2">Super Market App</h1>
        <p className="text-white/90 mt-4 text-sm">Your Daily Grocery Partner</p>
      </div>
    </div>
  );
}
