import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export default function OnboardingScreen() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpdmVyeSUyMHBhY2thZ2UlMjBjb3VyaWVyfGVufDF8fHx8MTc4MjIzNzc2MXww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Fresh groceries delivery"
              className="w-full h-64 object-cover rounded-2xl"
            />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: '#FF9933' }}>
            Fresh Groceries, Fast Delivery
          </h2>
          <p className="text-gray-600 mb-2">
            Get farm-fresh vegetables, daily essentials, and more delivered to your doorstep.
          </p>
          <p className="text-sm text-gray-500">
            Order now and enjoy quality products at great prices!
          </p>
        </div>
      </div>

      <div className="p-6 pb-8">
        <Button
          onClick={() => navigate('/login')}
          className="w-full rounded-lg h-12"
          style={{ backgroundColor: '#FF9933' }}
        >
          Get Started
        </Button>
        <p className="text-center text-sm text-gray-500 mt-4">
          Join thousands of happy customers
        </p>
      </div>
    </div>
  );
}
