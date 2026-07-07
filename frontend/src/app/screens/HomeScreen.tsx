import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { MapPin, Bell, ShoppingCart, Search, ChevronRight, X } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import BottomNav from '../components/BottomNav';
import { products, categories } from '../data/products';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export default function HomeScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart, getCartCount } = useCart();
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Pre-select category from URL query param (e.g. from CategoriesScreen)
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setAddedProducts(prev => new Set(prev).add(product.id));
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

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
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

        {/* Search */}
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

      <div className="px-4">
        {/* Promotional Banners — hidden while searching */}
        {!isSearching && (
          <div
            className="my-4 -mx-4 no-scrollbar"
            style={{
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollSnapType: 'x mandatory',
              display: 'flex',
              flexDirection: 'row',
              gap: '12px',
              paddingLeft: '16px',
              paddingRight: '16px',
              paddingBottom: '8px',
            }}
          >

              {/* Banner 1 — Fresh Deals */}
              <Card className="w-72 h-40 rounded-2xl overflow-hidden flex-shrink-0 border-0 relative" style={{ scrollSnapAlign: 'start' }}>
                {/* Background photo */}
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80"
                  alt="Fresh deals"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(100deg, rgba(230,115,0,0.92) 45%, rgba(230,115,0,0.3) 100%)' }}
                />
                {/* Content */}
                <div className="relative h-full flex flex-col justify-between p-4">
                  <div>
                    <span className="inline-block bg-white/25 text-white text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
                      🔥 Hot Offer
                    </span>
                    <h3 className="text-lg font-extrabold text-white leading-tight">Fresh Deals!</h3>
                    <p className="text-xs text-orange-100 mt-0.5">Up to 30% off on staples & dairy</p>
                  </div>
                  <button
                    onClick={() => navigate('/home')}
                    className="self-start bg-white text-orange-600 text-xs font-bold px-4 py-1.5 rounded-full shadow"
                  >
                    Shop Now →
                  </button>
                </div>
              </Card>

              {/* Banner 2 — Free Delivery */}
              <Card className="w-72 h-40 rounded-2xl overflow-hidden flex-shrink-0 border-0 relative" style={{ scrollSnapAlign: 'start' }}>
                <img
                  src="https://images.unsplash.com/photo-1601598851547-4302969d0614?w=600&q=80"
                  alt="Free delivery"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(100deg, rgba(21,101,32,0.92) 45%, rgba(21,101,32,0.3) 100%)' }}
                />
                <div className="relative h-full flex flex-col justify-between p-4">
                  <div>
                    <span className="inline-block bg-white/25 text-white text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
                      🚚 Fast Delivery
                    </span>
                    <h3 className="text-lg font-extrabold text-white leading-tight">Free Delivery</h3>
                    <p className="text-xs text-green-100 mt-0.5">On orders above ₹299</p>
                  </div>
                  <button
                    onClick={() => navigate('/cart')}
                    className="self-start bg-white text-green-700 text-xs font-bold px-4 py-1.5 rounded-full shadow"
                  >
                    Order Now →
                  </button>
                </div>
              </Card>

              {/* Banner 3 — 75+ Products */}
              <Card className="w-72 h-40 rounded-2xl overflow-hidden flex-shrink-0 border-0 relative" style={{ scrollSnapAlign: 'start' }}>
                <img
                  src="https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=600&q=80"
                  alt="Explore products"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(100deg, rgba(72,52,212,0.92) 45%, rgba(72,52,212,0.3) 100%)' }}
                />
                <div className="relative h-full flex flex-col justify-between p-4">
                  <div>
                    <span className="inline-block bg-white/25 text-white text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
                      🛒 All Categories
                    </span>
                    <h3 className="text-lg font-extrabold text-white leading-tight">75+ Products</h3>
                    <p className="text-xs text-purple-100 mt-0.5">Staples, Dairy & Beverages</p>
                  </div>
                  <button
                    onClick={() => navigate('/categories')}
                    className="self-start bg-white text-purple-700 text-xs font-bold px-4 py-1.5 rounded-full shadow"
                  >
                    Explore All →
                  </button>
                </div>
              </Card>

              {/* Banner 4 — Daily Essentials */}
              <Card className="w-72 h-40 rounded-2xl overflow-hidden flex-shrink-0 border-0 relative" style={{ scrollSnapAlign: 'start' }}>
                <img
                  src="https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&q=80"
                  alt="Daily essentials"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(100deg, rgba(198,40,40,0.90) 45%, rgba(198,40,40,0.25) 100%)' }}
                />
                <div className="relative h-full flex flex-col justify-between p-4">
                  <div>
                    <span className="inline-block bg-white/25 text-white text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
                      ⭐ Top Picks
                    </span>
                    <h3 className="text-lg font-extrabold text-white leading-tight">Daily Essentials</h3>
                    <p className="text-xs text-red-100 mt-0.5">Dairy, snacks & beverages</p>
                  </div>
                  <button
                    onClick={() => navigate('/home?category=Dairy%20%26%20Breakfast')}
                    className="self-start bg-white text-red-600 text-xs font-bold px-4 py-1.5 rounded-full shadow"
                  >
                    View Offers →
                  </button>
                </div>
              </Card>

          </div>
        )}

        {/* Category Chips */}
        {!isSearching && (
          <div className="my-4 -mx-4 px-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-2" style={{ width: 'max-content' }}>
              {categories.map(cat => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
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

        {/* Product count / heading */}
        <div className="flex items-center justify-between mb-3 mt-2">
          <h3 className="font-bold text-lg">
            {isSearching
              ? `Results for "${searchQuery}"`
              : activeCategory === 'all'
              ? 'All Products'
              : activeCategory}
          </h3>
          <span className="text-sm text-gray-500">{filteredProducts.length} items</span>
        </div>

        {/* Product List */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-semibold text-gray-700">No products found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search or category</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="mt-4 text-sm font-medium"
              style={{ color: '#FF9933' }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {filteredProducts.map(product => {
              const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
              const added = addedProducts.has(product.id);
              return (
                <Card
                  key={product.id}
                  className="rounded-xl overflow-hidden border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="flex gap-3 p-3">
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-semibold text-sm leading-snug line-clamp-2 flex-1">
                          {product.name}
                        </h4>
                        {discount > 0 && (
                          <Badge
                            className="text-xs px-1.5 py-0.5 flex-shrink-0 ml-1"
                            style={{ backgroundColor: '#E8F5E9', color: '#228B22' }}
                          >
                            {discount}% off
                          </Badge>
                        )}
                      </div>
                      {product.brand && (
                        <p className="text-xs text-gray-400 mt-0.5">{product.brand}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">{product.weight}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-base">₹{product.price}</span>
                          {product.mrp > product.price && (
                            <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                          )}
                        </div>
                        <Button
                          onClick={e => handleAddToCart(product, e)}
                          className="h-8 px-4 rounded-lg text-xs font-bold tracking-wide"
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
      </div>

      <BottomNav />
    </div>
  );
}
