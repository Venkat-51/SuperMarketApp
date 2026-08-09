import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Package,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { adminApi, AdminOrderDto } from '../../../lib/api';

export default function AdminOrdersScreen() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<AdminOrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDto | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    const res = await adminApi.getOrders({
      search: searchQuery,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      page: page,
      pageSize: 15,
    });

    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setOrders(res.data.orders);
      setTotalOrders(res.data.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [searchQuery, statusFilter, page]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setStatusUpdating(true);
    const res = await adminApi.updateOrderStatus(orderId, newStatus);
    setStatusUpdating(false);

    if (res.data) {
      showToast(`Order #${orderId} status updated to ${newStatus}.`);
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      fetchOrders();
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'outfordelivery': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl">
          ✅ {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Management</h1>
          <p className="text-xs text-gray-500 mt-1">Track incoming purchases, update status, and inspect customer breakdown</p>
        </div>
      </div>

      {/* Toolbar */}
      <Card className="p-4 rounded-2xl border border-gray-200/80 bg-white shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Order ID, customer..."
              className="pl-9 h-10 text-xs rounded-xl border-gray-200"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700"
          >
            <option value="all">All Order Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Preparing / Processing</option>
            <option value="OutForDelivery">Out For Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-700 font-extrabold uppercase text-[11px]">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 font-semibold">No orders found.</td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">#{o.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-gray-900">{o.userName}</p>
                        <p className="text-[11px] text-gray-400">{o.userPhone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-medium">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-700">{o.itemsCount} items</td>
                    <td className="py-3 px-4 font-bold text-gray-900">₹{o.total}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadgeClass(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        onClick={() => {
                          setSelectedOrder(o);
                          setIsDetailOpen(true);
                        }}
                        variant="outline"
                        className="h-8 px-3 rounded-lg text-xs font-bold text-gray-700 hover:bg-orange-50 border-gray-200"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-orange-500" /> View Order
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Showing page {page} of {Math.ceil(totalOrders / 15) || 1} ({totalOrders} total orders)</span>
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
              disabled={page >= Math.ceil(totalOrders / 15)}
              onClick={() => setPage(page + 1)}
              className="h-8 px-3 rounded-lg text-xs"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Order Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-3xl rounded-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <div className="space-y-6 text-xs">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <span>Order #{selectedOrder.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${getStatusBadgeClass(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()} • Payment Method: {selectedOrder.paymentMethod}
                </DialogDescription>
              </DialogHeader>

              {/* Status Update Control */}
              <Card className="p-4 rounded-xl bg-orange-50/50 border border-orange-200/60 flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-900 text-xs">Update Order Status</p>
                  <p className="text-[11px] text-gray-500">Advance fulfillment stage for this customer order</p>
                </div>
                <div className="flex items-center gap-2">
                  {['Confirmed', 'Processing', 'OutForDelivery', 'Delivered', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      disabled={statusUpdating}
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        selectedOrder.status.toLowerCase() === st.toLowerCase()
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Grid: Customer & Delivery Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-4 rounded-xl border border-gray-200/80 bg-white space-y-2">
                  <p className="font-extrabold text-gray-900 uppercase tracking-wider text-[10px] text-gray-400">Customer Info</p>
                  <p className="font-bold text-gray-900 text-sm">{selectedOrder.userName}</p>
                  <p className="text-gray-600">Email: {selectedOrder.userEmail || 'N/A'}</p>
                  <p className="text-gray-600">Phone: {selectedOrder.userPhone}</p>
                </Card>

                <Card className="p-4 rounded-xl border border-gray-200/80 bg-white space-y-2">
                  <p className="font-extrabold text-gray-900 uppercase tracking-wider text-[10px] text-gray-400">Delivery Address</p>
                  {selectedOrder.address ? (
                    <>
                      <p className="font-bold text-gray-900">{selectedOrder.address.label} Address</p>
                      <p className="text-gray-600">{selectedOrder.address.line1}</p>
                      <p className="text-gray-600">{selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}</p>
                    </>
                  ) : (
                    <p className="text-gray-400 italic">No detailed address saved.</p>
                  )}
                </Card>
              </div>

              {/* Order Items Table */}
              <div>
                <p className="font-extrabold text-gray-900 uppercase tracking-wider text-[10px] text-gray-400 mb-2">Purchased Items</p>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-600">
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-bold text-gray-900">{item.productName} ({item.weight})</td>
                          <td className="py-2 px-3 text-center font-bold">{item.quantity}</td>
                          <td className="py-2 px-3 text-right text-gray-600">₹{item.price}</td>
                          <td className="py-2 px-3 text-right font-bold text-gray-900">₹{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>₹{selectedOrder.deliveryFee}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-gray-900 pt-2 border-t border-gray-200">
                  <span>Grand Total</span>
                  <span>₹{selectedOrder.total}</span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
