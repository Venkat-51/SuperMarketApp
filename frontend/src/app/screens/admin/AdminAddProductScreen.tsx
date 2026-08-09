import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save, Plus, Package, Sparkles } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { adminApi } from '../../../lib/api';

export default function AdminAddProductScreen() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: 'Staples',
    subcategory: '',
    sku: '',
    price: 0,
    mrp: 0,
    stockQuantity: 50,
    weight: '1 unit',
    unit: 'unit',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
    inStock: true,
    isActive: true,
    isFeatured: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim()) {
      setError('Product Name is required.');
      return;
    }

    if (form.price <= 0) {
      setError('Please enter a valid price greater than zero.');
      return;
    }

    setLoading(true);

    const res = await adminApi.createProduct({
      ...form,
      mrp: form.mrp > 0 ? form.mrp : form.price,
    });

    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(`Product '${form.name}' added successfully!`);
      setTimeout(() => {
        navigate('/admin/products');
      }, 1200);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product List</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Add New Product</h1>
        <p className="text-xs text-gray-500 mt-1">Fill in product specs, pricing, and inventory details</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-xs font-bold text-green-700">
          ✅ {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 rounded-2xl border border-gray-200/80 bg-white space-y-4">
          <h3 className="font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100">Basic Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Aashirvaad Shudh Chakki Atta"
                className="h-11 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Brand Name</label>
              <Input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="e.g. Aashirvaad"
                className="h-11 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700"
              >
                <option value="Staples">Staples</option>
                <option value="Dairy & Breakfast">Dairy &amp; Breakfast</option>
                <option value="Beverages">Beverages</option>
                <option value="Fruits & Veg">Fruits &amp; Veg</option>
                <option value="Snacks">Snacks</option>
                <option value="Personal Care">Personal Care</option>
                <option value="Household">Household</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Subcategory</label>
              <Input
                value={form.subcategory}
                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                placeholder="e.g. Whole Wheat Flour"
                className="h-11 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">SKU / Product Code</label>
              <Input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="e.g. ASH-ATTA-10K"
                className="h-11 rounded-xl font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Weight / Pack Size</label>
              <Input
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                placeholder="e.g. 10 kg or 500 ml"
                className="h-11 rounded-xl"
              />
            </div>
          </div>
        </Card>

        {/* Pricing & Stock */}
        <Card className="p-6 rounded-2xl border border-gray-200/80 bg-white space-y-4">
          <h3 className="font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100">Pricing &amp; Inventory</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Selling Price (₹) <span className="text-red-500">*</span></label>
              <Input
                type="number"
                value={form.price || ''}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                placeholder="415"
                className="h-11 rounded-xl font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">MRP Price (₹)</label>
              <Input
                type="number"
                value={form.mrp || ''}
                onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })}
                placeholder="460"
                className="h-11 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Initial Stock Quantity</label>
              <Input
                type="number"
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })}
                placeholder="50"
                className="h-11 rounded-xl font-bold"
              />
            </div>
          </div>
        </Card>

        {/* Media & Settings */}
        <Card className="p-6 rounded-2xl border border-gray-200/80 bg-white space-y-4">
          <h3 className="font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100">Media &amp; Options</h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Product Image URL</label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
                className="h-11 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Enter detailed product description..."
                className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-orange-500 rounded"
                />
                <span className="font-bold text-gray-800">Active in Store</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-4 h-4 accent-orange-500 rounded"
                />
                <span className="font-bold text-gray-800">Featured Product</span>
              </label>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')} className="h-12 px-6 rounded-xl font-bold">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="h-12 px-8 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md">
            {loading ? 'Adding Product...' : 'Save & Publish Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
