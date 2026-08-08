import { useNavigate } from 'react-router';
import { ChevronRight, ArrowRight, Grid3x3 } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { categories } from '../data/products';

const categoryColors: Record<string, { bg: string; text: string; emoji: string }> = {
  'Staples': { bg: '#FFF3E0', text: '#E65100', emoji: '🌾' },
  'Dairy & Breakfast': { bg: '#E3F2FD', text: '#1565C0', emoji: '🥛' },
  'Beverages': { bg: '#E8F5E9', text: '#2E7D32', emoji: '☕' },
  'Fruits & Veg': { bg: '#F3E5F5', text: '#6A1B9A', emoji: '🥬' },
  'Snacks': { bg: '#FFF8E1', text: '#F57F17', emoji: '🍿' },
  'Personal Care': { bg: '#FCE4EC', text: '#880E4F', emoji: '🧴' },
  'Household': { bg: '#E0F2F1', text: '#004D40', emoji: '🧹' },
};

const featuredCategories = [
  { id: 'Staples', name: 'Staples', desc: 'Rice, dal, oil & more', count: '25 items' },
  { id: 'Dairy & Breakfast', name: 'Dairy & Breakfast', desc: 'Milk, paneer, bread & more', count: '25 items' },
  { id: 'Beverages', name: 'Beverages', desc: 'Tea, coffee, juice & more', count: '25 items' },
  { id: 'Fruits & Veg', name: 'Fruits & Veg', desc: 'Fresh produce daily', count: '15 items' },
  { id: 'Snacks', name: 'Snacks', desc: 'Chips, biscuits & more', count: '15 items' },
  { id: 'Personal Care', name: 'Personal Care', desc: 'Soap, shampoo & more', count: '13 items' },
  { id: 'Household', name: 'Household', desc: 'Cleaners, tools & more', count: '12 items' },
];

export default function CategoriesScreen() {
  const navigate = useNavigate();

  const handleCategory = (catId: string) => {
    // Navigate to home with category pre-selected via query param
    navigate(`/home?category=${encodeURIComponent(catId)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-12">
      {/* Mobile Sticky Header (Hidden on Desktop) */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4 lg:hidden">
        <h1 className="text-xl font-bold">Shop by Category</h1>
        <p className="text-sm text-gray-500 mt-0.5">Browse all product categories</p>
      </div>

      <div className="px-4 pt-4 lg:max-w-7xl lg:mx-auto lg:px-6 lg:py-8">
        {/* Desktop Header Title (Visible on Desktop) */}
        <div className="hidden lg:flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Grid3x3 className="w-6 h-6 text-orange-500" />
              <span>Explore All Categories</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Select a category to browse top-quality groceries and fresh essentials</p>
          </div>
          <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full">
            7 Categories Available
          </span>
        </div>

        {/* Banner */}
        <div
          className="rounded-2xl p-5 lg:p-8 mb-5 lg:mb-8 flex items-center justify-between shadow-md"
          style={{ background: 'linear-gradient(135deg, #FF9933 0%, #e07b00 100%)' }}
        >
          <div>
            <p className="text-white font-black text-lg lg:text-2xl leading-tight">125+ Fresh Products Delivered Fast</p>
            <p className="text-orange-100 text-sm mt-1">Across 7 active categories with guaranteed best prices</p>
          </div>
          <span className="text-5xl lg:text-6xl">🛒</span>
        </div>

        {/* Category Grid / List */}
        <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
          {featuredCategories.map((cat) => {
            const style = categoryColors[cat.id] ?? { bg: '#F5F5F5', text: '#333', emoji: '📦' };

            return (
              <button
                key={cat.id}
                onClick={() => handleCategory(cat.id)}
                className="w-full flex lg:flex-col lg:items-start items-center gap-4 bg-white rounded-2xl p-4 lg:p-6 border border-gray-100 lg:border-gray-200/80 transition-all text-left hover:border-orange-300 hover:shadow-lg active:scale-[0.99] group"
                style={{
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Icon */}
                <div
                  className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl lg:text-3xl group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: style.bg }}
                >
                  {style.emoji}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 lg:w-full lg:mt-2">
                  <p className="font-semibold lg:font-bold text-gray-900 lg:text-lg group-hover:text-orange-600 transition-colors">{cat.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
                  
                  <div className="flex items-center justify-between mt-2 lg:mt-4 lg:pt-3 lg:border-t lg:border-gray-100">
                    <span
                      className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: style.bg,
                        color: style.text,
                      }}
                    >
                      {cat.count}
                    </span>
                    <span className="hidden lg:flex items-center gap-1 text-xs font-bold text-orange-500 group-hover:translate-x-1 transition-transform">
                      Browse Items <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Mobile Arrow */}
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 lg:hidden" />
              </button>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
