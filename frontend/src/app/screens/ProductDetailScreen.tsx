import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { ArrowLeft, Minus, Plus, Star, Heart, Truck, ShieldCheck, RefreshCw, ShoppingCart, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { products } from '../data/products';
import { useCart, Product, ProductVariant } from '../context/CartContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { reviewsApi, wishlistApi, ApiReview } from '../../lib/api';

const getProductVariants = (p: Product): ProductVariant[] => {
  if (p.variants && p.variants.length > 0) {
    return p.variants;
  }
  const weightLower = (p.weight || '').toLowerCase();
  const isVolume = p.unit_type === 'volume' || weightLower.includes('l') || weightLower.includes('ml');
  if (isVolume) {
    return [
      { size: p.weight || '1 L', price: p.price, mrp: p.mrp },
      { size: '2 L', price: Math.round(p.price * 1.95), mrp: Math.round(p.mrp * 1.95) },
      { size: '5 L', price: Math.round(p.price * 4.6), mrp: Math.round(p.mrp * 4.6) },
    ];
  } else {
    return [
      { size: p.weight || '1 kg', price: p.price, mrp: p.mrp },
      { size: '2 kg', price: Math.round(p.price * 1.95), mrp: Math.round(p.mrp * 1.95) },
      { size: '5 kg', price: Math.round(p.price * 4.6), mrp: Math.round(p.mrp * 4.6) },
    ];
  }
};

export default function ProductDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImg, setSelectedImg] = useState(0);
  const [imgFading, setImgFading] = useState(false);
  const [reviews, setReviews] = useState<ApiReview[]>([]);

  const product = products.find((p) => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedVariantIndex(0);
    setQuantity(1);
    setSelectedImg(0);
    const scrollables = document.querySelectorAll('*');
    scrollables.forEach((el) => {
      if (el.scrollTop > 0) {
        el.scrollTop = 0;
      }
    });
  }, [id]);

  useEffect(() => {
    let mounted = true;
    if (product) {
      reviewsApi.getForProduct(Number(product.id)).then((res) => {
        if (mounted && res.data) setReviews(res.data);
      });
    }
    return () => { mounted = false; };
  }, [product?.id]);

  if (!product) {
    return <div className="p-8 text-center text-gray-500 font-semibold">Product not found</div>;
  }

  const variants = getProductVariants(product);
  const selectedVariant = variants[selectedVariantIndex] || variants[0];
  const unitPrice = selectedVariant.price;
  const unitMrp = selectedVariant.mrp;
  const totalPrice = unitPrice * quantity;
  const totalMrp = unitMrp * quantity;
  const discount = unitMrp > unitPrice ? Math.round(((unitMrp - unitPrice) / unitMrp) * 100) : 0;

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

  const handleAddToCart = () => {
    addToCart(
      {
        ...product,
        price: selectedVariant.price,
        mrp: selectedVariant.mrp,
        weight: selectedVariant.size,
      },
      quantity
    );
    navigate('/cart');
  };

  const handleToggleWishlist = async () => {
    await toggleWishlist(product);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-24 lg:pb-12">
      {/* Mobile Sticky Header (Hidden on Desktop) */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 lg:hidden">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h2 className="font-medium text-gray-900">Product Details</h2>
      </div>

      {/* Desktop Breadcrumbs (Visible on Desktop) */}
      <div className="hidden lg:block bg-gray-50 border-b border-gray-200 py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Link to="/home" className="hover:text-orange-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/home?category=${encodeURIComponent(product.category)}`} className="hover:text-orange-600 transition-colors">{product.category}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-bold truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="flex-1 lg:max-w-7xl lg:mx-auto lg:w-full lg:px-6 lg:py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6">
            <div className="sticky top-32">
              <div className="w-full h-72 lg:h-[420px] bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden lg:rounded-2xl border border-gray-100 shadow-xs">
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
                    className="w-full h-full object-contain rounded-xl"
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
                    className="absolute top-4 right-4 px-3 py-1 rounded-lg text-xs font-black text-white shadow-sm"
                    style={{ backgroundColor: '#228B22' }}
                  >
                    {discount}% OFF
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {gallery.length > 1 && (
                <div className="flex gap-3 px-4 lg:px-0 pt-4 justify-center lg:justify-start">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectImg(idx)}
                      className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all bg-gray-50"
                      style={{
                        border: selectedImg === idx ? '2.5px solid #FF9933' : '2px solid #E5E7EB',
                        boxShadow: selectedImg === idx ? '0 0 0 2px rgba(255,153,51,0.2)' : 'none',
                        transform: selectedImg === idx ? 'scale(1.05)' : 'scale(1)',
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
            </div>
          </div>

          {/* Right Column: Product Information & Purchase Controls */}
          <div className="lg:col-span-6 px-4 lg:px-0 py-4 lg:py-0">
            {/* Product Header Info */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              {product.brand && (
                <span className="text-xs uppercase font-bold tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md mb-2 inline-block">
                  {product.brand}
                </span>
              )}
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-xl lg:text-3xl font-extrabold text-gray-900 leading-tight flex-1">{product.name}</h1>
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-all hover:scale-105"
                  style={{
                    backgroundColor: isInWishlist(product.id) ? '#FFEEF2' : '#fff',
                    color: isInWishlist(product.id) ? '#E11D48' : '#6b7280',
                    borderColor: isInWishlist(product.id) ? '#fecdd3' : '#e5e7eb',
                  }}
                >
                  <Heart
                    className="w-5 h-5 lg:w-6 lg:h-6"
                    fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
                    strokeWidth={2}
                  />
                </button>
              </div>

              {/* Rating & Stock */}
              <div className="flex items-center gap-4 text-sm mt-2">
                <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-lg border border-yellow-200">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-gray-900">
                    {reviews.length > 0
                      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                      : '5.0'}
                  </span>
                  <span className="text-gray-500 font-medium">({reviews.length} reviews)</span>
                </div>

                <Badge
                  className="px-3 py-1 rounded-lg text-xs font-bold"
                  style={{ backgroundColor: '#E8F5E9', color: '#228B22' }}
                >
                  ✓ In Stock & Fresh
                </Badge>
              </div>
            </div>

            {/* Desktop Price Section */}
            <div className="mb-6 p-4 lg:p-5 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-3xl lg:text-4xl font-black text-gray-900">₹{totalPrice}</span>
                {totalMrp > totalPrice && (
                  <span className="text-lg text-gray-400 line-through">₹{totalMrp}</span>
                )}
                {discount > 0 && (
                  <Badge className="bg-green-600 text-white text-xs font-bold px-2 py-0.5">
                    Save {discount}%
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium">Inclusive of all taxes • Free shipping on orders over ₹499</p>
            </div>

            {/* Weight / Size Options */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                SELECT PACK WEIGHT / SIZE
              </label>
              <div className="flex gap-2.5 flex-wrap">
                {variants.map((variant, index) => {
                  const isSelected = selectedVariantIndex === index;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedVariantIndex(index)}
                      className="px-4 py-2.5 rounded-xl border font-bold text-xs transition-all flex items-center gap-1.5"
                      style={{
                        borderColor: isSelected ? '#FF9933' : '#E5E7EB',
                        backgroundColor: isSelected ? '#FFF5EB' : 'white',
                        color: isSelected ? '#FF9933' : '#374151',
                        boxShadow: isSelected ? '0 2px 4px rgba(255,153,51,0.15)' : 'none',
                      }}
                    >
                      <span>{variant.size}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="mb-6 space-y-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-xl bg-white p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-700 font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-base font-black w-12 text-center text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="hidden lg:flex flex-1 h-12 rounded-xl font-bold text-sm bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 items-center justify-center gap-2 transition-all hover:shadow-orange-500/40"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add {quantity} to Cart • ₹{totalPrice}</span>
                </Button>
              </div>
            </div>

            {/* Desktop Trust Features */}
            <div className="grid grid-cols-3 gap-3 mb-6 p-4 rounded-2xl bg-orange-50/60 border border-orange-200/60">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-xs font-bold text-gray-800">10-15 Min Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-xs font-bold text-gray-800">Quality Checked</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="text-xs font-bold text-gray-800">Easy Doorstep Return</span>
              </div>
            </div>

            {/* Product Description */}
            <div className="mb-6 p-5 bg-white rounded-2xl border border-gray-200/80">
              <h3 className="font-bold text-gray-900 text-sm mb-2">Product Description</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Premium quality {product.name.toLowerCase()} sourced directly from verified farms and suppliers.
                Sealed for freshness and high nutritional integrity. Perfect for daily family cooking needs.
                Store in a cool, dry place after opening.
              </p>
            </div>

            {/* Customer Reviews Section */}
            <div className="mb-6 p-5 bg-white rounded-2xl border border-gray-200/80">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Customer Reviews & Ratings</h3>
              {reviews.length === 0 ? (
                <p className="text-xs text-gray-500 font-medium">No reviews yet for this item. Be the first to share your experience!</p>
              ) : (
                <div className="space-y-4 divide-y divide-gray-100">
                  {reviews.map((r) => (
                    <div key={r.id} className="pt-3 first:pt-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-gray-900">{r.userName}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 mb-1.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      {r.comment && <p className="text-xs text-gray-600 leading-relaxed">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar (Hidden on Desktop) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 safe-area-inset-bottom lg:hidden">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500">Total Price</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">₹{totalPrice}</span>
              {totalMrp > totalPrice && (
                <span className="text-sm text-gray-400 line-through">₹{totalMrp}</span>
              )}
              {discount > 0 && (
                <Badge className="bg-green-100 text-green-700 text-xs">{discount}% OFF</Badge>
              )}
            </div>
          </div>
        </div>
        <Button
          onClick={handleAddToCart}
          className="w-full h-12 rounded-lg font-bold"
          style={{ backgroundColor: '#FF9933' }}
        >
          Add {quantity} to Cart • ₹{totalPrice}
        </Button>
      </div>
    </div>
  );
}

