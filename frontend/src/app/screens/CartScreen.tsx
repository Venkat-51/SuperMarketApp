import { useNavigate } from 'react-router';
import { ArrowLeft, Minus, Plus, Tag, Trash2 } from 'lucide-react';
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="font-medium">Your Cart</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-32 h-32 mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-6xl">🛒</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-6">Add items to get started</p>
          <Button
            onClick={() => navigate('/home')}
            className="rounded-lg h-12 px-8"
            style={{ backgroundColor: '#FF9933' }}
          >
            Start Shopping
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/home')} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="font-medium">
          Your Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} Items)
        </h2>
      </div>

      <div className="px-4 py-4">
        {/* Cart Items */}
        <div className="space-y-3 mb-6">
          {cartItems.map((item) => (
            <Card
              key={item.id}
              className="rounded-xl overflow-hidden border border-gray-100 p-3"
            >
              <div className="flex gap-3">
                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-sm line-clamp-2 flex-1">
                      {item.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{item.weight}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">₹{item.price * item.quantity}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: '#FF9933' }}
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

        {/* Coupon Section */}
        <Card className="rounded-xl border border-gray-100 p-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#FFF5EB' }}
            >
              <Tag className="w-5 h-5" style={{ color: '#FF9933' }} />
            </div>
            <Input
              placeholder="Enter coupon code"
              className="flex-1 border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
            />
            <Button
              variant="ghost"
              className="text-sm font-bold"
              style={{ color: '#FF9933' }}
            >
              Apply
            </Button>
          </div>
        </Card>

        {/* Bill Details */}
        <Card className="rounded-xl border border-gray-100 p-4 mb-4">
          <h3 className="font-bold mb-3">Bill Details</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Item Total</span>
              <span className="font-medium">₹{getCartTotal()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-medium" style={{ color: deliveryFee === 0 ? '#228B22' : 'inherit' }}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>
            {deliveryFee > 0 && (
              <p className="text-xs" style={{ color: '#FF9933' }}>
                Add items worth ₹{299 - getCartTotal()} more for free delivery
              </p>
            )}
            <Separator className="my-2" />
            <div className="flex items-center justify-between font-bold text-base">
              <span>Grand Total</span>
              <span>₹{grandTotal}</span>
            </div>
          </div>
        </Card>

        {/* Savings Info */}
        <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: '#E8F5E9' }}>
          <p className="text-sm font-medium" style={{ color: '#228B22' }}>
            🎉 You saved ₹
            {cartItems.reduce((sum, item) => sum + (item.mrp - item.price) * item.quantity, 0)} on
            this order!
          </p>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 bg-white border-t border-gray-200 px-4 py-4 pb-20 safe-area-inset-bottom">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-xl font-bold">₹{grandTotal}</p>
          </div>
          <Button
            onClick={() => navigate('/checkout')}
            className="h-12 px-8 rounded-lg font-bold"
            style={{ backgroundColor: '#FF9933' }}
          >
            Place Order
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
