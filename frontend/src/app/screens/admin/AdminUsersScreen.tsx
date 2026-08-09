import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShoppingBag,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  UserX,
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
import { adminApi, AdminUserDto } from '../../../lib/api';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // User details modal state
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userDetail, setUserDetail] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const res = await adminApi.getUsers({
      search: searchQuery,
      page: page,
      pageSize: 15,
    });

    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setUsers(res.data.users);
      setTotalUsers(res.data.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, page]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleToggleActive = async (u: AdminUserDto) => {
    setActionLoading(true);
    const res = await adminApi.updateUserStatus(u.id, !u.isActive);
    setActionLoading(false);

    if (res.data) {
      showToast(`User account status updated.`);
      fetchUsers();
      if (userDetail && userDetail.id === u.id) {
        setUserDetail({ ...userDetail, isActive: !u.isActive });
      }
    }
  };

  const openUserDetail = async (id: number) => {
    setSelectedUserId(id);
    setIsDetailOpen(true);
    setUserDetail(null);

    const res = await adminApi.getUserDetail(id);
    if (res.data) {
      setUserDetail(res.data);
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
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Customer Accounts</h1>
          <p className="text-xs text-gray-500 mt-1">Inspect registered user accounts, order volume, and active statuses</p>
        </div>
      </div>

      {/* Toolbar */}
      <Card className="p-4 rounded-2xl border border-gray-200/80 bg-white shadow-xs">
        <div className="max-w-md relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="pl-9 h-10 text-xs rounded-xl border-gray-200"
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card className="rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-700 font-extrabold uppercase text-[11px]">
                <th className="py-3.5 px-4">User ID</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Registration Date</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">Loading user accounts...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500 font-semibold">No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">#{u.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{u.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-gray-800">{u.email || 'No Email'}</p>
                        <p className="text-[11px] text-gray-400">{u.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-medium">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">{u.ordersCount} orders</td>
                    <td className="py-3 px-4 font-bold text-gray-900">₹{u.totalSpent.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        onClick={() => openUserDetail(u.id)}
                        variant="outline"
                        className="h-8 px-3 rounded-lg text-xs font-bold text-gray-700 hover:bg-orange-50 border-gray-200"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-orange-500" /> View Profile
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
          <span>Showing page {page} of {Math.ceil(totalUsers / 15) || 1} ({totalUsers} total users)</span>
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
              disabled={page >= Math.ceil(totalUsers / 15)}
              onClick={() => setPage(page + 1)}
              className="h-8 px-3 rounded-lg text-xs"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* User Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900">User Profile & History</DialogTitle>
            <DialogDescription>Account metadata and past order activity</DialogDescription>
          </DialogHeader>

          {!userDetail ? (
            <div className="py-12 text-center text-gray-400 font-semibold">Loading profile data...</div>
          ) : (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-4 rounded-xl border border-gray-200/80 bg-white space-y-1.5">
                  <p className="font-extrabold text-[10px] text-gray-400 uppercase">Customer Profile</p>
                  <p className="font-bold text-sm text-gray-900">{userDetail.name}</p>
                  <p className="text-gray-600">Email: {userDetail.email || 'N/A'}</p>
                  <p className="text-gray-600">Phone: {userDetail.phone}</p>
                  <p className="text-gray-400 text-[11px]">Joined: {new Date(userDetail.createdAt).toLocaleDateString()}</p>
                </Card>

                <Card className="p-4 rounded-xl border border-gray-200/80 bg-white space-y-1.5">
                  <p className="font-extrabold text-[10px] text-gray-400 uppercase">Account Metrics</p>
                  <p className="text-gray-700">Total Orders: <strong className="text-gray-900">{userDetail.totalOrders}</strong></p>
                  <p className="text-gray-700">Delivered Orders: <strong className="text-emerald-600">{userDetail.completedOrders}</strong></p>
                  <p className="text-gray-700">Total Amount Spent: <strong className="text-gray-900">₹{userDetail.totalSpent}</strong></p>
                  <div className="pt-2">
                    <Button
                      onClick={() => handleToggleActive(userDetail)}
                      variant="outline"
                      size="sm"
                      className={`h-8 text-xs font-bold ${userDetail.isActive ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}
                    >
                      {userDetail.isActive ? 'Deactivate Account' : 'Activate Account'}
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Order History */}
              <div>
                <p className="font-extrabold text-gray-900 uppercase tracking-wider text-[10px] text-gray-400 mb-2">Order History</p>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-600">
                        <th className="py-2.5 px-3">Order ID</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {userDetail.orders?.length === 0 ? (
                        <tr><td colSpan={4} className="py-6 text-center text-gray-400">No orders placed yet.</td></tr>
                      ) : (
                        userDetail.orders?.map((o: any) => (
                          <tr key={o.id}>
                            <td className="py-2 px-3 font-mono font-bold text-gray-900">#{o.id}</td>
                            <td className="py-2 px-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                            <td className="py-2 px-3 font-bold text-orange-600">{o.status}</td>
                            <td className="py-2 px-3 text-right font-bold text-gray-900">₹{o.total}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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
