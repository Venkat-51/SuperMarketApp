import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, Bell, Tag, ShoppingBag, Truck, Sparkles, Check, Copy, ChevronRight, CheckCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

export interface NotificationItem {
  id: string;
  type: 'offer' | 'order' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
  code?: string;
  discountBadge?: string;
  category?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    type: 'offer',
    title: '🔥 Super Weekend Sale - Up to 40% OFF!',
    message: 'Stock up on kitchen essentials with up to 40% discount on Aashirvaad Atta, Ghee, and Fortune Oils.',
    time: '10 mins ago',
    read: false,
    discountBadge: '40% OFF',
    category: 'Staples',
  },
  {
    id: 'n2',
    type: 'offer',
    title: '⚡ Fresh Dairy Flash Coupon',
    message: 'Get instant 20% OFF on all Amul & Mother Dairy milk, butter, and paneer products. Use code FRESH20.',
    time: '1 hour ago',
    read: false,
    code: 'FRESH20',
    discountBadge: '20% OFF',
    category: 'Dairy & Breakfast',
  },
  {
    id: 'n3',
    type: 'offer',
    title: '🎁 Welcome Discount - Flat ₹100 OFF',
    message: 'Enjoy flat ₹100 instant discount on your order above ₹499. Apply coupon code WELCOME100 at checkout.',
    time: '5 hours ago',
    read: false,
    code: 'WELCOME100',
    discountBadge: '₹100 OFF',
  },
  {
    id: 'n4',
    type: 'info',
    title: '🚀 15-Minute Express Delivery Live',
    message: 'SuperFast delivery is now active in your area! Receive fresh groceries right at your doorstep in 10 to 15 minutes.',
    time: '1 day ago',
    read: true,
  },
  {
    id: 'n5',
    type: 'order',
    title: '📦 Order Status Updated',
    message: 'Your recent order #ORD-9842 has been delivered successfully. Thank you for shopping with SuperMarket!',
    time: '2 days ago',
    read: true,
  },
];

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'offer' | 'order'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'offer':
        return <Tag className="w-5 h-5 text-orange-500" />;
      case 'order':
        return <ShoppingBag className="w-5 h-5 text-emerald-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  const getBgColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'offer':
        return 'bg-orange-50/80 border-orange-100';
      case 'order':
        return 'bg-emerald-50/80 border-emerald-100';
      default:
        return 'bg-amber-50/80 border-amber-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-12">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between lg:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-700">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-gray-900 text-lg">Notifications & Offers</h1>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Read all</span>
          </button>
        )}
      </div>

      {/* Desktop Breadcrumbs */}
      <div className="hidden lg:block bg-white border-b border-gray-200 py-3 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Link to="/home" className="hover:text-orange-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-bold">Notifications & Offers</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Desktop Title & Header */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Notifications & Special Offers</h1>
                <p className="text-xs text-gray-500 mt-0.5">Stay updated with latest discounts, flash sales & order status</p>
              </div>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              variant="outline"
              className="text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4 text-orange-500" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              filter === 'all'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>All Alerts</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {notifications.length}
            </span>
          </button>

          <button
            onClick={() => setFilter('offer')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              filter === 'offer'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Offers & Deals</span>
          </button>

          <button
            onClick={() => setFilter('order')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              filter === 'order'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Order Updates</span>
          </button>
        </div>

        {/* Notification List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No notifications found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
              You're all caught up! Check back soon for new discounts and promotions.
            </p>
            <Button
              onClick={() => navigate('/home')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl"
            >
              Explore Products
            </Button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 lg:p-5 rounded-2xl border transition-all bg-white hover:shadow-md relative overflow-hidden ${
                  !n.read ? 'border-orange-200 ring-1 ring-orange-100 shadow-xs' : 'border-gray-200/80'
                }`}
              >
                {!n.read && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-orange-500 rounded-bl-lg" />
                )}

                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${getBgColor(n.type)}`}>
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-sm leading-snug">{n.title}</h3>
                        {n.discountBadge && (
                          <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2 py-0.5">
                            {n.discountBadge}
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap flex-shrink-0">{n.time}</span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed mb-3">{n.message}</p>

                    {/* Action Bar inside Notification Card */}
                    <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-gray-100/80">
                      {n.code && (
                        <button
                          onClick={() => handleCopyCode(n.code!)}
                          className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 flex items-center gap-1.5 transition-colors"
                        >
                          {copiedCode === n.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCode === n.code ? 'Copied!' : `Code: ${n.code}`}</span>
                        </button>
                      )}

                      <Button
                        onClick={() => {
                          if (n.category) {
                            navigate(`/home?category=${encodeURIComponent(n.category)}`);
                          } else {
                            navigate('/home');
                          }
                        }}
                        className="h-8 px-4 text-xs font-bold bg-gray-900 hover:bg-black text-white rounded-lg flex items-center gap-1"
                      >
                        <span>Shop Now</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
