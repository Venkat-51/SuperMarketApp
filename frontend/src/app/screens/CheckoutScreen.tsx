import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Wallet, Check, CreditCard, Building2, Smartphone, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { useCart } from '../context/CartContext';

// ─── Types ──────────────────────────────────────────────────────────────────
type PaymentMethod = 'cod' | 'razorpay';
type RazorpaySubMethod = 'upi' | 'card' | 'netbanking';

interface UpiOption {
  id: string;
  label: string;
  icon: string;
  color: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const UPI_OPTIONS: UpiOption[] = [
  { id: 'gpay',    label: 'GPay',    icon: '🇬',  color: '#4285F4' },
  { id: 'phonepe', label: 'PhonePe', icon: '📱',  color: '#5F259F' },
  { id: 'paytm',   label: 'Paytm',   icon: '💙',  color: '#002970' },
  { id: 'bhim',    label: 'BHIM',    icon: '🏦',  color: '#1B63B2' },
];

const RAZORPAY_KEY = 'YOUR_RAZORPAY_KEY_ID'; // 🔑 Replace with your Razorpay key

// ─── Helper: generate a mock order id (replace with real backend call) ────────
function generateMockOrderId() {
  return 'order_' + Math.random().toString(36).substring(2, 14).toUpperCase();
}

// ─── Helper: load Razorpay SDK lazily if needed ───────────────────────────────
function ensureRazorpayLoaded(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.head.appendChild(script);
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function UpiChip({ option, selected, onSelect }: { option: UpiOption; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      style={{
        border: selected ? `2px solid #FF9933` : '1.5px solid #e5e7eb',
        borderRadius: 12,
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: selected ? '#FFF5EB' : '#fff',
        cursor: 'pointer',
        transition: 'all 0.18s',
        fontWeight: selected ? 700 : 500,
        fontSize: 13,
        color: selected ? '#FF9933' : '#374151',
        outline: 'none',
        flex: '1 1 auto',
        justifyContent: 'center',
        minWidth: 70,
      }}
    >
      <span style={{ fontSize: 16 }}>{option.icon}</span>
      {option.label}
    </button>
  );
}

function SubMethodTab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '10px 4px',
        border: active ? '2px solid #FF9933' : '1.5px solid #e5e7eb',
        borderRadius: 12,
        background: active ? '#FFF5EB' : '#fafafa',
        cursor: 'pointer',
        transition: 'all 0.18s',
        color: active ? '#FF9933' : '#6b7280',
        fontWeight: active ? 700 : 500,
        fontSize: 11,
        outline: 'none',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CheckoutScreen() {
  const navigate = useNavigate();
  const { getCartTotal, clearCart } = useCart();

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cod');
  const [razorpaySubMethod, setRazorpaySubMethod] = useState<RazorpaySubMethod>('upi');
  const [selectedUpi, setSelectedUpi] = useState<string>('gpay');
  const [isOnlineExpanded, setIsOnlineExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const deliveryFee = getCartTotal() >= 299 ? 0 : 40;
  const grandTotal = getCartTotal() + deliveryFee;

  // ── Handle COD ──────────────────────────────────────────────────────────────
  const handleCOD = useCallback(() => {
    clearCart();
    navigate('/order-success', { state: { paymentMethod: 'cod' } });
  }, [clearCart, navigate]);

  // ── Handle Razorpay ─────────────────────────────────────────────────────────
  const handleRazorpay = useCallback(async () => {
    setIsProcessing(true);
    setErrorMsg('');
    try {
      await ensureRazorpayLoaded();

      // In production: call your backend to create a Razorpay order
      const mockOrderId = generateMockOrderId();

      const methodConfig: Record<RazorpaySubMethod, object> = {
        upi:        { upi: true, card: false, netbanking: false, wallet: false },
        card:       { upi: false, card: true, netbanking: false, wallet: false },
        netbanking: { upi: false, card: false, netbanking: true, wallet: false },
      };

      const options: RazorpayOptions = {
        key: RAZORPAY_KEY,
        amount: grandTotal * 100, // paise
        currency: 'INR',
        name: 'Shree Sai Mega Mart',
        description: 'Grocery Order Payment',
        order_id: mockOrderId,
        method: methodConfig[razorpaySubMethod] as RazorpayOptions['method'],
        prefill: {
          name:    'Customer',
          email:   'customer@example.com',
          contact: '9999999999',
        },
        theme: { color: '#FF9933' },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setErrorMsg('Payment cancelled. Please try again.');
          },
          confirm_close: true,
        },
        handler: (response) => {
          clearCart();
          navigate('/order-success', {
            state: {
              paymentMethod: 'online',
              subMethod: razorpaySubMethod,
              paymentId: response.razorpay_payment_id,
            },
          });
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setErrorMsg('Could not initialise payment. Please try again.');
      setIsProcessing(false);
    }
  }, [grandTotal, razorpaySubMethod, clearCart, navigate]);

  // ── Place Order dispatcher ───────────────────────────────────────────────────
  const handlePlaceOrder = () => {
    if (selectedPayment === 'cod') {
      handleCOD();
    } else {
      handleRazorpay();
    }
  };

  const handleSelectOnline = () => {
    setSelectedPayment('razorpay');
    setIsOnlineExpanded(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingBottom: 140 }}>
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
        <h2 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>Checkout</h2>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── Delivery Address ── */}
        <section style={{ marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Delivery Address</h3>
          <Card style={{ borderRadius: 16, border: '1px solid #f0f0f0', padding: 16, background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: '#FFF5EB', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                <MapPin size={20} color="#FF9933" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: 2, fontSize: 14 }}>Home</p>
                    <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                      45, Anna Nagar West Extension,<br />
                      Chennai, Tamil Nadu - 600101
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    style={{ color: '#FF9933', fontSize: 12, fontWeight: 600, marginTop: -4 }}
                  >
                    Change
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          <Button
            variant="outline"
            style={{
              width: '100%', marginTop: 10, height: 42, borderRadius: 10,
              border: '1.5px dashed #FF9933', color: '#FF9933', fontWeight: 600, fontSize: 13,
            }}
          >
            + Add New Address
          </Button>
        </section>

        {/* ── Payment Method ── */}
        <section style={{ marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Payment Method</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* COD Card */}
            <div
              onClick={() => { setSelectedPayment('cod'); setIsOnlineExpanded(false); }}
              style={{
                borderRadius: 16,
                padding: 16,
                cursor: 'pointer',
                border: selectedPayment === 'cod' ? '2px solid #FF9933' : '1.5px solid #e5e7eb',
                background: selectedPayment === 'cod' ? '#FFFBF5' : '#fff',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: '#FFF5EB', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <Wallet size={22} color="#FF9933" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Cash on Delivery</p>
                  <p style={{ fontSize: 12, color: '#6b7280' }}>Pay in cash when your order arrives</p>
                </div>
                <div
                  style={{
                    width: 22, height: 22, borderRadius: '50%',
                    border: selectedPayment === 'cod' ? 'none' : '2px solid #d1d5db',
                    background: selectedPayment === 'cod' ? '#FF9933' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s', flexShrink: 0,
                  }}
                >
                  {selectedPayment === 'cod' && <Check size={13} color="#fff" strokeWidth={3} />}
                </div>
              </div>
            </div>

            {/* Online / Razorpay Card */}
            <div
              style={{
                borderRadius: 16,
                border: selectedPayment === 'razorpay' ? '2px solid #FF9933' : '1.5px solid #e5e7eb',
                background: selectedPayment === 'razorpay' ? '#FFFBF5' : '#fff',
                overflow: 'hidden',
                transition: 'all 0.2s',
              }}
            >
              {/* Header row */}
              <div
                onClick={handleSelectOnline}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, cursor: 'pointer' }}
              >
                <div
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: '#FFF5EB', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <CreditCard size={22} color="#FF9933" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Pay Online</p>
                  <p style={{ fontSize: 12, color: '#6b7280' }}>UPI · Cards · Net Banking · Wallets</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Razorpay badge */}
                  <span
                    style={{
                      fontSize: 10, fontWeight: 700, color: '#072654',
                      background: '#e8eef8', borderRadius: 6, padding: '2px 6px',
                      letterSpacing: 0.2,
                    }}
                  >
                    Razorpay
                  </span>
                  <div
                    style={{
                      width: 22, height: 22, borderRadius: '50%',
                      border: selectedPayment === 'razorpay' ? 'none' : '2px solid #d1d5db',
                      background: selectedPayment === 'razorpay' ? '#FF9933' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s', flexShrink: 0,
                    }}
                  >
                    {selectedPayment === 'razorpay' && <Check size={13} color="#fff" strokeWidth={3} />}
                  </div>
                </div>
              </div>

              {/* Expandable sub-method panel */}
              {selectedPayment === 'razorpay' && (
                <div style={{ borderTop: '1px solid #f3e8d8', padding: '14px 16px 16px' }}>
                  {/* Toggle button */}
                  <button
                    onClick={() => setIsOnlineExpanded(v => !v)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                      padding: 0, marginBottom: isOnlineExpanded ? 12 : 0,
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                      Choose payment type
                    </span>
                    {isOnlineExpanded
                      ? <ChevronUp size={16} color="#9ca3af" />
                      : <ChevronDown size={16} color="#9ca3af" />}
                  </button>

                  {isOnlineExpanded && (
                    <>
                      {/* Sub-method tabs */}
                      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                        <SubMethodTab
                          icon={<Smartphone size={18} />}
                          label="UPI"
                          active={razorpaySubMethod === 'upi'}
                          onClick={() => setRazorpaySubMethod('upi')}
                        />
                        <SubMethodTab
                          icon={<CreditCard size={18} />}
                          label="Card"
                          active={razorpaySubMethod === 'card'}
                          onClick={() => setRazorpaySubMethod('card')}
                        />
                        <SubMethodTab
                          icon={<Building2 size={18} />}
                          label="Net Banking"
                          active={razorpaySubMethod === 'netbanking'}
                          onClick={() => setRazorpaySubMethod('netbanking')}
                        />
                      </div>

                      {/* UPI Chips */}
                      {razorpaySubMethod === 'upi' && (
                        <div>
                          <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8, fontWeight: 600, letterSpacing: 0.4 }}>
                            SELECT UPI APP
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {UPI_OPTIONS.map(opt => (
                              <UpiChip
                                key={opt.id}
                                option={opt}
                                selected={selectedUpi === opt.id}
                                onSelect={() => setSelectedUpi(opt.id)}
                              />
                            ))}
                          </div>
                          <p style={{ fontSize: 11, color: '#6b7280', marginTop: 10 }}>
                            💡 Razorpay will open your selected UPI app to complete payment
                          </p>
                        </div>
                      )}

                      {/* Card info */}
                      {razorpaySubMethod === 'card' && (
                        <div
                          style={{
                            background: '#f9fafb', borderRadius: 12,
                            padding: '12px 14px', fontSize: 13, color: '#374151',
                          }}
                        >
                          <p style={{ fontWeight: 600, marginBottom: 4 }}>💳 Debit / Credit / Prepaid</p>
                          <p style={{ fontSize: 12, color: '#6b7280' }}>
                            Visa, Mastercard, RuPay, American Express — all accepted
                          </p>
                        </div>
                      )}

                      {/* Net Banking info */}
                      {razorpaySubMethod === 'netbanking' && (
                        <div
                          style={{
                            background: '#f9fafb', borderRadius: 12,
                            padding: '12px 14px', fontSize: 13, color: '#374151',
                          }}
                        >
                          <p style={{ fontWeight: 600, marginBottom: 4 }}>🏦 Net Banking</p>
                          <p style={{ fontSize: 12, color: '#6b7280' }}>
                            SBI, HDFC, ICICI, Axis, Kotak &amp; 50+ banks supported
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Order Summary ── */}
        <section style={{ marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Order Summary</h3>
          <Card style={{ borderRadius: 16, border: '1px solid #f0f0f0', padding: 16, background: '#fff' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#6b7280' }}>Item Total</span>
                <span style={{ fontWeight: 600 }}>₹{getCartTotal()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#6b7280' }}>Delivery Fee</span>
                <span style={{ fontWeight: 600, color: deliveryFee === 0 ? '#16a34a' : 'inherit' }}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              {selectedPayment === 'razorpay' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#6b7280' }}>Payment Charges</span>
                  <span style={{ fontWeight: 600, color: '#16a34a' }}>NIL</span>
                </div>
              )}
              <Separator style={{ margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15 }}>
                <span>Grand Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
          </Card>
        </section>

        {/* ── Delivery Info ── */}
        <div style={{ padding: '12px 14px', borderRadius: 12, background: '#E8F5E9', marginBottom: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#15803d', margin: 0 }}>
            ⚡ Expected delivery: Tomorrow, 10 AM – 2 PM
          </p>
        </div>

        {/* ── Trust Badges ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, padding: '12px 0' }}>
          {['100% Secure', 'Encrypted', 'No Extra Fees'].map(label => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7280' }}>
              <ShieldCheck size={13} color="#16a34a" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Fixed Bottom Bar ── */}
      <div
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#fff', borderTop: '1px solid #e5e7eb',
          padding: '14px 16px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.07)',
        }}
      >
        {errorMsg && (
          <div
            style={{
              background: '#fff1f2', border: '1px solid #fecdd3',
              borderRadius: 10, padding: '8px 12px', marginBottom: 10,
              fontSize: 12, color: '#e11d48', fontWeight: 500,
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Total Payable</p>
            <p style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#111' }}>₹{grandTotal}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Payment via</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: 0 }}>
              {selectedPayment === 'cod'
                ? '💵 Cash on Delivery'
                : razorpaySubMethod === 'upi'
                ? `📱 UPI · ${UPI_OPTIONS.find(o => o.id === selectedUpi)?.label}`
                : razorpaySubMethod === 'card'
                ? '💳 Card Payment'
                : '🏦 Net Banking'}
            </p>
          </div>
        </div>

        <Button
          onClick={handlePlaceOrder}
          disabled={isProcessing}
          style={{
            width: '100%', height: 50, borderRadius: 14,
            fontWeight: 800, fontSize: 15, letterSpacing: 0.3,
            background: isProcessing
              ? '#ffd49c'
              : 'linear-gradient(135deg, #FF9933 0%, #ff7700 100%)',
            border: 'none', color: '#fff',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: isProcessing ? 'none' : '0 4px 14px rgba(255,153,51,0.45)',
          }}
        >
          {isProcessing ? '⏳ Opening Payment...' : `Place Order · ₹${grandTotal}`}
        </Button>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 10, marginBottom: 0 }}>
          By placing order, you agree to our{' '}
          <span style={{ color: '#FF9933', fontWeight: 600 }}>Terms &amp; Conditions</span>
        </p>
      </div>
    </div>
  );
}
