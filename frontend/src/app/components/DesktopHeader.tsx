import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { 
  ShoppingBag, Search, Heart, ShoppingCart, User, MapPin, 
  ChevronDown, Sparkles, X, Trash2, ArrowRight, CheckCircle2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { categories } from '../data/products';
import { wishlistApi } from '../../lib/api';

export default function DesktopHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, getCartCount, getCartTotal, removeFromCart, updateQuantity } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Indiranagar, Bengaluru - 560038');
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const cartDropdownRef = useRef<HTMLDivElement>(null);
  const cartCount = getCartCount();
  const cartTotal = getCartTotal();

  // Fetch wishlist count
  useEffect(() => {
    let mounted = true;
    wishlistApi.get().then((res) => {
      if (mounted && res.data) {
        setWishlistCount(res.data.length);
      }
    });
    return () => { mounted = false; };
  }, [location.pathname]);

  // Handle click outside cart dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/home?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const locations = [
    'Indiranagar, Bengaluru - 560038',
    'Koramangala, Bengaluru - 560034',
    'HSR Layout, Bengaluru - 560102',
    'Whitefield, Bengaluru - 560066',
    'Jayanagar, Bengaluru - 560041',
  ];

  return (
    <header className="hidden lg:block sticky top-0 z-50 bg-white border-b border-gray-200 shadow-xs">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white text-xs py-1.5 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 font-medium">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-200" />
            <span>⚡ SuperFast Delivery in <strong className="underline decoration-yellow-300">10-15 minutes</strong> | Free shipping on orders over ₹499!</span>
          </div>
          <div className="flex items-center space-x-6 text-xs">
            <span className="hover:text-yellow-100 cursor-pointer">Support: 1800-SUPER-MARKET</span>
            <span className="hover:text-yellow-100 cursor-pointer">Store Locator</span>
            <Link to="/orders" className="hover:text-yellow-100 transition-colors font-medium">Track Order</Link>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-6">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <Link to="/home" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-gray-900 leading-none block">
                Super<span className="text-orange-500">Market</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-orange-600 block mt-0.5">
                Fresh & Fast
              </span>
            </div>
          </Link>

          {/* Location Picker */}
          <div className="relative">
            <button
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-orange-300 bg-gray-50/80 hover:bg-orange-50/50 transition-all text-left"
            >
              <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <div className="text-xs">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Delivery to</div>
                <div className="font-bold text-gray-800 max-w-[140px] truncate">{selectedLocation.split(',')[0]}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {isLocationOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50">
                <div className="text-xs font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">Select Location</div>
                {locations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setIsLocationOpen(false);
                    }}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      selectedLocation === loc ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span>{loc}</span>
                    {selectedLocation === loc && <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for fresh vegetables, fruits, ghee, milk, snacks..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-100/80 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-orange-400 rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-orange-500/10 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Desktop User Actions (Wishlist, Cart, Profile) */}
        <div className="flex items-center space-x-3">
          
          {/* Wishlist Button */}
          <Link
            to="/wishlist"
            className="flex flex-col items-center justify-center w-11 h-11 rounded-xl text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors relative group"
            title="Wishlist"
          >
            <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Dropdown Button */}
          <div className="relative" ref={cartDropdownRef}>
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-md shadow-orange-500/20 transition-all hover:shadow-lg hover:shadow-orange-500/30"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 w-4 h-4 bg-white text-orange-600 rounded-full text-[10px] font-bold flex items-center justify-center border border-orange-500">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="text-left hidden xl:block">
                <div className="text-[10px] uppercase tracking-wider text-orange-100 font-bold">My Cart</div>
                <div className="text-xs font-black">₹{cartTotal.toLocaleString('en-IN')}</div>
              </div>
            </button>

            {/* Quick Mini Cart Dropdown Panel */}
            {isCartOpen && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span className="font-bold text-sm">Shopping Cart ({cartCount} items)</span>
                  </div>
                  <button onClick={() => setIsCartOpen(false)} className="text-white/80 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                    <p className="text-gray-800 font-semibold text-sm">Your cart is empty</p>
                    <p className="text-gray-400 text-xs mt-1">Add items to get started with your order</p>
                  </div>
                ) : (
                  <>
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 p-2">
                      {cart.map((item) => (
                        <div key={item.id} className="p-2.5 flex items-center gap-3 hover:bg-gray-50 rounded-xl transition-colors">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-contain bg-gray-50 border border-gray-100 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                            <p className="text-[11px] text-gray-500">{item.weight} • ₹{item.price}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-5 h-5 rounded border border-gray-300 text-xs flex items-center justify-center hover:bg-gray-200 font-bold"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold text-gray-700">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-5 h-5 rounded border border-gray-300 text-xs flex items-center justify-center hover:bg-gray-200 font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs font-bold text-gray-900">₹{item.price * item.quantity}</div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-gray-500 font-medium">Subtotal</span>
                        <span className="text-base font-black text-gray-900">₹{cartTotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to="/cart"
                          onClick={() => setIsCartOpen(false)}
                          className="w-full py-2 px-3 text-center border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          View Full Cart
                        </Link>
                        <Link
                          to="/checkout"
                          onClick={() => setIsCartOpen(false)}
                          className="w-full py-2 px-3 text-center bg-orange-500 hover:bg-orange-600 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1 transition-colors"
                        >
                          Checkout <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* User Account Profile */}
          <Link
            to="/account"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-200"
          >
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-[10px] uppercase font-semibold text-gray-400 block leading-tight">Account</span>
              <span className="text-xs font-bold text-gray-800 block leading-tight">My Profile</span>
            </div>
          </Link>

        </div>
      </div>

      {/* Category Navigation Bar */}
      <div className="bg-gray-50 border-t border-gray-200/80 px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs overflow-x-auto no-scrollbar gap-4">
          <div className="flex items-center gap-1 font-semibold text-gray-700">
            <Link
              to="/categories"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-xs"
            >
              <span>All Categories</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </Link>

            {categories.slice(0, 7).map((cat) => {
              const isActive = location.search.includes(encodeURIComponent(cat.id));
              return (
                <Link
                  key={cat.id}
                  to={`/home?category=${encodeURIComponent(cat.id)}`}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-orange-100 text-orange-700 font-bold'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-white'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-gray-500 font-medium whitespace-nowrap">
            <Link to="/home?category=Staples" className="hover:text-orange-600 transition-colors">🔥 Daily Deals</Link>
            <Link to="/home?category=Dairy%20%26%20Breakfast" className="hover:text-orange-600 transition-colors">🥛 Fresh Milk</Link>
            <Link to="/wishlist" className="hover:text-orange-600 transition-colors">❤️ Wishlist</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
