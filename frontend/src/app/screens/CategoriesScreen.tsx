import { useNavigate } from 'react-router';
import { ChevronRight } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4">
        <h1 className="text-xl font-bold">Shop by Category</h1>
        <p className="text-sm text-gray-500 mt-0.5">Browse all product categories</p>
      </div>

      <div className="px-4 pt-4">
        {/* Banner */}
        <div
          className="rounded-2xl p-5 mb-5 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #FF9933 0%, #e07b00 100%)' }}
        >
          <div>
            <p className="text-white font-bold text-lg leading-tight">125+ Products</p>
            <p className="text-orange-100 text-sm mt-1">Across 7 active categories</p>
          </div>
          <span className="text-5xl">🛒</span>
        </div>

        {/* Category Grid */}
        <div className="space-y-3">
          {featuredCategories.map((cat) => {
            const style = categoryColors[cat.id] ?? { bg: '#F5F5F5', text: '#333', emoji: '📦' };

            return (
              <button
                key={cat.id}
                onClick={() => handleCategory(cat.id)}
                className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 transition-all text-left hover:border-orange-200 active:scale-[0.99]"
                style={{
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                  style={{ backgroundColor: style.bg }}
                >
                  {style.emoji}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
                  <span
                    className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: style.bg,
                      color: style.text,
                    }}
                  >
                    {cat.count}
                  </span>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
