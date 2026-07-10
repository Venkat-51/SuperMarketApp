import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { addressesApi, type ApiAddress } from '../../lib/api';

type AddressForm = {
  label: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
};

const EMPTY_FORM: AddressForm = { label: 'Home', line1: '', city: '', state: '', pincode: '' };

export default function SavedAddressesScreen() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchAddresses = async () => {
    setLoading(true);
    const res = await addressesApi.list();
    if (res.error) setError(res.error);
    else setAddresses(res.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAddresses(); }, []);

  const handleChange = (field: keyof AddressForm, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    const pincode = form.pincode.replace(/\D/g, '');
    if (!form.line1.trim() || !form.city.trim() || !form.state.trim() || pincode.length !== 6) {
      setFormError('Fill all fields with a valid 6-digit pincode.');
      return;
    }
    setFormError('');
    setSaving(true);
    const res = await addressesApi.add({
      label: form.label.trim() || 'Home',
      line1: form.line1.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode,
      isDefault: addresses.length === 0,
    });
    setSaving(false);
    if (res.error) { setFormError(res.error); return; }
    setForm(EMPTY_FORM);
    setShowForm(false);
    fetchAddresses();
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await addressesApi.delete(id);
    setDeletingId(null);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div
        style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: '#fff', borderBottom: '1px solid #f0f0f0',
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: 8, marginLeft: -8, background: 'none',
            border: 'none', cursor: 'pointer', borderRadius: 8, display: 'flex',
          }}
        >
          <ArrowLeft size={22} />
        </button>
        <h2 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>Saved Addresses</h2>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── Loading / Error ── */}
        {loading && <p style={{ color: '#6b7280', fontSize: 14 }}>Loading addresses…</p>}
        {error && <p style={{ color: '#e11d48', fontSize: 13 }}>{error}</p>}

        {/* ── Address List ── */}
        {!loading && addresses.length === 0 && !showForm && (
          <Card style={{ borderRadius: 16, padding: 24, background: '#fff', textAlign: 'center', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FFF5EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={26} color="#FF9933" />
              </div>
            </div>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>No saved addresses</p>
            <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 0 }}>Add your delivery address to speed up checkout.</p>
          </Card>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              style={{
                borderRadius: 16, padding: 16, background: '#fff',
                border: addr.isDefault ? '2px solid #FF9933' : '1px solid #f0f0f0',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: addr.isDefault ? '#FFF5EB' : '#f3f4f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <MapPin size={20} color={addr.isDefault ? '#FF9933' : '#6b7280'} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{addr.label}</span>
                    {addr.isDefault && (
                      <span style={{
                        background: '#FFF5EB', color: '#FF9933', fontSize: 11,
                        fontWeight: 700, borderRadius: 6, padding: '2px 8px',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <CheckCircle2 size={11} /> Default
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, margin: 0 }}>
                    {addr.line1}<br />
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(addr.id)}
                  disabled={deletingId === addr.id}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#e11d48', padding: 6, borderRadius: 8,
                    opacity: deletingId === addr.id ? 0.4 : 1,
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Add Address Form ── */}
        {showForm ? (
          <Card style={{ borderRadius: 16, border: '1px solid #f0f0f0', padding: 16, background: '#fff' }}>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>New Address</p>
            <div style={{ display: 'grid', gap: 10 }}>
              <Input
                value={form.label}
                onChange={(e) => handleChange('label', e.target.value)}
                placeholder="Label (e.g. Home, Work)"
                className="h-11 rounded-lg"
              />
              <Input
                value={form.line1}
                onChange={(e) => handleChange('line1', e.target.value)}
                placeholder="House no, street, area"
                className="h-11 rounded-lg"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Input
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="City"
                  className="h-11 rounded-lg"
                />
                <Input
                  value={form.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="State"
                  className="h-11 rounded-lg"
                />
              </div>
              <Input
                value={form.pincode}
                onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit pincode"
                inputMode="numeric"
                maxLength={6}
                className="h-11 rounded-lg"
              />
              {formError && <p style={{ color: '#e11d48', fontSize: 12, margin: 0 }}>{formError}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <Button
                  variant="outline"
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(''); }}
                  className="h-11 rounded-lg flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="h-11 rounded-lg flex-1"
                  style={{ backgroundColor: '#FF9933' }}
                >
                  {saving ? 'Saving…' : 'Save Address'}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: '100%', height: 48, borderRadius: 12,
              border: '1.5px dashed #FF9933', background: 'none',
              color: '#FF9933', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
            }}
          >
            <Plus size={18} /> Add New Address
          </button>
        )}
      </div>
    </div>
  );
}
