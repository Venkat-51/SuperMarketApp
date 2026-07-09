import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Wallet, Check, CreditCard, Building2, Smartphone, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { useCart } from '../context/CartContext';
import { addressesApi, paymentsApi, ordersApi, type ApiAddress } from '../../lib/api';

// ─── Types ──────────────────────────────────────────────────────────────────
type PaymentMethod = 'cod' | 'razorpay';
type RazorpaySubMethod = 'upi' | 'card' | 'netbanking';

interface UpiOption {
  id: string;
  label: string;
  icon: string;
  color: string;
}

type AddressForm = Pick<ApiAddress, 'label' | 'line1' | 'city' | 'state' | 'pincode'>;

// ─── Constants ───────────────────────────────────────────────────────────────
const UPI_OPTIONS: UpiOption[] = [
  { id: 'gpay',    label: 'GPay',    icon: '🇬',  color: '#4285F4' },
  { id: 'phonepe', label: 'PhonePe', icon: '📱',  color: '#5F259F' },
  { id: 'paytm',   label: 'Paytm',   icon: '💙',  color: '#002970' },
  { id: 'bhim',    label: 'BHIM',    icon: '🏦',  color: '#1B63B2' },
];

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
  const { getCartTotal, clearCart, cartItems } = useCart();

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('razorpay');
  const [razorpaySubMethod, setRazorpaySubMethod] = useState<RazorpaySubMethod>('upi');
  const [selectedUpi, setSelectedUpi] = useState<string>('gpay');
  const [isOnlineExpanded, setIsOnlineExpanded] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDemoPayment, setShowDemoPayment] = useState(false);
  const [demoOrderId, setDemoOrderId] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<ApiAddress | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressForm>({
    label: 'Home',
    line1: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [addressError, setAddressError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const deliveryFee = getCartTotal() >= 299 ? 0 : 40;
  const grandTotal = getCartTotal() + deliveryFee;

  const openDemoPayment = useCallback((orderId?: string) => {
    setDemoOrderId(orderId || generateMockOrderId());
    setShowDemoPayment(true);
    setIsProcessing(false);
  }, []);

  // ── Handle COD ──────────────────────────────────────────────────────────────
  const handleCOD = useCallback(async () => {
    setIsProcessing(true);
    setErrorMsg('');
    try {
      const payload = {
        items: cartItems.map(i => ({ productId: Number(i.id), quantity: i.quantity })),
        addressId: selectedAddress?.id,
        paymentMethod: 'cod' as const,
      };

      const res = await ordersApi.place(payload);
      if (res.error || !res.data) {
        setErrorMsg(res.error ?? 'Unable to place order.');
        setIsProcessing(false);
        return;
      }

      clearCart();
      navigate('/order-success', { state: { paymentMethod: 'cod' } });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not place order.');
    } finally {
      setIsProcessing(false);
    }
  }, [cartItems, clearCart, navigate, selectedAddress]);

  // ── Handle Razorpay ─────────────────────────────────────────────────────────
  const handleRazorpay = useCallback(async () => {
    setIsProcessing(true);
    setErrorMsg('');

    if (grandTotal <= 0) {
      setErrorMsg('Add items to your cart before starting payment.');
      setIsProcessing(false);
      return;
    }

    try {
      const orderResponse = await paymentsApi.createOrder(grandTotal);
      if (orderResponse.error || !orderResponse.data) {
        setErrorMsg(orderResponse.error ?? 'Unable to start online payment.');
        setIsProcessing(false);
        return;
      }

      const { orderId, keyId } = orderResponse.data;

      if (!keyId || keyId === 'YOUR_RAZORPAY_KEY_ID') {
        openDemoPayment(orderId);
        return;
      }

      await ensureRazorpayLoaded();

      const methodConfig: Record<RazorpaySubMethod, object> = {
        upi:        { upi: true, card: false, netbanking: false, wallet: false },
        card:       { upi: false, card: true, netbanking: false, wallet: false },
        netbanking: { upi: false, card: false, netbanking: true, wallet: false },
      };

      const options: RazorpayOptions = {
        key: keyId,
        amount: grandTotal * 100, // paise
        currency: 'INR',
        name: 'Shree Sai Mega Mart',
        description: 'Grocery Order Payment',
        order_id: orderId,
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
          paymentsApi.verify(
            response.razorpay_order_id ?? orderId,
            response.razorpay_payment_id,
            response.razorpay_signature ?? ''
          ).then(async (verifyResult) => {
            if (verifyResult.error) {
              setErrorMsg(verifyResult.error);
              setIsProcessing(false);
              return;
            }

            // Place order on the backend with payment details
            const payload = {
              items: cartItems.map(i => ({ productId: Number(i.id), quantity: i.quantity })),
              addressId: selectedAddress?.id,
              paymentMethod: 'online' as const,
              paymentId: verifyResult.data?.paymentId ?? response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id ?? orderId,
            };

            const placeRes = await ordersApi.place(payload);
            if (placeRes.error || !placeRes.data) {
              setErrorMsg(placeRes.error ?? 'Unable to record order.');
              setIsProcessing(false);
              return;
            }

            clearCart();
            navigate('/order-success', {
              state: {
                paymentMethod: 'online',
                subMethod: razorpaySubMethod,
                paymentId: response.razorpay_payment_id,
              },
            });
          });
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not initialise payment. Please try again.');
      setIsProcessing(false);
      return;
    }
    setIsProcessing(false);
  }, [grandTotal, razorpaySubMethod, clearCart, navigate, openDemoPayment]);

  const handleDemoPayment = () => {
    (async () => {
      setIsProcessing(true);
      const paymentId = demoOrderId || `DEMO-${Date.now()}`;
      const payload = {
        items: cartItems.map(i => ({ productId: Number(i.id), quantity: i.quantity })),
        addressId: selectedAddress?.id,
        paymentMethod: 'online' as const,
        paymentId,
      };
      const res = await ordersApi.place(payload);
      if (res.error || !res.data) {
        setErrorMsg(res.error ?? 'Unable to place demo order.');
        setIsProcessing(false);
        return;
      }
      clearCart();
      setShowDemoPayment(false);
      setIsProcessing(false);
      navigate('/order-success', {
        state: { paymentMethod: 'online', subMethod: razorpaySubMethod, paymentId },
      });
    })();
  };

  const handleAddressChange = (field: keyof AddressForm, value: string) => {
    setAddressForm((current) => ({ ...current, [field]: value }));
  };

  const handleSaveAddress = async () => {
    const nextAddress = {
      label: addressForm.label.trim() || 'Home',
      line1: addressForm.line1.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      pincode: addressForm.pincode.replace(/\D/g, ''),
    };

    if (!nextAddress.line1 || !nextAddress.city || !nextAddress.state || nextAddress.pincode.length !== 6) {
      setAddressError('Enter full address details with a valid 6-digit pincode.');
      return;
    }

    setAddressError('');
    const result = await addressesApi.add({ ...nextAddress, isDefault: true });

    setSelectedAddress(result.data ?? { id: Date.now(), ...nextAddress, isDefault: true });
    setShowAddressForm(false);
  };

  // ── Place Order dispatcher ───────────────────────────────────────────────────
  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      setShowAddressForm(true);
      setErrorMsg('');
      return;
    }

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
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, marginBottom: 2, fontSize: 14 }}>
                      {selectedAddress?.label ?? 'Add delivery address'}
                    </p>
                    <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                      {selectedAddress
                        ? <>{selectedAddress.line1}<br />{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</>
                        : 'Add your address before placing the order'}
                    </p>
                  </div>
                  {selectedAddress && (
                    <Button
                      variant="ghost"
                      onClick={() => setShowAddressForm(true)}
                      style={{ color: '#FF9933', fontSize: 12, fontWeight: 600, marginTop: -4 }}
                    >
                      Change
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {showAddressForm && (
            <Card style={{ borderRadius: 16, border: '1px solid #f0f0f0', padding: 14, background: '#fff', marginTop: 10 }}>
              <div style={{ display: 'grid', gap: 10 }}>
                <Input
                  value={addressForm.label}
                  onChange={(event) => handleAddressChange('label', event.target.value)}
                  placeholder="Label, e.g. Home"
                  className="h-11 rounded-lg"
                />
                <Input
                  value={addressForm.line1}
                  onChange={(event) => handleAddressChange('line1', event.target.value)}
                  placeholder="House no, street, area"
                  className="h-11 rounded-lg"
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Input
                    value={addressForm.city}
                    onChange={(event) => handleAddressChange('city', event.target.value)}
                    placeholder="City"
                    className="h-11 rounded-lg"
                  />
                  <Input
                    value={addressForm.state}
                    onChange={(event) => handleAddressChange('state', event.target.value)}
                    placeholder="State"
                    className="h-11 rounded-lg"
                  />
                </div>
                <Input
                  value={addressForm.pincode}
                  onChange={(event) => handleAddressChange('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit pincode"
                  inputMode="numeric"
                  maxLength={6}
                  className="h-11 rounded-lg"
                />
                {addressError && <p style={{ color: '#e11d48', fontSize: 12, margin: 0 }}>{addressError}</p>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddressForm(false)}
                    className="h-11 rounded-lg flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveAddress}
                    className="h-11 rounded-lg flex-1"
                    style={{ backgroundColor: '#FF9933' }}
                  >
                    Save Address
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {!showAddressForm && !selectedAddress && (
            <Button
              variant="outline"
              onClick={() => setShowAddressForm(true)}
              style={{
                width: '100%', marginTop: 10, height: 42, borderRadius: 10,
                border: '1.5px dashed #FF9933', color: '#FF9933', fontWeight: 600, fontSize: 13,
              }}
            >
              + Add New Address
            </Button>
          )}
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
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 448, zIndex: 30,
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

      {showDemoPayment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 50,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 360,
              borderRadius: 20,
              background: '#fff',
              padding: 20,
              boxShadow: '0 24px 80px rgba(0,0,0,0.24)',
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 700, color: '#FF9933', marginBottom: 6 }}>Demo Payment Mode</p>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>Complete your payment</h3>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, marginBottom: 14 }}>
              Razorpay keys are not configured, so this checkout is shown in demo mode.
              You can still confirm the order and see the payment flow on the frontend.
            </p>

            <div style={{ borderRadius: 14, background: '#f9fafb', padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: '#6b7280' }}>Payment method</span>
                <span style={{ fontWeight: 700 }}>
                  {razorpaySubMethod === 'upi' ? `UPI · ${UPI_OPTIONS.find(o => o.id === selectedUpi)?.label}` : razorpaySubMethod.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#6b7280' }}>Amount</span>
                <span style={{ fontWeight: 800 }}>₹{grandTotal}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDemoPayment(false);
                  setIsProcessing(false);
                }}
                className="h-12 rounded-lg flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDemoPayment}
                className="h-12 rounded-lg flex-1"
                style={{ backgroundColor: '#FF9933' }}
              >
                Pay Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
