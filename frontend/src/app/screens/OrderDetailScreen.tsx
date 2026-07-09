import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ordersApi, ApiOrder } from '../../lib/api';

export default function OrderDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    const orderId = Number(id);
    ordersApi.get(orderId).then((res) => {
      if (!mounted) return;
      if (res.error) setError(res.error);
      else setOrder(res.data ?? null);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="p-4">Loading order...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!order) return <div className="p-4">Order not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Order #{order.id}</h2>
        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <Card className="p-4 mb-3">
        <p className="text-sm text-gray-500">Placed: {new Date(order.createdAt).toLocaleString()}</p>
        <p className="mt-2 font-medium">Status: <span className="font-semibold">{order.status}</span></p>
        <p className="mt-2">Payment: {order.paymentMethod}{order.paymentId ? ` · ${order.paymentId}` : ''}</p>
      </Card>

      <Card className="p-4 mb-3">
        <h3 className="font-medium mb-2">Delivery Address</h3>
        {order.address ? (
          <div className="text-sm text-gray-700">
            <div className="font-medium">{order.address.label}</div>
            <div>{order.address.line1}</div>
            <div>{order.address.city}, {order.address.state} · {order.address.pincode}</div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No address available</p>
        )}
      </Card>

      <Card className="p-4 mb-3">
        <h3 className="font-medium mb-2">Items</h3>
        <div className="space-y-3">
          {order.items.map((it) => (
            <div key={it.productId} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{it.productName}</div>
                <div className="text-xs text-gray-500">{it.weight} · Qty {it.quantity}</div>
              </div>
              <div className="text-right">
                <div>₹{(it.price * it.quantity).toFixed(2)}</div>
                <div className="text-xs text-gray-500">₹{it.price.toFixed(2)} each</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Subtotal</div>
          <div className="font-medium">₹{order.total.toFixed(2)}</div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm text-gray-600">Delivery</div>
          <div className="font-medium">₹{order.deliveryFee.toFixed(2)}</div>
        </div>
        <div className="flex items-center justify-between mt-3 border-t pt-3">
          <div className="text-sm text-gray-700">Total</div>
          <div className="font-semibold">₹{(order.total + order.deliveryFee).toFixed(2)}</div>
        </div>
      </Card>

      <div className="space-y-3">
        <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
      </div>
    </div>
  );
}
