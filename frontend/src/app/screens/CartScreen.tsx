import { useNavigate, Link } from 'react-router';
import { ArrowLeft, Minus, Plus, Tag, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import BottomNav from '../components/BottomNav';

export default function CartScreen() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();

  const deliveryFee = cartItems.length > 0 ? (getCartTotal() >= 299 ? 0 : 40) : 0;
  const grandTotal = getCartTotal() + deliveryFee;
  const totalSavings = cartItems.reduce((sum, item) => sum + (item.mrp - item.price) * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => navigate('/home')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h2 className="font-medium">Your Cart</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center lg:py-16">
          <div className="w-32 h-32 mb-6 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 shadow-inner">
            <ShoppingBag className="w-16 h-16" />
          </div>
          <h3 className="text-xl lg:text-2xl font-bold mb-2 text-gray-900">Your cart is empty</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">Looks like you haven't added any fresh groceries or daily staples yet.</p>
          <Button
            onClick={() => navigate('/home')}
            className="rounded-xl h-12 px-8 font-bold text-white shadow-md bg-orange-500 hover:bg-orange-600 transition-colors"
          >
            Start Shopping Now
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white lg:bg-gray-50/50 pb-32 lg:pb-16">
      {/* Mobile Sticky Header (Hidden on Desktop) */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 lg:hidden">
        <button onClick={() => navigate('/home')} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h2 className="font-medium text-gray-900">
          Your Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} Items)
        </h2>
      </div>

      <div className="px-4 py-4 lg:max-w-7xl lg:mx-auto lg:px-6 lg:py-8">
        
        {/* Desktop Title Header */}
        <div className="hidden lg:flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-orange-500" />
              <span>Shopping Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} Items)</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Review your selected items and proceed to instant checkout</p>
          </div>
          <Link to="/home" className="text-xs font-bold text-orange-600 hover:underline">
            + Add More Items
          </Link>
        </div>

        {/* Layout Grid */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="space-y-3 lg:space-y-4 mb-6">
              {cartItems.map((item) => (
                <Card
                  key={item.id}
                  className="rounded-xl lg:rounded-2xl overflow-hidden border border-gray-100 lg:border-gray-200/80 p-3 lg:p-4 bg-white shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-3 lg:gap-4 items-center">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-sm lg:text-base text-gray-900 line-clamp-2 flex-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors ml-2"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-3">{item.weight} • ₹{item.price} / unit</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base lg:text-lg text-gray-900">
                          ₹{item.price * item.quantity}
                        </span>
                        
                        <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-1 bg-gray-50">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg border border-gray-300 bg-white flex items-center justify-center text-gray-700 font-bold hover:bg-gray-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold w-6 text-center text-sm text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold bg-orange-500 hover:bg-orange-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column: Summary Card & Checkout Callout */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-36 space-y-4">
              
              {/* Coupon Section */}
              <Card className="rounded-xl lg:rounded-2xl border border-gray-100 lg:border-gray-200/80 p-4 bg-white shadow-xs">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#FFF5EB' }}
                  >
                    <Tag className="w-5 h-5" style={{ color: '#FF9933' }} />
                  </div>
                  <Input
                    placeholder="Enter promo / coupon code"
                    className="flex-1 border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
                  />
                  <Button
                    variant="ghost"
                    className="text-xs font-bold uppercase tracking-wider text-orange-500 hover:text-orange-600"
                  >
                    Apply
                  </Button>
                </div>
              </Card>

              {/* Bill Details */}
              <Card className="rounded-xl lg:rounded-2xl border border-gray-100 lg:border-gray-200/80 p-5 bg-white shadow-xs">
                <h3 className="font-bold text-gray-900 text-sm mb-4 pb-2 border-b border-gray-100">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Items Subtotal</span>
                    <span className="font-semibold text-gray-900">₹{getCartTotal()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-bold" style={{ color: deliveryFee === 0 ? '#228B22' : '#374151' }}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  {deliveryFee > 0 && (
                    <p className="text-xs font-medium text-orange-600 bg-orange-50 p-2 rounded-lg">
                      Add items worth ₹{299 - getCartTotal()} more to unlock FREE delivery!
                    </p>
                  )}
                  
                  {totalSavings > 0 && (
                    <div className="flex items-center justify-between text-sm text-green-700 bg-green-50 p-2.5 rounded-xl font-medium">
                      <span>Total Savings</span>
                      <span className="font-bold">₹{totalSavings}</span>
                    </div>
                  )}

                  <Separator className="my-3" />
                  
                  <div className="flex items-center justify-between text-base lg:text-lg font-black text-gray-900">
                    <span>Grand Total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>

                {/* Desktop Checkout Action Button */}
                <Button
                  onClick={() => navigate('/checkout')}
                  className="hidden lg:flex w-full h-12 mt-6 rounded-xl font-bold text-sm bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 items-center justify-center gap-2 transition-all hover:shadow-orange-500/35"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <div className="hidden lg:flex items-center justify-center gap-2 mt-4 text-[11px] text-gray-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>Safe & Secure 256-bit Encrypted Checkout</span>
                </div>
              </Card>

            </div>
          </div>

        </div>
      </div>

      {/* Fixed Bottom Button (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 px-4 py-4 safe-area-inset-bottom lg:hidden">
        <div className="flex items-center justify-between mb-3 max-w-md mx-auto">
          <div>
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-xl font-bold text-gray-900">₹{grandTotal}</p>
          </div>
          <Button
            onClick={() => navigate('/checkout')}
            className="h-12 px-8 rounded-lg font-bold bg-orange-500 text-white"
          >
            Place Order
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
