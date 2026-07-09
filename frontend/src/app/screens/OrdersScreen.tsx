import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Package, Clock, Tag } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 pb-20 px-4 pt-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">My Orders</h2>

      {loading && <p className="text-sm text-gray-500">Loading orders...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        {orders && orders.length === 0 && (
          <Card className="p-4 text-center">No orders found.</Card>
        )}

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
  );
}
