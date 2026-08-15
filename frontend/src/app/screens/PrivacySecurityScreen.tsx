import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowLeft, Shield, Lock, Eye, KeyRound, Smartphone, CheckCircle2, ChevronRight, FileText, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

export default function PrivacySecurityScreen() {
  const navigate = useNavigate();
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [promoEmails, setPromoEmails] = useState(true);
  const [locationAccess, setLocationAccess] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleToggleTwoFactor = (checked: boolean) => {
    setTwoFactor(checked);
    if (checked) {
      toast.success('Two-factor authentication enabled via SMS/OTP');
    } else {
      toast.info('Two-factor authentication disabled');
    }
  };

  const handleRequestDataExport = () => {
    toast.success('Your data export request has been submitted. Check your email shortly!');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-12">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 lg:hidden">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-700">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-gray-900 text-lg">Privacy & Security</h1>
      </div>

      {/* Desktop Breadcrumbs */}
      <div className="hidden lg:block bg-white border-b border-gray-200 py-3 px-6">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Link to="/home" className="hover:text-orange-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/account" className="hover:text-orange-600 transition-colors">Account</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-bold">Privacy & Security</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Desktop Header Title */}
        <div className="hidden lg:flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Privacy & Security Controls</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage your data security, account protection, and privacy preferences</p>
          </div>
        </div>

        {/* Security Overview Card */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-100">Account Protected</span>
            </div>
            <h2 className="text-xl font-black mb-1">Your Account Data is 256-Bit Encrypted</h2>
            <p className="text-xs text-emerald-100 leading-relaxed max-w-xl">
              We use bank-level encryption protocols and PCI-DSS compliant payment processing. Your saved delivery addresses and contact information are protected and never shared with unauthorized third parties.
            </p>
          </div>
        </div>

        {/* Security Preferences */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Lock className="w-4 h-4 text-orange-500" />
            <span>Account Security</span>
          </h3>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-bold text-gray-900">Two-Factor Authentication (OTP)</p>
              <p className="text-[11px] text-gray-500">Require an OTP code sent to your phone on every login</p>
            </div>
            <Switch checked={twoFactor} onCheckedChange={handleToggleTwoFactor} />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-900">Logged-in Sessions</p>
              <p className="text-[11px] text-gray-500">Active session on current device (Windows Web)</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">Active</Badge>
          </div>
        </div>

        {/* Communication & Privacy Settings */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Eye className="w-4 h-4 text-orange-500" />
            <span>Privacy & Notifications</span>
          </h3>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-bold text-gray-900">Order Status SMS & WhatsApp Updates</p>
              <p className="text-[11px] text-gray-500">Receive live delivery tracking alerts on your mobile phone</p>
            </div>
            <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-900">Promotional & Special Offer Emails</p>
              <p className="text-[11px] text-gray-500">Get notified about weekend sales, coupon codes, and grocery deals</p>
            </div>
            <Switch checked={promoEmails} onCheckedChange={setPromoEmails} />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-900">Location Access Permission</p>
              <p className="text-[11px] text-gray-500">Allow automatic detection of delivery address for fast checkout</p>
            </div>
            <Switch checked={locationAccess} onCheckedChange={setLocationAccess} />
          </div>
        </div>

        {/* Data Rights & Erasure */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <FileText className="w-4 h-4 text-orange-500" />
            <span>Data Rights & Management</span>
          </h3>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-bold text-gray-900">Download Account Data Copy</p>
              <p className="text-[11px] text-gray-500">Export your order history, profile details, and saved addresses</p>
            </div>
            <Button
              onClick={handleRequestDataExport}
              variant="outline"
              className="text-xs font-bold h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              Export Data
            </Button>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <p className="text-xs font-bold text-rose-600">Delete Account & Personal Data</p>
            </div>
            <Button
              onClick={() => toast.info('To delete your account, please contact support@supermarketapp.com')}
              variant="outline"
              className="text-xs font-bold h-8 px-3 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl"
            >
              Request Deletion
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
