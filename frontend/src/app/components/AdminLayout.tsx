import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Upload,
  ShoppingBag,
  Users,
  FolderTree,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Store,
  Bell,
  Search,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useCart();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Catalog',
      items: [
        { label: 'All Products', path: '/admin/products', icon: Package },
        { label: 'Add Product', path: '/admin/products/add', icon: PlusCircle },
        { label: 'Bulk Import', path: '/admin/products/import', icon: Upload },
        { label: 'Categories', path: '/admin/categories', icon: FolderTree },
      ],
    },
    {
      title: 'Sales & People',
      items: [
        { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
        { label: 'Customers', path: '/admin/users', icon: Users },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Settings', path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-900 font-sans">
      {/* ── Mobile Sidebar Overlay / Backdrop ── */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ── Admin Sidebar (Desktop & Mobile Drawer) ── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-gray-200/80 flex flex-col transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Header / Brand Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 flex-shrink-0">
              <Store className="w-5 h-5" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="truncate">
                <h1 className="font-black text-lg tracking-tight text-gray-900 leading-tight">
                  Super<span className="text-orange-500">Market</span>
                </h1>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest block">
                  Admin Console
                </span>
              </div>
            )}
          </div>

          {/* Collapse Toggle (Desktop) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          {/* Close Mobile Drawer */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navigationItems.map((section) => (
            <div key={section.title}>
              {(!isCollapsed || isMobileOpen) && (
                <p className="px-3 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                        }`
                      }
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-gray-200/80 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 font-bold flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-5 h-5" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-gray-400 truncate">{user?.email || 'admin@supermarket.com'}</p>
              </div>
            )}
            {(!isCollapsed || isMobileOpen) && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content Container ── */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Top Header Navigation Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <span className="hidden sm:inline">SuperMarket</span>
              <span className="hidden sm:inline text-gray-300">/</span>
              <span className="text-gray-900 font-bold capitalize">
                {location.pathname.split('/admin/')[1]?.replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/home')}
              className="h-9 px-3.5 rounded-xl text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center gap-1.5"
            >
              <Store className="w-4 h-4 text-orange-500" />
              <span className="hidden sm:inline">View Live Store</span>
            </Button>

            <div className="w-px h-6 bg-gray-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-700 hidden md:inline">System Live</span>
            </div>
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
