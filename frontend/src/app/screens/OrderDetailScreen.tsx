import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Star } from 'lucide-react';
import { ordersApi, reviewsApi, ApiOrder, ApiOrderItem } from '../../lib/api';

export default function OrderDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="p-4">Loading order...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!order) return <div className="p-4">Order not found.</div>;

  const itemSubtotal = order.items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Order #{order.id}</h2>
        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <Card className="p-4 mb-3">
        <p className="text-sm text-gray-500">Placed: {new Date(order.createdAt).toLocaleString()}</p>
        <p className="mt-2 font-medium">Status: <span className="font-semibold">{order.status}</span></p>
        <p className="mt-2">Payment: {order.paymentMethod}{order.paymentId ? ` · ${order.paymentId}` : ''}</p>
      </Card>

      <Card className="p-4 mb-3">
        <h3 className="font-medium mb-2">Delivery Address</h3>
        {order.address ? (
          <div className="text-sm text-gray-700">
            <div className="font-medium">{order.address.label}</div>
            <div>{order.address.line1}</div>
            <div>{order.address.city}, {order.address.state} · {order.address.pincode}</div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No address available</p>
        )}
      </Card>

      <Card className="p-4 mb-3">
        <h3 className="font-medium mb-2">Items</h3>
        <div className="space-y-3">
          {order.items.map((it) => (
            <div key={it.productId} className="flex flex-col gap-2 border-b last:border-0 pb-3 last:pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{it.productName}</div>
                  <div className="text-xs text-gray-500">{it.weight} · Qty {it.quantity}</div>
                </div>
                <div className="text-right">
                  <div>₹{(it.price * it.quantity).toFixed(2)}</div>
                  <div className="text-xs text-gray-500">₹{it.price.toFixed(2)} each</div>
                </div>
              </div>
              {order.status === 'Delivered' && (
                <button
                  onClick={() => {
                    setReviewingItem(it);
                    setReviewRating(5);
                    setReviewComment('');
                    setReviewError('');
                    setReviewSuccess('');
                  }}
                  className="text-xs text-[#FF9933] font-medium self-start flex items-center gap-1"
                >
                  <Star className="w-3 h-3" /> Write a Review
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Subtotal</div>
          <div className="font-medium">₹{itemSubtotal.toFixed(2)}</div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm text-gray-600">Delivery</div>
          <div className="font-medium" style={{ color: order.deliveryFee === 0 ? '#16a34a' : 'inherit' }}>
            {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee.toFixed(2)}`}
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 border-t pt-3 font-bold">
          <div className="text-sm text-gray-900">Total</div>
          <div className="text-base text-gray-900">₹{order.total.toFixed(2)}</div>
        </div>
      </Card>

      <div className="space-y-3">
        <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
      </div>

      <Dialog open={!!reviewingItem} onOpenChange={(open) => !open && setReviewingItem(null)}>
        <DialogContent className="rounded-2xl max-w-[340px]">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              How did you like {reviewingItem?.productName}?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 flex flex-col items-center gap-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setReviewRating(star)}>
                  <Star
                    className={`w-8 h-8 ${reviewRating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>

            <textarea
              className="w-full border rounded-xl p-3 text-sm min-h-[80px]"
              placeholder="Tell us more about it (optional)"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />

            {reviewError && <p className="text-xs text-red-500">{reviewError}</p>}
            {reviewSuccess && <p className="text-xs text-green-600 font-medium">{reviewSuccess}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewingItem(null)}>Cancel</Button>
            <Button
              style={{ backgroundColor: '#FF9933' }}
              disabled={submittingReview || !!reviewSuccess}
              onClick={async () => {
                if (!reviewingItem) return;
                setSubmittingReview(true);
                setReviewError('');
                const res = await reviewsApi.add({
                  productId: reviewingItem.productId,
                  rating: reviewRating,
                  comment: reviewComment,
                });
                setSubmittingReview(false);
                if (res.error) setReviewError(res.error);
                else setReviewSuccess('Review submitted successfully!');
              }}
            >
              {submittingReview ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
