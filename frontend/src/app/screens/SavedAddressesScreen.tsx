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
    <div className="min-h-screen bg-[#f8f9fa] lg:bg-gray-50/50 pb-24 lg:pb-16">

      {/* Mobile Sticky Header (Hidden on Desktop) */}
      <div
        className="lg:hidden"
        style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: '#fff', borderBottom: '1px solid #f0f0f0',
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ padding: 8, marginLeft: -8, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8, display: 'flex' }}
        >
          <ArrowLeft size={22} />
        </button>
        <h2 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>Saved Addresses</h2>
      </div>

      <div className="px-4 pt-4 lg:max-w-7xl lg:mx-auto lg:px-6 lg:py-8">
        
        {/* Desktop Title Header */}
        <div className="hidden lg:flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-orange-500" />
              <span>Saved Delivery Addresses</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your home, office, and preferred grocery delivery locations</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-10 px-4 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </Button>
        </div>

        {/* Form dialog / collapse box */}
        {showForm && (
          <Card className="mb-6 p-5 rounded-2xl border border-orange-200 bg-white shadow-md max-w-2xl mx-auto">
            <h3 className="font-extrabold text-gray-900 text-base mb-4">Add New Delivery Location</h3>
            <div className="grid gap-3">
              <Input
                value={form.label}
                onChange={(e) => handleChange('label', e.target.value)}
                placeholder="Address Label (e.g. Home, Office, Parents)"
                className="h-11 rounded-xl"
              />
              <Input
                value={form.line1}
                onChange={(e) => handleChange('line1', e.target.value)}
                placeholder="House No, Building, Street, Area"
                className="h-11 rounded-xl"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="City"
                  className="h-11 rounded-xl"
                />
                <Input
                  value={form.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="State"
                  className="h-11 rounded-xl"
                />
              </div>
              <Input
                value={form.pincode}
                onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit Pincode"
                maxLength={6}
                className="h-11 rounded-xl"
              />
              {formError && <p className="text-xs text-rose-600 font-medium">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 h-11 rounded-xl">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="flex-1 h-11 rounded-xl bg-orange-500 text-white font-bold">
                  {saving ? 'Saving...' : 'Save Address'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {loading && <p className="text-sm text-gray-500 font-semibold p-4">Loading saved addresses...</p>}

        {!loading && addresses.length === 0 && !showForm && (
          <Card className="p-8 text-center rounded-2xl border border-gray-200/80 bg-white max-w-md mx-auto shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8" />
            </div>
            <p className="font-extrabold text-gray-900 text-lg">
              {error ? 'Please log in to view addresses' : 'No addresses saved yet'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {error ? 'Log in with your email & OTP to manage your saved delivery locations.' : 'Add your home or office address for fast 10-15 minute grocery deliveries.'}
            </p>
            <Button
              onClick={() => (error ? navigate('/login') : setShowForm(true))}
              className="mt-6 rounded-xl h-11 px-6 font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md"
            >
              {error ? 'Log In / Register' : '+ Add Your First Address'}
            </Button>
          </Card>
        )}

        {/* Address Cards Grid */}
        <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
          {addresses.map((addr) => (
            <Card key={addr.id} className="p-5 rounded-2xl border border-gray-100 lg:border-gray-200/80 bg-white shadow-xs hover:shadow-md transition-shadow relative">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-base">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                          Default Location
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                      {addr.line1}<br />
                      {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => handleDelete(addr.id)}
                  disabled={deletingId === addr.id}
                  className="text-gray-400 hover:text-rose-600 p-2"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}
