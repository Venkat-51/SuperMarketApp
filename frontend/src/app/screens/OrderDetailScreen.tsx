import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Star, Package, ArrowLeft, CheckCircle2, Clock, MapPin, CreditCard, Download } from 'lucide-react';
import { ordersApi, reviewsApi, authApi, ApiOrder, ApiOrderItem } from '../../lib/api';
import { generateInvoicePDF } from '../../lib/invoiceGenerator';

export default function OrderDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | undefined>();
  const [userPhone, setUserPhone] = useState<string | undefined>();

  const [reviewingItem, setReviewingItem] = useState<ApiOrderItem | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    const orderId = Number(id);

    ordersApi.get(orderId).then((res) => {
      if (!mounted) return;
      if (res.error) setError(res.error);
      else setOrder(res.data ?? null);
      setLoading(false);
    });

    authApi.me().then((res) => {
      if (!mounted) return;
      if (!res.error && res.data) {
        setUserName(res.data.name);
        setUserPhone(res.data.phone);
      }
    });

    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500 font-semibold">Loading order details...</div>;
  if (error) return <div className="p-8 text-center text-rose-600 font-semibold">{error}</div>;
  if (!order) return <div className="p-8 text-center text-gray-500 font-semibold">Order not found.</div>;

  const itemSubtotal = order.items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const handleDownloadInvoice = () => {
    if (!order) return;
    generateInvoicePDF({
      orderId: order.id,
      date: new Date(order.createdAt).toLocaleDateString(),
      customerName: userName,
      customerPhone: userPhone,
      address: order.address,
      paymentMethod: order.paymentMethod,
      paymentId: order.paymentId,
      items: order.items.map((i) => ({
        name: i.productName,
        quantity: i.quantity,
        price: i.price,
      })),
      itemSubtotal,
      deliveryFee: order.deliveryFee || (order.total - itemSubtotal),
      total: order.total,
    });
  };

  const handleOpenReview = (item: ApiOrderItem) => {
    setReviewingItem(item);
    setReviewRating(5);
    setReviewComment('');
    setReviewError('');
    setReviewSuccess('');
  };

  const handleSaveReview = async () => {
    if (!reviewingItem) return;
    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    const res = await reviewsApi.add({
      productId: reviewingItem.productId,
      rating: reviewRating,
      comment: reviewComment,
    });

    setSubmittingReview(false);

    if (res.error) {
      setReviewError(res.error);
    } else {
      setReviewSuccess('Thank you! Review submitted.');
      setTimeout(() => {
        setReviewingItem(null);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-16 px-4 pt-4 lg:pt-8">
      
      <div className="max-w-4xl mx-auto">
        {/* Desktop Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl lg:text-2xl font-black text-gray-900">Order #{order.id}</h1>
              <p className="text-xs text-gray-500 mt-0.5">Placed on {new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleDownloadInvoice}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download Invoice</span>
            </Button>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{order.status}</span>
            </span>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: Items */}
          <div className="lg:col-span-7 space-y-4 mb-4 lg:mb-0">
            <Card className="p-5 rounded-2xl border border-gray-200/80 bg-white shadow-xs">
              <h3 className="font-bold text-gray-900 text-sm mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                <span>Items Ordered</span>
                <span className="text-xs text-gray-400">{order.items.length} items</span>
              </h3>

              <div className="divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <div key={item.productId || idx} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 text-gray-700 font-bold text-sm">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{item.productName}</p>
                        <p className="text-xs text-gray-400">₹{item.price} per unit</p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <span className="font-bold text-gray-900 text-sm">₹{item.price * item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenReview(item)}
                        className="text-xs h-8 px-2.5 rounded-lg border-gray-200 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <Star className="w-3.5 h-3.5 mr-1 fill-yellow-400 text-yellow-400" />
                        Rate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Address & Bill details */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 rounded-2xl border border-gray-200/80 bg-white shadow-xs">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>Delivery Address</span>
              </h3>
              {order.address ? (
                <div className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <p className="font-bold text-gray-900 text-sm mb-1">{order.address.label}</p>
                  <p>{order.address.line1}</p>
                  <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400">No address recorded.</p>
              )}
            </Card>

            <Card className="p-5 rounded-2xl border border-gray-200/80 bg-white shadow-xs">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-500" />
                <span>Payment & Bill Breakdown</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{itemSubtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-gray-900">₹{(order.total - itemSubtotal).toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between font-black text-sm text-gray-900">
                  <span>Total Paid</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
                <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100 uppercase tracking-wider font-bold">
                  Payment: {order.paymentMethod.toUpperCase()} {order.paymentId ? `(${order.paymentId})` : ''}
                </p>
              </div>
            </Card>
          </div>

        </div>

      </div>

      <Dialog open={Boolean(reviewingItem)} onOpenChange={(open) => !open && setReviewingItem(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your rating for {reviewingItem?.productName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>

            <Input
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="What did you like or dislike about this item?"
              className="h-12 rounded-xl"
            />

            {reviewError && <p className="text-xs text-rose-600 font-medium">{reviewError}</p>}
            {reviewSuccess && <p className="text-xs text-emerald-600 font-bold">{reviewSuccess}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewingItem(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSaveReview}
              disabled={submittingReview}
              className="rounded-xl bg-orange-500 text-white font-bold"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
