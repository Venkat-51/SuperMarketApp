import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  User, MapPin, ShoppingBag, Heart, Bell, HelpCircle,
  Shield, LogOut, ChevronRight, Star, Package, Pencil, ArrowRight
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import BottomNav from '../components/BottomNav';
import { useCart } from '../context/CartContext';
import { authApi, ordersApi, wishlistApi, reviewsApi, type ApiUser } from '../../lib/api';

const menuSections = [
  {
    title: 'My Activity',
    items: [
      { id: 'orders',    icon: ShoppingBag, label: 'My Orders',       desc: 'Track & view past orders',   color: '#FF9933' },
      { id: 'wishlist',  icon: Heart,       label: 'Wishlist',         desc: 'Items saved for later',      color: '#e91e63' },
      { id: 'addresses', icon: MapPin,      label: 'Saved Addresses',  desc: 'Manage delivery addresses',  color: '#2196F3' },
    ],
  },
  {
    title: 'Settings & Support',
    items: [
      { id: 'notifications', icon: Bell,      label: 'Notifications',   desc: 'Manage alerts & offers',   color: '#9C27B0' },
      { id: 'privacy',       icon: Shield,    label: 'Privacy & Security', desc: 'Account protection',   color: '#4CAF50' },
      { id: 'help',          icon: HelpCircle, label: 'Help & Support',  desc: 'FAQs & contact us',       color: '#FF5722' },
    ],
  },
];

export default function AccountScreen() {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useCart();
  const [user, setUser] = useState<ApiUser>({
    id: 0,
    name: 'Customer',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: '/account' } });
    }
  }, [isAuthenticated, navigate]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [ordersCount, setOrdersCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    authApi.me().then((result) => {
      if (!isMounted || !result.data) return;
      setUser(result.data);
      setProfileName(result.data.name);
      setProfileEmail(result.data.email ?? '');
    });

    ordersApi.list().then((result) => {
      if (!isMounted || !result.data) return;
      setOrdersCount(result.data.length);
    });

    wishlistApi.get().then((result) => {
      if (!isMounted || !result.data) return;
      setWishlistCount(result.data.length);
    });

    reviewsApi.getForUser().then((result) => {
      if (!isMounted || !result.data) return;
      setReviewsCount(result.data.length);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const openEditProfile = () => {
    setProfileName(user.name);
    setProfileEmail(user.email ?? '');
    setProfileError('');
    setIsEditOpen(true);
  };

  const saveProfile = async () => {
    const trimmedName = profileName.trim();
    const trimmedEmail = profileEmail.trim();

    if (trimmedName.length < 2) {
      setProfileError('Enter a name with at least 2 characters.');
      return;
    }

    setIsSaving(true);
    setProfileError('');

    try {
      const result = await authApi.updateProfile({
        name: trimmedName,
        email: trimmedEmail || undefined,
      });

      if (result.error || !result.data) {
        setProfileError(result.error ?? 'Unable to update profile.');
        return;
      }

      setUser(result.data);
      setIsEditOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-16">
      
      {/* Mobile Top Header Banner (Hidden on Desktop) */}
      <div
        className="px-4 pt-10 pb-6 lg:hidden"
        style={{ background: 'linear-gradient(135deg, #FF9933 0%, #e07b00 100%)' }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{user.name}</h1>
            <p className="text-orange-100 text-sm truncate">
              {user.email || (user.phone ? `+91 ${user.phone}` : 'Add your profile details')}
            </p>
          </div>
          <button
            type="button"
            onClick={openEditProfile}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Edit profile"
          >
            <Pencil className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { label: 'Orders',  value: ordersCount.toString(),   icon: Package },
            { label: 'Wishlist', value: wishlistCount.toString(),   icon: Heart },
            { label: 'Reviews', value: reviewsCount.toString(), icon: Star },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white/20 rounded-xl p-3 text-center"
            >
              <p className="text-white font-bold text-lg">{value}</p>
              <p className="text-orange-100 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-6 lg:max-w-7xl lg:mx-auto lg:px-6 lg:py-8">
        
        {/* Desktop Title Header */}
        <div className="hidden lg:flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <User className="w-6 h-6 text-orange-500" />
              <span>Account & Profile</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your account settings, orders, saved addresses, and wishlist</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>

        {/* Desktop Layout Grid */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          
          {/* Desktop Left Sidebar Profile Summary Card */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs sticky top-36">
              <div className="text-center pb-6 border-b border-gray-100">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 text-white flex items-center justify-center mx-auto mb-4 shadow-md">
                  <User className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900">{user.name}</h2>
                <p className="text-xs text-gray-500 mt-1">{user.email || (user.phone ? `+91 ${user.phone}` : 'Customer')}</p>
                <Button
                  onClick={openEditProfile}
                  variant="outline"
                  className="mt-4 text-xs font-bold text-orange-600 border-orange-200 hover:bg-orange-50 h-9 rounded-xl flex items-center gap-1.5 mx-auto"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 py-6 border-b border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-black text-gray-900">{ordersCount}</p>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Orders</p>
                </div>
                <div className="text-center border-x border-gray-100">
                  <p className="text-lg font-black text-gray-900">{wishlistCount}</p>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Saved</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-gray-900">{reviewsCount}</p>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Reviews</p>
                </div>
              </div>

              <div className="pt-4 text-xs text-gray-400 space-y-2">
                <p className="flex items-center justify-between">
                  <span>Account Status</span>
                  <span className="font-bold text-green-600">Active</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>SuperMarket Member</span>
                  <span className="font-bold text-orange-600">Verified</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Menu Sections & Actions */}
          <div className="lg:col-span-8 space-y-6">
            {menuSections.map((section) => (
              <div key={section.title}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">
                  {section.title}
                </p>
                <Card className="rounded-2xl border border-gray-100 lg:border-gray-200/80 overflow-hidden divide-y divide-gray-100 bg-white shadow-xs">
                  {section.items.map(({ id, icon: Icon, label, desc, color }) => (
                    <button
                      key={id}
                      onClick={() => {
                        if (id === 'orders') navigate('/orders');
                        else if (id === 'wishlist') navigate('/wishlist');
                        else if (id === 'addresses') navigate('/addresses');
                        else if (id === 'notifications') navigate('/notifications');
                      }}
                      className="w-full flex items-center gap-4 px-5 py-4 bg-white hover:bg-orange-50/50 transition-colors text-left group"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: color + '15' }}
                      >
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm mb-0.5 group-hover:text-orange-600 transition-colors">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </Card>
              </div>
            ))}

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-white hover:bg-rose-50 rounded-2xl border border-gray-200/80 text-rose-600 font-bold text-sm transition-colors lg:hidden"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>

        </div>

      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your name and email address for order notifications.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <Input
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Enter your name"
                className="h-11 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <Input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-11 rounded-xl"
              />
            </div>

            {profileError && (
              <p className="text-xs font-medium text-rose-600">{profileError}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="rounded-xl h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={saveProfile}
              disabled={isSaving}
              className="rounded-xl h-11 bg-orange-500 hover:bg-orange-600 text-white font-bold"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
