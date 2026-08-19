import { useNavigate, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CheckCircle2, Package, Download } from 'lucide-react';
import { authApi, ordersApi, ApiOrder } from '../../lib/api';
import { generateInvoicePDF } from '../../lib/invoiceGenerator';

interface LocationState {
  paymentMethod?: 'cod' | 'online';
  subMethod?: 'upi' | 'card' | 'netbanking';
  paymentId?: string;
  orderId?: number;
}

const PAYMENT_LABELS: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  cod:        { icon: '💵', label: 'Cash on Delivery', color: '#92400e', bg: '#fef3c7' },
  upi:        { icon: '📱', label: 'UPI Payment',       color: '#1e40af', bg: '#dbeafe' },
  card:       { icon: '💳', label: 'Card Payment',      color: '#065f46', bg: '#d1fae5' },
  netbanking: { icon: '🏦', label: 'Net Banking',       color: '#4c1d95', bg: '#ede9fe' },
};

export default function OrderSuccessScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [meChecked, setMeChecked] = useState(false);
  const [order, setOrder] = useState<ApiOrder | null>(null);

  const paymentKey =
    state.paymentMethod === 'online' && state.subMethod
      ? state.subMethod
      : state.paymentMethod === 'cod'
      ? 'cod'
      : 'cod';

  const paymentInfo = PAYMENT_LABELS[paymentKey];
  const orderDisplayId = state.orderId ? state.orderId : (order?.id ?? 'ORD-' + Date.now().toString(36).toUpperCase());

  useEffect(() => {
    (async () => {
      const res = await authApi.me();
      if (!res.error && res.data) {
        setName(res.data.name || '');
        setPhone(res.data.phone || '');
        if (!res.data.name || res.data.name.trim() === '') {
          setShowNamePrompt(true);
        }
      }
      setMeChecked(true);
    })();

    if (state.orderId) {
      ordersApi.get(state.orderId).then((res) => {
        if (!res.error && res.data) {
          setOrder(res.data);
        }
      });
    }
  }, [state.orderId]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #fff7f0 0%, #f0fdf4 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div className="w-full max-w-xl mx-auto text-center">

        {/* ── Animated success icon ── */}
        <div
          style={{
            width: 110, height: 110, borderRadius: '50%',
            background: 'radial-gradient(circle, #dcfce7 40%, #bbf7d0 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 30px rgba(34,197,94,0.25)',
            animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <CheckCircle2 size={64} color="#16a34a" strokeWidth={1.8} />
        </div>

        <style>{`
          @keyframes popIn {
            0%   { transform: scale(0.3); opacity: 0; }
            100% { transform: scale(1);   opacity: 1; }
          }
        `}</style>

        <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2">
          Order Placed! 🎉
        </h1>
        <p className="text-sm lg:text-base text-gray-500 mb-1">
          Thank you for shopping with
        </p>
        <p className="text-base lg:text-lg font-bold text-orange-500 mb-6">
          Super Market App
        </p>

        {/* ── Order Info Card ── */}
        <div
          className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 text-left"
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <div
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: '#FFF5EB', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Package size={22} color="#FF9933" />
            </div>
            <div>
              <p className="font-bold text-base text-gray-900 mb-0.5">Order ID: #{orderDisplayId}</p>
              <p className="text-xs lg:text-sm text-gray-500">
                Delivery: Tomorrow, 10 AM – 2 PM
              </p>
            </div>
          </div>

          {/* Payment badge */}
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 20,
              background: paymentInfo.bg, color: paymentInfo.color,
              fontWeight: 700, fontSize: 13,
            }}
          >
            <span>{paymentInfo.icon}</span>
            {paymentInfo.label}
            {state.paymentMethod === 'cod'
              ? ' · Pay on arrival'
              : ' · Paid ✓'}
          </div>

          {/* Payment ID for online */}
          {state.paymentId && (
            <p className="text-xs text-gray-400 mt-2">
              Payment Ref: {state.paymentId}
            </p>
          )}

          <div
            className="mt-4 p-3 bg-gray-50 rounded-xl text-xs lg:text-sm text-gray-600 flex items-center gap-2"
          >
            <span>📩</span>
            <span>You will receive order updates & invoice via Email</span>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Prompt for first-time name entry */}
          {showNamePrompt && (
            <div className="w-full bg-white rounded-xl p-3 shadow-sm border border-gray-100 mb-2">
              <p className="m-0 font-bold text-sm text-gray-900">Save your name for faster checkout</p>
              <p className="my-1.5 text-xs text-gray-500">Enter your name to personalise your orders and receipts.</p>
              <div className="flex gap-2">
                <Input value={name} onChange={(e) => setName((e.target as HTMLInputElement).value)} placeholder="Your name" />
                <Button
                  onClick={async () => {
                    if (!name.trim()) return;
                    setSavingName(true);
                    const res = await authApi.updateProfile({ name: name.trim() });
                    setSavingName(false);
                    if (!res.error) setShowNamePrompt(false);
                  }}
                  style={{ minWidth: 110 }}
                  disabled={savingName || !name.trim()}
                >
                  {savingName ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" onClick={() => setShowNamePrompt(false)} style={{ minWidth: 90 }}>Skip</Button>
              </div>
            </div>
          )}
          <Button
            onClick={() => navigate('/home')}
            className="flex-1 h-12 rounded-xl font-extrabold text-sm lg:text-base text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md transition-all"
          >
            Continue Shopping
          </Button>
          <Button
            onClick={() => {
              if (order) {
                const subtotal = order.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
                generateInvoicePDF({
                  orderId: order.id,
                  date: new Date(order.createdAt).toLocaleDateString(),
                  customerName: name || 'Valued Customer',
                  customerPhone: phone,
                  address: order.address,
                  paymentMethod: order.paymentMethod,
                  paymentId: order.paymentId || state.paymentId,
                  items: order.items.map(i => ({
                    name: i.productName,
                    weight: i.weight || '1 unit',
                    quantity: i.quantity,
                    price: i.price
                  })),
                  itemSubtotal: subtotal,
                  deliveryFee: order.deliveryFee,
                  total: order.total
                });
              } else {
                generateInvoicePDF({
                  orderId: orderDisplayId,
                  date: new Date().toLocaleDateString(),
                  customerName: name || 'Valued Customer',
                  customerPhone: phone,
                  paymentMethod: state.paymentMethod === 'cod' ? 'Cash on Delivery' : state.subMethod || 'Online Payment',
                  paymentId: state.paymentId,
                  items: [
                    { name: 'SuperMarket Grocery Order', quantity: 1, price: 0 }
                  ],
                  itemSubtotal: 0,
                  deliveryFee: 0,
                  total: 0,
                });
              }
            }}
            variant="outline"
            className="flex-1 h-12 rounded-xl font-bold text-sm lg:text-base border-2 border-orange-500 text-orange-500 hover:bg-orange-50 flex items-center justify-center gap-2 transition-all"
          >
            <Download size={18} />
            Download Invoice PDF
          </Button>
        </div>

        <div className="mt-3">
          <Button
            onClick={() => navigate('/orders')}
            variant="ghost"
            className="w-full h-11 rounded-xl font-bold text-sm text-gray-600 hover:text-gray-900"
          >
            View Order History
          </Button>
        </div>
      </div>
    </div>
  );
}
