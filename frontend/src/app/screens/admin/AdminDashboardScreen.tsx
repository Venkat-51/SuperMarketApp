import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Clock,
  CheckCheck,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Upload,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { adminApi, AdminOverviewStats } from '../../../lib/api';

export default function AdminDashboardScreen() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    adminApi.getStats().then((res) => {
      if (!mounted) return;
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setStats(res.data);
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Products', value: stats?.totalProducts ?? 0, icon: Package, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Active Products', value: stats?.activeProducts ?? 0, icon: CheckCircle2, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Out of Stock', value: stats?.outOfStockProducts ?? 0, icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2' },
    { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Pending Orders', value: stats?.pendingOrders ?? 0, icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Completed Orders', value: stats?.completedOrders ?? 0, icon: CheckCheck, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Total Customers', value: stats?.totalUsers ?? 0, icon: Users, color: '#06b6d4', bg: '#ecfeff' },
    { label: "Today's Revenue", value: `₹${(stats?.todayRevenue ?? 0).toLocaleString('en-IN')}`, icon: DollarSign, color: '#ea580c', bg: '#fff7ed' },
  ];

  return (
    <div className="space-y-8">
      {/* ── Top Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">Real-time metrics, product stock, and sales performance summary</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/admin/products/add')}
            className="h-10 px-4 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
          <Button
            onClick={() => navigate('/admin/products/import')}
            variant="outline"
            className="h-10 px-4 rounded-xl text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4 text-gray-500" />
            <span>Bulk CSV</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600">
          ⚠️ {error}
        </div>
      )}

      {/* ── Key Metrics Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="p-5 rounded-2xl border border-gray-200/80 bg-white shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{card.label}</span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: card.bg, color: card.color }}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900 mt-2">{card.value}</p>
            </Card>
          );
        })}
      </div>

      {/* ── Analytics Visualizations Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales & Orders Chart Representation */}
        <Card className="lg:col-span-8 p-6 rounded-2xl border border-gray-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <span>Recent Revenue &amp; Orders Trend (7 Days)</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Daily aggregate sales trajectory</p>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2">
            {stats?.salesOverTime?.map((day) => {
              const maxRev = Math.max(...(stats.salesOverTime.map(d => d.revenue) || [1]), 1000);
              const heightPct = Math.max(10, Math.round((day.revenue / maxRev) * 100));
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded shadow-lg pointer-events-none whitespace-nowrap z-10">
                    ₹{day.revenue} ({day.orders} orders)
                  </div>
                  <div
                    className="w-full max-w-[42px] bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-xl transition-all duration-500 group-hover:from-orange-600 group-hover:to-amber-500"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[11px] font-bold text-gray-500">{day.date}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="lg:col-span-4 p-6 rounded-2xl border border-gray-200/80 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h3 className="font-extrabold text-base text-gray-900">Category Distribution</h3>
            <span className="text-xs font-bold text-gray-400">Total Items</span>
          </div>

          <div className="space-y-4">
            {stats?.categoryDistribution?.map((cat) => {
              const pct = stats.totalProducts > 0 ? Math.round((cat.count / stats.totalProducts) * 100) : 0;
              return (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-700 truncate">{cat.category}</span>
                    <span className="text-gray-900 font-bold">{cat.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>
    </div>
  );
}
