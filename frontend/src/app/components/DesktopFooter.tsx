import { Link } from 'react-router';
import { ShoppingBag, Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw, Award, Heart } from 'lucide-react';
import { categories } from '../data/products';

export default function DesktopFooter() {
  return (
    <footer className="hidden lg:block bg-gray-900 text-gray-300 mt-16 border-t border-gray-800">
      
      {/* Value Proposition Features Banner */}
      <div className="bg-gray-800/80 border-b border-gray-700/60 py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">SuperFast Delivery</h4>
              <p className="text-xs text-gray-400 mt-0.5">Delivered to your doorstep in 10-15 mins</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">100% Quality Guaranteed</h4>
              <p className="text-xs text-gray-400 mt-0.5">Fresh produce directly from farms & verified brands</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Easy Instant Returns</h4>
              <p className="text-xs text-gray-400 mt-0.5">Hassle-free refund or replacement at your door</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Best Prices & Offers</h4>
              <p className="text-xs text-gray-400 mt-0.5">Cheaper than local market rates every day</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-5 gap-8">
        
        {/* Brand info */}
        <div className="col-span-2 space-y-4 pr-6">
          <Link to="/home" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white leading-none block">
                Super<span className="text-orange-500">Market</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400 block mt-0.5">
                Fresh & Fast
              </span>
            </div>
          </Link>

          <p className="text-xs text-gray-400 leading-relaxed">
            SuperMarket is India’s favorite quick grocery delivery platform. We bring fresh staples, fruits, vegetables, dairy products, cold drinks, snacks, and home essentials right to your door within minutes.
          </p>

          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <span>SuperMarket Tech Park, Indiranagar, Bengaluru 560038</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <span>Toll Free: 1800-SUPER-MARKET (1800-787-3762)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <span>support@supermarket.app</span>
            </div>
          </div>
        </div>

        {/* Categories Links */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider text-xs">Categories</h4>
          <ul className="space-y-2.5 text-xs text-gray-400">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  to={`/home?category=${encodeURIComponent(cat.id)}`}
                  className="hover:text-orange-400 transition-colors flex items-center gap-1.5"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider text-xs">Customer Care</h4>
          <ul className="space-y-2.5 text-xs text-gray-400">
            <li><Link to="/orders" className="hover:text-orange-400 transition-colors">My Orders</Link></li>
            <li><Link to="/cart" className="hover:text-orange-400 transition-colors">Shopping Cart</Link></li>
            <li><Link to="/wishlist" className="hover:text-orange-400 transition-colors">My Wishlist</Link></li>
            <li><Link to="/account" className="hover:text-orange-400 transition-colors">Account Profile</Link></li>
            <li><Link to="/addresses" className="hover:text-orange-400 transition-colors">Delivery Addresses</Link></li>
            <li><span className="hover:text-orange-400 transition-colors cursor-pointer">Help & FAQs</span></li>
            <li><span className="hover:text-orange-400 transition-colors cursor-pointer">Return & Refund Policy</span></li>
          </ul>
        </div>

        {/* Payment & Download */}
        <div className="space-y-6">
          <div>
            <h4 className="text-white font-bold text-sm mb-3 uppercase tracking-wider text-xs">Accepted Payments</h4>
            <div className="flex flex-wrap gap-2 text-xs text-gray-300">
              <span className="px-2.5 py-1 bg-gray-800 rounded border border-gray-700 font-semibold">UPI</span>
              <span className="px-2.5 py-1 bg-gray-800 rounded border border-gray-700 font-semibold">Google Pay</span>
              <span className="px-2.5 py-1 bg-gray-800 rounded border border-gray-700 font-semibold">PhonePe</span>
              <span className="px-2.5 py-1 bg-gray-800 rounded border border-gray-700 font-semibold">Paytm</span>
              <span className="px-2.5 py-1 bg-gray-800 rounded border border-gray-700 font-semibold">Cards</span>
              <span className="px-2.5 py-1 bg-gray-800 rounded border border-gray-700 font-semibold">NetBanking</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm mb-3 uppercase tracking-wider text-xs">Security Guaranteed</h4>
            <div className="p-3 bg-gray-800/80 rounded-xl border border-gray-700/60 text-xs text-gray-400 space-y-1">
              <p className="font-semibold text-gray-300">256-bit SSL Encrypted</p>
              <p className="text-[11px]">All transactions are secure & protected</p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-gray-800 py-6 px-6 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} SuperMarket Tech Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-400 cursor-pointer">Cookie Settings</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
