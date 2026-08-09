import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Upload,
  Sparkles,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { adminApi, AdminProductDto } from '../../../lib/api';

export default function AdminProductsScreen() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<AdminProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Quick Action Dialogs
  const [selectedProduct, setSelectedProduct] = useState<AdminProductDto | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [stockInput, setStockInput] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState('');

  // Form State for Editing
  const [editForm, setEditForm] = useState<Partial<AdminProductDto>>({});

  const fetchProducts = async () => {
    setLoading(true);
    const res = await adminApi.getProducts({
      search: searchQuery,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      stockStatus: stockFilter !== 'all' ? stockFilter : undefined,
      isActive: activeFilter !== 'all' ? activeFilter === 'active' : undefined,
      sortBy: sortBy,
      page: page,
      pageSize: 15,
    });

    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setProducts(res.data.products);
      setTotalProducts(res.data.total);
      setError('');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, categoryFilter, stockFilter, activeFilter, sortBy, page]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleToggleActive = async (p: AdminProductDto) => {
    const res = await adminApi.toggleActive(p.id);
    if (res.data) {
      showToast(`Product '${p.name}' active status updated.`);
      fetchProducts();
    }
  };

  const handleSaveStock = async () => {
    if (!selectedProduct) return;
    setActionLoading(true);
    const res = await adminApi.updateStock(selectedProduct.id, Number(stockInput));
    setActionLoading(false);
    setIsStockOpen(false);

    if (res.data) {
      showToast(`Stock updated for ${selectedProduct.name}.`);
      fetchProducts();
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    setActionLoading(true);
    const res = await adminApi.deleteProduct(selectedProduct.id);
    setActionLoading(false);
    setIsDeleteOpen(false);

    if (res.error) {
      showToast(`Error: ${res.error}`);
    } else {
      showToast(`Product processed successfully.`);
      fetchProducts();
    }
  };

  const openEditModal = (p: AdminProductDto) => {
    setSelectedProduct(p);
    setEditForm({ ...p });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedProduct || !editForm.name || !editForm.category) return;
    setActionLoading(true);

    const res = await adminApi.updateProduct(selectedProduct.id, editForm);
    setActionLoading(false);

    if (res.error) {
      showToast(`Update error: ${res.error}`);
    } else {
      setIsEditOpen(false);
      showToast(`Product '${editForm.name}' saved successfully!`);
      fetchProducts();
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2">
          ✅ {notification}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">All Products</h1>
          <p className="text-xs text-gray-500 mt-1">Manage catalog inventory, update stock, pricing, and status</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/admin/products/add')}
            className="h-10 px-4 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Button>
          <Button
            onClick={() => navigate('/admin/products/import')}
            variant="outline"
            className="h-10 px-4 rounded-xl text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4 text-gray-500" />
            <span>Bulk CSV Import</span>
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 rounded-2xl border border-gray-200/80 bg-white shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product, SKU..."
              className="pl-9 h-10 text-xs rounded-xl border-gray-200"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700"
          >
            <option value="all">All Categories</option>
            <option value="Staples">Staples</option>
            <option value="Dairy & Breakfast">Dairy &amp; Breakfast</option>
            <option value="Beverages">Beverages</option>
            <option value="Fruits & Veg">Fruits &amp; Veg</option>
            <option value="Snacks">Snacks</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Household">Household</option>
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700"
          >
            <option value="all">All Stock Levels</option>
            <option value="instock">In Stock</option>
            <option value="outofstock">Out of Stock</option>
          </select>

          {/* Active Filter */}
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="price_asc">Sort: Price Low to High</option>
            <option value="price_desc">Sort: Price High to Low</option>
            <option value="stock_asc">Sort: Stock Low to High</option>
          </select>
        </div>
      </Card>

      {/* Data Table Container */}
      <Card className="rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-700 font-extrabold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Product Info</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Pricing</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 font-semibold">
                    No products matched your criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-contain bg-gray-50 border border-gray-100 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate max-w-xs">{p.name}</p>
                          <p className="text-[11px] text-gray-400">{p.brand || 'No Brand'} • {p.weight}</p>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3 px-4 font-mono text-gray-500 font-bold">{p.sku || `PRD-${p.id}`}</td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-[11px] font-semibold text-gray-700">
                        {p.category}
                      </span>
                    </td>

                    {/* Pricing */}
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-gray-900">₹{p.price}</span>
                        {p.mrp > p.price && (
                          <span className="text-[11px] text-gray-400 line-through ml-1.5">₹{p.mrp}</span>
                        )}
                        {p.discountPercent > 0 && (
                          <span className="text-[10px] text-green-600 font-bold ml-1">({p.discountPercent}% OFF)</span>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSelectedProduct(p);
                          setStockInput(p.stockQuantity);
                          setIsStockOpen(true);
                        }}
                        className="flex items-center gap-1.5 hover:underline"
                      >
                        <span className={`w-2 h-2 rounded-full ${p.inStock && p.stockQuantity > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="font-bold text-gray-900">{p.stockQuantity} units</span>
                      </button>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-colors ${
                          p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Showing page {page} of {Math.ceil(totalProducts / 15) || 1} ({totalProducts} total items)</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="h-8 px-3 rounded-lg text-xs"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              disabled={page >= Math.ceil(totalProducts / 15)}
              onClick={() => setPage(page + 1)}
              className="h-8 px-3 rounded-lg text-xs"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product details</DialogTitle>
            <DialogDescription>Modify SKU, weight, category, pricing, and stock.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Product Name *</label>
              <Input
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="h-10 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Brand</label>
              <Input
                value={editForm.brand || ''}
                onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                className="h-10 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Category *</label>
              <Input
                value={editForm.category || ''}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="h-10 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">SKU</label>
              <Input
                value={editForm.sku || ''}
                onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                className="h-10 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Price (₹) *</label>
              <Input
                type="number"
                value={editForm.price ?? 0}
                onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                className="h-10 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">MRP (₹) *</label>
              <Input
                type="number"
                value={editForm.mrp ?? 0}
                onChange={(e) => setEditForm({ ...editForm, mrp: Number(e.target.value) })}
                className="h-10 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Stock Quantity</label>
              <Input
                type="number"
                value={editForm.stockQuantity ?? 0}
                onChange={(e) => setEditForm({ ...editForm, stockQuantity: Number(e.target.value) })}
                className="h-10 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Weight / Unit</label>
              <Input
                value={editForm.weight || ''}
                onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                className="h-10 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">Image URL</label>
              <Input
                value={editForm.imageUrl || ''}
                onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                className="h-10 rounded-xl"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={actionLoading} className="bg-orange-500 text-white font-bold">
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Modal */}
      <Dialog open={isStockOpen} onOpenChange={setIsStockOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Update Inventory Stock</DialogTitle>
            <DialogDescription>Quickly adjust available units for '{selectedProduct?.name}'</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="block text-xs font-bold text-gray-700 mb-2">Available Quantity</label>
            <Input
              type="number"
              value={stockInput}
              onChange={(e) => setStockInput(Number(e.target.value))}
              className="h-11 rounded-xl text-base font-bold"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStockOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveStock} disabled={actionLoading} className="bg-orange-500 text-white font-bold">
              {actionLoading ? 'Updating...' : 'Update Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>Are you sure you want to remove '{selectedProduct?.name}'?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteProduct} disabled={actionLoading} className="bg-red-600 text-white font-bold">
              {actionLoading ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
