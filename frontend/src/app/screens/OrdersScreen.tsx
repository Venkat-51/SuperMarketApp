import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Package, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ── Header ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '8px',
            marginLeft: -8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            borderRadius: 8,
            display: 'flex',
          }}
        >
          <ArrowLeft size={22} />
        </button>
        <h2 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>My Orders</h2>
      </div>

      <div className="px-4 pt-4">
        {loading && <p className="text-sm text-gray-500">Loading orders...</p>}

        {!loading && (orders?.length === 0 || error) && (
          <Card className="p-6 text-center rounded-2xl border border-gray-100 bg-white">
            <div className="w-14 h-14 mx-auto rounded-full bg-orange-50 flex items-center justify-center mb-3">
              <Package className="w-7 h-7 text-orange-500" />
            </div>
            <p className="font-semibold text-gray-900">
              {error ? 'Please log in to view your orders' : 'No orders found'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {error ? 'Log in with your email & OTP to see past order history.' : 'Your placed orders will appear here.'}
            </p>
            <Button
              onClick={() => navigate(error ? '/login' : '/home', { state: error ? { from: '/orders' } : undefined })}
              className="mt-4 rounded-lg"
              style={{ backgroundColor: '#FF9933' }}
            >
              {error ? 'Log In / Register' : 'Start Shopping'}
            </Button>
          </Card>
        )}

        <div className="space-y-3 mt-3">
          {orders?.map((o) => (
            <Card key={o.id} className="p-3">
              <button
                onClick={() => navigate(`/orders/${o.id}`)}
                className="w-full text-left flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Package className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order #{o.id}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(o.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{o.total.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{o.status}</p>
                </div>
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
