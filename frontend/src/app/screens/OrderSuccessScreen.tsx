import { useNavigate, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CheckCircle2, Package } from 'lucide-react';
import { authApi } from '../../lib/api';

interface LocationState {
  paymentMethod?: 'cod' | 'online';
  subMethod?: 'upi' | 'card' | 'netbanking';
  paymentId?: string;
}

const PAYMENT_LABELS: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  cod:        { icon: '💵', label: 'Cash on Delivery', color: '#92400e', bg: '#fef3c7' },
  upi:        { icon: '📱', label: 'UPI Payment',       color: '#1e40af', bg: '#dbeafe' },
  card:       { icon: '💳', label: 'Card Payment',      color: '#065f46', bg: '#d1fae5' },
  netbanking: { icon: '🏦', label: 'Net Banking',       color: '#4c1d95', bg: '#ede9fe' },
};

function generateOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  return `ORD-${ts}`;
}

export default function OrderSuccessScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [meChecked, setMeChecked] = useState(false);

  const paymentKey =
    state.paymentMethod === 'online' && state.subMethod
      ? state.subMethod
      : state.paymentMethod === 'cod'
      ? 'cod'
      : 'cod';

  const paymentInfo = PAYMENT_LABELS[paymentKey];
  const orderId = generateOrderId();

  useEffect(() => {
    (async () => {
      const res = await authApi.me();
      if (!res.error && res.data) {
        if (!res.data.name || res.data.name.trim() === '') {
          setShowNamePrompt(true);
        }
      }
      setMeChecked(true);
    })();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #fff7f0 0%, #f0fdf4 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>

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

        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 8 }}>
          Order Placed! 🎉
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
          Thank you for shopping with
        </p>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#FF9933', marginBottom: 24 }}>
          Super Market App
        </p>

        {/* ── Order Info Card ── */}
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: 20,
            marginBottom: 16,
            boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: '#FFF5EB', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Package size={20} color="#FF9933" />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Order ID: #{orderId}</p>
              <p style={{ fontSize: 12, color: '#6b7280' }}>
                Delivery: Tomorrow, 10 AM – 2 PM
              </p>
            </div>
          </div>

          {/* Payment badge */}
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 20,
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
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
              Payment Ref: {state.paymentId}
            </p>
          )}

          <div
            style={{
              marginTop: 14, padding: '10px 12px', background: '#f9fafb',
              borderRadius: 10, fontSize: 12, color: '#6b7280',
            }}
          >
            📩 You will receive order updates via SMS
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Prompt for first-time name entry */}
          {showNamePrompt && (
            <div style={{ background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: 6 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>Save your name for faster checkout</p>
              <p style={{ margin: '6px 0 10px', color: '#6b7280', fontSize: 13 }}>Enter your name to personalise your orders and receipts.</p>
              <div style={{ display: 'flex', gap: 8 }}>
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
            style={{
              width: '100%', height: 50, borderRadius: 14,
              fontWeight: 800, fontSize: 15,
              background: 'linear-gradient(135deg, #FF9933 0%, #ff7700 100%)',
              border: 'none', color: '#fff',
              boxShadow: '0 4px 14px rgba(255,153,51,0.4)',
            }}
          >
            Continue Shopping
          </Button>
          <Button
            onClick={() => navigate('/home')}
            variant="outline"
            style={{
              width: '100%', height: 48, borderRadius: 14,
              fontWeight: 700, fontSize: 14,
              border: '2px solid #FF9933', color: '#FF9933',
            }}
          >
            Track My Order
          </Button>
        </div>
      </div>
    </div>
  );
}
