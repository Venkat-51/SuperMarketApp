import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Minus, Plus, Star, Heart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { reviewsApi, wishlistApi, ApiReview } from '../../lib/api';

export default function ProductDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState(0);
  const [selectedImg, setSelectedImg] = useState(0);
  const [imgFading, setImgFading] = useState(false);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const product = products.find((p) => p.id === id);

  useEffect(() => {
    let mounted = true;
    if (product) {
      reviewsApi.getForProduct(product.id).then((res) => {
        if (mounted && res.data) setReviews(res.data);
      });
    }
    return () => { mounted = false; };
  }, [product?.id]);

  useEffect(() => {
    let mounted = true;

    wishlistApi.get().then((result) => {
      if (!mounted || !result.data) return;
      setWishlistIds(new Set(result.data.map((item) => String(item.productId))));
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!product) {
    return <div>Product not found</div>;
  }

  // Build gallery using real alternate images if provided, else CSS-crop fallback
  const hasRealImages = product.images && product.images.length >= 3;
  const gallery = hasRealImages
    ? [product.image, product.images![1], product.images![2]]
    : [product.image, product.image, product.image];

  // CSS transforms for fallback (3 × same image, different crop/zoom)
  const galleryTransforms = [
    { objectPosition: 'center center', transform: 'scale(1)' },
    { objectPosition: 'center top',    transform: 'scale(1.18)' },
    { objectPosition: 'center bottom', transform: 'scale(1.18)' },
  ];

  const handleSelectImg = (idx: number) => {
    if (idx === selectedImg) return;
    setImgFading(true);
    setTimeout(() => {
      setSelectedImg(idx);
      setImgFading(false);
    }, 180);
  };

  const weightOptions = [product.weight, '1 kg', '2 kg', '5 kg'];
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  const handleToggleWishlist = async () => {
    const productId = Number(product.id);
    const isWishlisted = wishlistIds.has(product.id);

    setWishlistIds((current) => {
      const next = new Set(current);
      if (isWishlisted) {
        next.delete(product.id);
      } else {
        next.add(product.id);
      }
      return next;
    });

    const result = isWishlisted
      ? await wishlistApi.remove(productId)
      : await wishlistApi.add(productId);

    if (result.error) {
      setWishlistIds((current) => {
        const next = new Set(current);
        if (isWishlisted) {
          next.add(product.id);
        } else {
          next.delete(product.id);
        }
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="font-medium">Product Details</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Main Product Image */}
        <div className="w-full h-72 bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
          <div
            style={{
              opacity: imgFading ? 0 : 1,
              transform: imgFading ? 'scale(0.97)' : 'scale(1)',
              transition: 'opacity 0.18s ease, transform 0.18s ease',
              width: '100%',
              height: '100%',
            }}
          >
            <ImageWithFallback
              src={gallery[selectedImg]}
              alt={product.name}
              className="w-full h-full object-cover rounded-xl"
              style={hasRealImages ? {} : {
                objectPosition: galleryTransforms[selectedImg].objectPosition,
                transform: galleryTransforms[selectedImg].transform,
                transition: 'object-position 0.18s ease, transform 0.18s ease',
              }}
            />
          </div>

          {/* Discount badge overlay */}
          {discount > 0 && (
            <div
              className="absolute top-4 right-4 px-2 py-1 rounded-lg text-xs font-bold text-white"
              style={{ backgroundColor: '#228B22' }}
            >
              {discount}% OFF
            </div>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {gallery.length > 1 && (
          <div className="flex gap-3 px-4 pt-3 pb-1 justify-center">
            {gallery.map((img, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectImg(idx)}
                className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all"
                style={{
                  border: selectedImg === idx ? '2.5px solid #FF9933' : '2px solid #E5E7EB',
                  boxShadow: selectedImg === idx ? '0 0 0 2px rgba(255,153,51,0.2)' : 'none',
                  transform: selectedImg === idx ? 'scale(1.07)' : 'scale(1)',
                  transition: 'border 0.15s, box-shadow 0.15s, transform 0.15s',
                }}
                aria-label={`View image ${idx + 1}`}
              >
                <ImageWithFallback
                  src={img}
                  alt={`${product.name} view ${idx + 1}`}
                  className="w-full h-full object-cover"
                  style={hasRealImages ? {} : {
                    objectPosition: galleryTransforms[idx].objectPosition,
                    transform: galleryTransforms[idx].transform,
                  }}
                />
              </button>
            ))}
          </div>
        )}

        <div className="px-4 py-4">
          {/* Product Info */}
          <div className="mb-4">
            {product.brand && (
              <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
            )}
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-xl font-bold flex-1">{product.name}</h1>
              <button
                type="button"
                onClick={handleToggleWishlist}
                aria-label={wishlistIds.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border"
                style={{
                  backgroundColor: wishlistIds.has(product.id) ? '#FFEEF2' : '#fff',
                  color: wishlistIds.has(product.id) ? '#E11D48' : '#6b7280',
                  borderColor: wishlistIds.has(product.id) ? '#fecdd3' : '#e5e7eb',
                }}
              >
                <Heart
                  className="w-5 h-5"
                  fill={wishlistIds.has(product.id) ? 'currentColor' : 'none'}
                  strokeWidth={2}
                />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {reviews.length > 0
                    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                    : '5.0'}
                </span>
                <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
              </div>
            </div>
          </div>

          {/* Weight Options */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Select Weight</p>
            <div className="flex gap-2 flex-wrap">
              {weightOptions.map((weight, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedWeight(index)}
                  className="px-4 py-2 rounded-lg border font-medium text-sm transition-all"
                  style={{
                    borderColor: selectedWeight === index ? '#FF9933' : '#E5E7EB',
                    backgroundColor: selectedWeight === index ? '#FFF5EB' : 'white',
                    color: selectedWeight === index ? '#FF9933' : '#374151',
                  }}
                >
                  {weight}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-4">
            <Badge
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: '#E8F5E9', color: '#228B22' }}
            >
              ✓ In Stock
            </Badge>
          </div>

          {/* Quantity Selector */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-bold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: '#FF9933' }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product Description */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Product Details</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Premium quality {product.name.toLowerCase()} sourced from trusted suppliers.
              Perfect for daily cooking needs. Store in a cool, dry place.
            </p>
          </div>

          {/* Why Choose This */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFF5EB' }}>
            <h3 className="font-medium mb-3">Why Choose This?</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>100% Quality Guaranteed</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Fresh and Hygienic</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Best Price Guarantee</span>
              </li>
            </ul>
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-4 mb-4">
            <h3 className="font-medium mb-3">Customer Reviews</h3>
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{r.userName}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 safe-area-inset-bottom">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500">Total Price</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">₹{product.price * quantity}</span>
              <span className="text-sm text-gray-400 line-through">₹{product.mrp * quantity}</span>
              <Badge className="bg-green-100 text-green-700 text-xs">{discount}% OFF</Badge>
            </div>
          </div>
        </div>
        <Button
          onClick={handleAddToCart}
          className="w-full h-12 rounded-lg font-bold"
          style={{ backgroundColor: '#FF9933' }}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
