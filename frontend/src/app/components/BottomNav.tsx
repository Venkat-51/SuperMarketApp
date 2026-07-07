import { useNavigate, useLocation } from 'react-router';
import { Home, Grid3x3, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartCount } = useCart();

  const navItems = [
    { id: 'home',       label: 'Home',       icon: Home,         path: '/home' },
    { id: 'categories', label: 'Categories', icon: Grid3x3,      path: '/categories' },
    { id: 'cart',       label: 'Cart',       icon: ShoppingCart, path: '/cart' },
    { id: 'account',    label: 'Account',    icon: User,         path: '/account' },
  ];

  const cartCount = getCartCount();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 safe-area-inset-bottom">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/home'
              ? location.pathname === '/home' || location.pathname.startsWith('/product')
              : location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center p-2 min-w-[60px] relative"
            >
              <div className="relative">
                <Icon
                  className="w-6 h-6"
                  style={{ color: isActive ? '#FF9933' : '#9CA3AF' }}
                />
                {item.id === 'cart' && cartCount > 0 && (
                  <span
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                    style={{ backgroundColor: '#FF9933' }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
              <span
                className="text-xs mt-1"
                style={{ color: isActive ? '#FF9933' : '#9CA3AF' }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
