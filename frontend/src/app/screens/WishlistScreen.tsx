import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { wishlistApi, type ApiProduct } from '../../lib/api';

type WishlistItem = {
  productId: number;
  product: ApiProduct;
  addedAt: string;
};

export default function WishlistScreen() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchWishlist = async () => {
    setLoading(true);
    const res = await wishlistApi.get();
    if (res.error) {
      setError(res.error);
      setItems([]);
    } else {
      setItems((res.data ?? []) as WishlistItem[]);
      setError('');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: number) => {
    setUpdatingId(productId);
    const res = await wishlistApi.remove(productId);
    setUpdatingId(null);

    if (res.error) {
      setError(res.error);
      return;
    }

    setItems((current) => current.filter((item) => item.productId !== productId));
  };

  const handleAddToCart = (product: ApiProduct) => {
    addToCart({
      id: String(product.id),
      name: product.name,
      brand: product.brand,
      image: product.imageUrl,
      price: product.price,
      mrp: product.mrp,
      weight: product.weight,
      category: product.category,
      quantity: 1,
    });
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div
        className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3"
      >
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="font-bold text-lg">Wishlist</h2>
          <p className="text-xs text-gray-500">Saved products you can revisit anytime</p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {loading && <p className="text-sm text-gray-500">Loading wishlist...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && items.length === 0 && !error && (
          <Card className="rounded-2xl border border-gray-100 bg-white p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-pink-50 flex items-center justify-center mb-3">
              <Heart className="w-7 h-7 text-pink-500" fill="currentColor" />
            </div>
            <p className="font-semibold text-gray-900">Your wishlist is empty</p>
            <p className="text-sm text-gray-500 mt-1">Tap the heart on a product to save it here.</p>
            <Button
              onClick={() => navigate('/home')}
              className="mt-4 rounded-lg"
              style={{ backgroundColor: '#FF9933' }}
            >
              Browse products
            </Button>
          </Card>
        )}

        {items.map((item) => {
          const product = item.product;
          const discount = product.mrp > product.price
            ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
            : 0;

          return (
            <Card
              key={item.productId}
              className="rounded-2xl border border-gray-100 bg-white overflow-hidden"
            >
              <button
                onClick={() => navigate(`/product/${item.productId}`)}
                className="w-full text-left p-3 flex gap-3"
              >
                <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                  <ImageWithFallback
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 flex-1">{product.name}</h3>
                    {discount > 0 && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E8F5E9', color: '#228B22' }}>
                        {discount}% off
                      </span>
                    )}
                  </div>
                  {product.brand && <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>}
                  <p className="text-xs text-gray-500 mt-0.5">{product.weight}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-base">₹{product.price}</span>
                    {product.mrp > product.price && (
                      <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                    )}
                  </div>
                </div>
              </button>

              <div className="border-t border-gray-100 p-3 flex items-center gap-2">
                <Button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 h-10 rounded-lg font-bold"
                  style={{ backgroundColor: '#FF9933' }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to cart
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRemove(item.productId)}
                  disabled={updatingId === item.productId}
                  className="h-10 rounded-lg px-3"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
