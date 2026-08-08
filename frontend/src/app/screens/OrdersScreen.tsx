import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Package, ArrowLeft, ChevronRight, Clock, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ordersApi, ApiOrder } from '../../lib/api';

export default function OrdersScreen() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ApiOrder[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    ordersApi.list().then((res) => {
      if (!mounted) return;
      if (res.error) setError(res.error);
      else setOrders(res.data ?? []);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-16">
      {/* Mobile Sticky Header (Hidden on Desktop) */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 lg:hidden">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-700"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="font-bold text-lg text-gray-900">My Orders</h2>
      </div>

      <div className="px-4 pt-4 lg:max-w-7xl lg:mx-auto lg:px-6 lg:py-8">
        
        {/* Desktop Title Header */}
        <div className="hidden lg:flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-orange-500" />
              <span>Order History</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">View details, track delivery status, and re-order past items</p>
          </div>
          <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3.5 py-1.5 rounded-full">
            {orders?.length ?? 0} Orders Placed
          </span>
        </div>

        {loading && (
          <div className="p-8 text-center text-gray-500 text-sm font-semibold">
            Loading your order history...
          </div>
        )}

        {!loading && (orders?.length === 0 || error) && (
          <Card className="p-8 text-center rounded-2xl border border-gray-200/80 bg-white shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4">
              <Package className="w-8 h-8" />
            </div>
            <p className="font-bold text-gray-900 text-lg">
              {error ? 'Please log in to view your orders' : 'No orders placed yet'}
            </p>
            <p className="text-sm text-gray-500 mt-1.5">
              {error ? 'Log in with your email & OTP to view past order history.' : 'Your placed grocery orders will appear here for easy tracking.'}
            </p>
            <Button
              onClick={() => navigate(error ? '/login' : '/home', { state: error ? { from: '/orders' } : undefined })}
              className="mt-6 rounded-xl h-11 px-6 font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md"
            >
              {error ? 'Log In / Register' : 'Start Shopping Now'}
            </Button>
          </Card>
        )}

        {orders && orders.length > 0 && (
          <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-5">
            {orders.map((o) => (
              <Card
                key={o.id}
                className="p-4 lg:p-5 rounded-2xl border border-gray-100 lg:border-gray-200/80 bg-white hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => navigate(`/orders/${o.id}`)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base group-hover:text-orange-600 transition-colors">
                        Order #{o.id}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(o.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-gray-900 text-base lg:text-lg">₹{o.total.toFixed(2)}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{o.status}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-orange-600 font-bold">
                  <span>View Order Summary & Invoice</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
