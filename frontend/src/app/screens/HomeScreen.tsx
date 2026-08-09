import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { MapPin, Bell, ShoppingCart, Search, ChevronRight, X, Heart, Sparkles, Filter } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import BottomNav from '../components/BottomNav';
import { products, categories } from '../data/products';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { wishlistApi } from '../../lib/api';
import { BannerCarousel, BannerItem } from '../components/BannerCarousel';

export default function HomeScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart, getCartCount, toggleWishlist, isInWishlist } = useCart();
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Pre-select category from URL query param (e.g. from CategoriesScreen)
  useEffect(() => {
    const cat = searchParams.get('category');
    const search = searchParams.get('search');

    if (cat) {
      setActiveCategory(cat);
    } else {
      setActiveCategory('all');
    }

    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      navigate('/home', { replace: true });
    } else {
      navigate(`/home?category=${encodeURIComponent(catId)}`, { replace: true });
    }
  };

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setAddedProducts(prev => new Set(prev).add(product.id));
  };

  const handleToggleWishlist = async (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleWishlist(product);
  };

  const filteredProducts = useMemo(() => {
    let list = products;
    if (activeCategory !== 'all') {
      list = list.filter(p => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          (p.brand?.toLowerCase().includes(q) ?? false) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  const homeBanners: BannerItem[] = [
    {
      id: 'fresh-deals',
      badge: '🔥 Hot Offer',
      title: 'Fresh Deals!',
      subtitle: 'Up to 30% off on staples & dairy',
      buttonText: 'Shop Now →',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
      gradient: 'linear-gradient(100deg, rgba(230,115,0,0.92) 45%, rgba(230,115,0,0.3) 100%)',
      buttonTextColor: '#ea580c',
      onClick: () => navigate('/home'),
    },
    {
      id: 'free-delivery',
      badge: '🚚 Fast Delivery',
      title: 'Free Delivery',
      subtitle: 'On orders above ₹299',
      buttonText: 'Order Now →',
      image: 'https://images.unsplash.com/photo-1601598851547-4302969d0614?w=600&q=80',
      gradient: 'linear-gradient(100deg, rgba(21,101,32,0.92) 45%, rgba(21,101,32,0.3) 100%)',
      buttonTextColor: '#15803d',
      onClick: () => navigate('/cart'),
    },
    {
      id: 'all-products',
      badge: '🛒 All Categories',
      title: '125+ Products',
      subtitle: 'Staples, Dairy & Beverages',
      buttonText: 'Explore All →',
      image: 'https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=600&q=80',
      gradient: 'linear-gradient(100deg, rgba(72,52,212,0.92) 45%, rgba(72,52,212,0.3) 100%)',
      buttonTextColor: '#6d28d9',
      onClick: () => navigate('/categories'),
    },
    {
      id: 'daily-essentials',
      badge: '⭐ Top Picks',
      title: 'Daily Essentials',
      subtitle: 'Dairy, snacks & beverages',
      buttonText: 'View Offers →',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&q=80',
      gradient: 'linear-gradient(100deg, rgba(198,40,40,0.90) 45%, rgba(198,40,40,0.25) 100%)',
      buttonTextColor: '#dc2626',
      onClick: () => navigate('/home?category=Dairy%20%26%20Breakfast'),
    },
  ];

  return (
    <div className="min-h-screen bg-white lg:bg-gray-50/50 pb-24 lg:pb-12">
      {/* Mobile Top Header (Hidden on Desktop) */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: '#FF9933' }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Delivering to</p>
              <p className="font-semibold text-sm truncate">Thiruvaiyaru, Thanjavur</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
          <div className="flex items-center gap-1 ml-3">
            <button className="p-2 relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button onClick={() => navigate('/cart')} className="p-2 relative">
              <ShoppingCart className="w-6 h-6 text-gray-600" />
              {getCartCount() > 0 && (
                <span
                  className="absolute top-0 right-0 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                  style={{ backgroundColor: '#FF9933' }}
                >
                  {getCartCount()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search 'Atta', 'Tata Tea', 'Amul'…"
            className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 rounded-lg text-sm"
          />
          {isSearching && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 lg:max-w-7xl lg:mx-auto lg:px-6 lg:py-6">
        {/* Promotional Banners Carousel — hidden while searching */}
        {!isSearching && (
          <BannerCarousel banners={homeBanners} autoplayInterval={4500} />
        )}

        {/* Mobile Category Chips (Hidden on Desktop) */}
        {!isSearching && (
          <div className="my-4 -mx-4 px-4 overflow-x-auto no-scrollbar lg:hidden">
            <div className="flex gap-2" style={{ width: 'max-content' }}>
              {categories.map(cat => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border"
                    style={{
                      backgroundColor: isActive ? '#FF9933' : '#F9F9F9',
                      color: isActive ? '#fff' : '#374151',
                      borderColor: isActive ? '#FF9933' : '#E5E7EB',
                    }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Desktop Main Grid Layout (Sidebar + Product Showcase) */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:mt-6">
          
          {/* Desktop Left Sidebar Filters & Categories */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs sticky top-36">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-gray-100">
                <Filter className="w-4 h-4 text-orange-500" />
                <h3 className="font-bold text-gray-900 text-sm">Categories</h3>
              </div>
              <ul className="space-y-1.5">
                <li>
                  <button
                    onClick={() => handleSelectCategory('all')}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      activeCategory === 'all'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100/80'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🛍️</span>
                      <span>All Products</span>
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      activeCategory === 'all' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {products.length}
                    </span>
                  </button>
                </li>
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  const catCount = products.filter(p => p.category === cat.id).length;
                  return (
                    <li key={cat.id}>
                      <button
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                          isActive
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100/80'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span className="truncate">{cat.name}</span>
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {catCount}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Quick Promotional Box inside sidebar */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white text-xs space-y-2">
                <span className="inline-block px-2 py-0.5 bg-white/20 rounded font-bold text-[10px] uppercase tracking-wider">
                  Special Offer
                </span>
                <p className="font-extrabold text-sm leading-tight">Get 10% Extra Cashback</p>
                <p className="text-orange-100 text-[11px]">On your first grocery order via UPI payment</p>
              </div>
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <main className="lg:col-span-9">
            {/* Product count / heading */}
            <div className="flex items-center justify-between mb-4 mt-2 bg-white lg:bg-transparent p-2 lg:p-0 rounded-xl">
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {isSearching
                    ? `Results for "${searchQuery}"`
                    : activeCategory === 'all'
                      ? 'All Grocery Products'
                      : activeCategory}
                </h3>
                <p className="text-xs text-gray-500 hidden lg:block">Freshly picked and delivered to your doorstep in minutes</p>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                {filteredProducts.length} items
              </span>
            </div>

            {/* Product List */}
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 p-8">
                <div className="text-5xl mb-4">🔍</div>
                <p className="font-semibold text-gray-700">No products found</p>
                <p className="text-sm text-gray-400 mt-1">Try a different search or category</p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="mt-4 text-sm font-medium text-orange-500 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-3 xl:grid-cols-4 lg:gap-5 mb-6">
                {filteredProducts.map(product => {
                  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
                  const added = addedProducts.has(product.id);
                  return (
                    <Card
                      key={product.id}
                      className="rounded-xl lg:rounded-2xl overflow-hidden border border-gray-100 lg:border-gray-200/80 cursor-pointer hover:shadow-lg transition-all duration-200 bg-white group lg:flex lg:flex-col lg:justify-between"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <div className="flex lg:flex-col gap-3 p-3 lg:p-4 h-full">
                        {/* Image container */}
                        <div className="w-24 h-24 lg:w-full lg:h-44 flex-shrink-0 rounded-lg lg:rounded-xl overflow-hidden bg-gray-50 relative group">
                          <ImageWithFallback
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {discount > 0 && (
                            <Badge
                              className="hidden lg:flex absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 bg-green-600 text-white rounded-md shadow-xs"
                            >
                              {discount}% OFF
                            </Badge>
                          )}
                          <button
                            type="button"
                            onClick={e => handleToggleWishlist(product, e)}
                            aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                            className="absolute top-1 right-1 lg:top-2 lg:right-2 w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-110"
                            style={{
                              backgroundColor: isInWishlist(product.id) ? '#FFEEF2' : 'rgba(255,255,255,0.95)',
                              color: isInWishlist(product.id) ? '#E11D48' : '#6b7280',
                            }}
                          >
                            <Heart
                              className="w-4 h-4"
                              fill={isInWishlist(product.id) ? 'currentColor' : 'none'}
                              strokeWidth={2}
                            />
                          </button>
                        </div>

                        {/* Content details */}
                        <div className="flex-1 min-w-0 lg:flex lg:flex-col lg:justify-between lg:mt-2">
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-semibold text-sm leading-snug line-clamp-2 flex-1 text-gray-900 group-hover:text-orange-600 transition-colors">
                                {product.name}
                              </h4>
                              {discount > 0 && (
                                <Badge
                                  className="lg:hidden text-xs px-1.5 py-0.5 flex-shrink-0 ml-1"
                                  style={{ backgroundColor: '#E8F5E9', color: '#228B22' }}
                                >
                                  {discount}% off
                                </Badge>
                              )}
                            </div>
                            {product.brand && (
                              <p className="text-xs text-gray-400 mt-0.5 font-medium">{product.brand}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-0.5">{product.weight}</p>
                          </div>

                          {/* Price & Action */}
                          <div className="flex items-center justify-between mt-2 lg:mt-4 lg:pt-3 lg:border-t lg:border-gray-100">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-bold text-base lg:text-lg text-gray-900">₹{product.price}</span>
                              {product.mrp > product.price && (
                                <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                              )}
                            </div>
                            <Button
                              onClick={e => handleAddToCart(product, e)}
                              className="h-8 lg:h-9 px-4 rounded-lg text-xs font-bold tracking-wide transition-all shadow-xs"
                              style={{ backgroundColor: added ? '#228B22' : '#FF9933' }}
                            >
                              {added ? '✓ ADDED' : '+ ADD'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </main>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
