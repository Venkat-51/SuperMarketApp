import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import { wishlistApi, type ApiProduct } from '../../lib/api';

type WishlistItem = {
  productId: number;
  product: ApiProduct;
  addedAt: string;
};

export default function WishlistScreen() {
  const navigate = useNavigate();
  const { addToCart, wishlistIds, toggleWishlist, isAuthenticated } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadWishlist = async () => {
      setLoading(true);
      if (isAuthenticated) {
        const res = await wishlistApi.get();
        if (mounted) {
          if (res.error) {
            setError(res.error);
            setItems([]);
          } else {
            setItems((res.data ?? []) as WishlistItem[]);
            setError('');
          }
        }
      } else {
        // Guest user: construct items array from local product dataset using wishlistIds
        const guestItems: WishlistItem[] = Array.from(wishlistIds).map(idStr => {
          const pid = Number(idStr);
          const found = products.find(p => p.id === idStr);
          const apiProd: ApiProduct = found ? {
            id: pid,
            name: found.name,
            brand: found.brand,
            imageUrl: found.image,
            price: found.price,
            mrp: found.mrp,
            weight: found.weight,
            category: found.category,
            inStock: found.inStock,
            discountPercent: found.mrp > found.price ? Math.round(((found.mrp - found.price) / found.mrp) * 100) : 0,
          } : {
            id: pid,
            name: `Product #${pid}`,
            brand: 'SuperMarket',
            imageUrl: '',
            price: 50,
            mrp: 60,
            weight: '1 unit',
            category: 'General',
            inStock: true,
            discountPercent: 0,
          };

          return {
            productId: pid,
            product: apiProd,
            addedAt: new Date().toISOString(),
          };
        });

        if (mounted) {
          setItems(guestItems);
          setError('');
        }
      }
      if (mounted) setLoading(false);
    };

    loadWishlist();

    return () => { mounted = false; };
  }, [wishlistIds, isAuthenticated]);

  const handleRemove = async (productId: number) => {
    setUpdatingId(productId);
    await toggleWishlist({ id: productId });
    setUpdatingId(null);
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
      inStock: product.inStock,
    }, 1);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-16">
      {/* Mobile Header (Hidden on Desktop) */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 lg:hidden">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-700">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="font-bold text-lg text-gray-900">Wishlist</h2>
          <p className="text-xs text-gray-500">Saved products you can revisit anytime</p>
        </div>
      </div>

      <div className="px-4 pt-4 lg:max-w-7xl lg:mx-auto lg:px-6 lg:py-8">
        
        {/* Desktop Title Header */}
        <div className="hidden lg:flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
              <span>My Wishlist ({items.length})</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Saved items to purchase later or monitor price drops</p>
          </div>
          <Button
            onClick={() => navigate('/home')}
            variant="outline"
            className="text-xs font-bold text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            + Explore Products
          </Button>
        </div>

        {loading && <p className="text-sm text-gray-500 font-semibold p-4">Loading your wishlist...</p>}

        {!loading && items.length === 0 && (
          <Card className="rounded-2xl border border-gray-200/80 bg-white p-8 text-center max-w-md mx-auto shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center mb-4 text-rose-500">
              <Heart className="w-8 h-8" fill="currentColor" />
            </div>
            <p className="font-extrabold text-gray-900 text-lg">
              {error ? 'Please log in to view your wishlist' : 'Your wishlist is empty'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {error ? 'Log in with your email & OTP to view your saved items.' : 'Tap the heart icon on any product card to save it here.'}
            </p>
            <Button
              onClick={() => navigate(error ? '/login' : '/home', { state: error ? { from: '/wishlist' } : undefined })}
              className="mt-6 rounded-xl h-11 px-8 font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md"
            >
              {error ? 'Log In / Register' : 'Browse Products'}
            </Button>
          </Card>
        )}

        {items.length > 0 && (
          <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
            {items.map((item) => {
              const product = item.product;
              const localProd = products.find(p => String(p.id) === String(product.id) || p.name.toLowerCase() === product.name.toLowerCase());
              const displayImage = localProd?.image || product.imageUrl;

              const discount = product.mrp > product.price
                ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                : 0;

              return (
                <Card
                  key={item.productId}
                  className="rounded-2xl border border-gray-100 lg:border-gray-200/80 bg-white overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <button
                    onClick={() => navigate(`/product/${item.productId}`)}
                    className="w-full text-left p-3 lg:p-4 flex lg:flex-col gap-3 lg:gap-4"
                  >
                    <div className="w-24 h-24 lg:w-full lg:h-44 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 relative">
                      <ImageWithFallback
                        src={displayImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {discount > 0 && (
                        <span className="hidden lg:inline-block absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-md bg-green-600 text-white shadow-xs">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 lg:flex lg:flex-col lg:justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm leading-snug line-clamp-2 flex-1 text-gray-900 group-hover:text-orange-600 transition-colors">
                            {product.name}
                          </h3>
                          {discount > 0 && (
                            <span className="lg:hidden text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E8F5E9', color: '#228B22' }}>
                              {discount}% off
                            </span>
                          )}
                        </div>
                        {product.brand && <p className="text-xs text-gray-400 mt-0.5 font-medium">{product.brand}</p>}
                        <p className="text-xs text-gray-500 mt-0.5">{product.weight}</p>
                      </div>

                      <div className="flex items-center gap-2 mt-2 lg:mt-3">
                        <span className="font-bold text-base lg:text-lg text-gray-900">₹{product.price}</span>
                        {product.mrp > product.price && (
                          <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                        )}
                      </div>
                    </div>
                  </button>

                  <div className="border-t border-gray-100 p-3 lg:p-4 flex items-center gap-2 bg-gray-50/50">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 h-10 rounded-xl font-bold text-xs bg-orange-500 hover:bg-orange-600 text-white shadow-xs"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1.5" />
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRemove(item.productId)}
                      disabled={updatingId === item.productId}
                      className="h-10 rounded-xl px-3 hover:bg-rose-50 border-gray-200"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
