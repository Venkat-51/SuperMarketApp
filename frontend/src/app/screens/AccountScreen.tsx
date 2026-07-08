import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  User, MapPin, ShoppingBag, Heart, Bell, HelpCircle,
  Shield, LogOut, ChevronRight, Star, Package, Pencil,
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
import { authApi, type ApiUser } from '../../lib/api';

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
    title: 'Settings',
    items: [
      { id: 'notifications', icon: Bell,      label: 'Notifications',   desc: 'Manage alerts & offers',   color: '#9C27B0' },
      { id: 'privacy',       icon: Shield,    label: 'Privacy & Security', desc: 'Account protection',   color: '#4CAF50' },
      { id: 'help',          icon: HelpCircle, label: 'Help & Support',  desc: 'FAQs & contact us',       color: '#FF5722' },
    ],
  },
];

export default function AccountScreen() {
  const navigate = useNavigate();
  const [user, setUser] = useState<ApiUser>({
    id: 0,
    name: 'Customer',
    phone: '',
    email: '',
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    let isMounted = true;

    authApi.me().then((result) => {
      if (!isMounted || !result.data) return;
      setUser(result.data);
      setProfileName(result.data.name);
      setProfileEmail(result.data.email ?? '');
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
    authApi.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div
        className="px-4 pt-10 pb-6"
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
            { label: 'Orders',  value: '12',   icon: Package },
            { label: 'Wishlist', value: '5',   icon: Heart },
            { label: 'Reviews', value: '4.8/5', icon: Star },
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

      <div className="px-4 pt-4 space-y-4">
        {menuSections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
              {section.title}
            </p>
            <Card className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
              {section.items.map(({ id, icon: Icon, label, desc, color }) => (
                <button
                  key={id}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors text-left"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: color + '18' }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </button>
              ))}
            </Card>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-red-100 hover:bg-red-50 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <LogOut className="w-5 h-5 text-red-500" />
          </div>
          <p className="font-medium text-red-500 text-sm">Log Out</p>
        </button>

        <p className="text-center text-xs text-gray-400 pb-2">
          SuperMarket App - v1.0.0
        </p>
      </div>

      <BottomNav />

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Update the name and email shown on your account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full name
              </label>
              <Input
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                placeholder="Enter your name"
                className="h-11 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <Input
                type="email"
                value={profileEmail}
                onChange={(event) => setProfileEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-11 rounded-lg"
              />
            </div>

            {profileError ? (
              <p className="text-sm text-red-600">{profileError}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={saveProfile}
              disabled={isSaving}
              style={{ backgroundColor: '#FF9933' }}
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
