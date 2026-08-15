import { useEffect } from 'react';
import { createBrowserRouter, useLocation, Outlet } from 'react-router';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import CartScreen from './screens/CartScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import OrderSuccessScreen from './screens/OrderSuccessScreen';
import OrdersScreen from './screens/OrdersScreen';
import OrderDetailScreen from './screens/OrderDetailScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import AccountScreen from './screens/AccountScreen';
import SavedAddressesScreen from './screens/SavedAddressesScreen';
import WishlistScreen from './screens/WishlistScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import PrivacySecurityScreen from './screens/PrivacySecurityScreen';
import HelpSupportScreen from './screens/HelpSupportScreen';
import LoginScreen from './screens/LoginScreen';
import DesktopHeader from './components/DesktopHeader';
import DesktopFooter from './components/DesktopFooter';

import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLayout from './components/AdminLayout';
import AdminDashboardScreen from './screens/admin/AdminDashboardScreen';
import AdminProductsScreen from './screens/admin/AdminProductsScreen';
import AdminAddProductScreen from './screens/admin/AdminAddProductScreen';
import AdminBulkImportScreen from './screens/admin/AdminBulkImportScreen';
import AdminOrdersScreen from './screens/admin/AdminOrdersScreen';
import AdminUsersScreen from './screens/admin/AdminUsersScreen';
import AdminCategoriesScreen from './screens/admin/AdminCategoriesScreen';
import AdminSettingsScreen from './screens/admin/AdminSettingsScreen';

function RootLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset window scroll position
    window.scrollTo(0, 0);

    // Reset scroll on all scrollable container elements in the DOM
    const scrollContainers = document.querySelectorAll('*');
    scrollContainers.forEach((el) => {
      if (el.scrollTop > 0) {
        el.scrollTop = 0;
      }
    });
  }, [pathname]);

  const isStandalone = pathname === '/' || pathname === '/onboarding' || pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-white lg:bg-gray-50/50">
      {!isStandalone && <DesktopHeader />}
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      {!isStandalone && <DesktopFooter />}
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/login',
        Component: LoginScreen,
      },
      {
        path: '/',
        Component: SplashScreen,
      },
      {
        path: '/onboarding',
        Component: OnboardingScreen,
      },
      {
        path: '/home',
        Component: HomeScreen,
      },
      {
        path: '/product/:id',
        Component: ProductDetailScreen,
      },
      {
        path: '/cart',
        Component: CartScreen,
      },
      {
        path: '/checkout',
        Component: CheckoutScreen,
      },
      {
        path: '/order-success',
        Component: OrderSuccessScreen,
      },
      {
        path: '/orders',
        Component: OrdersScreen,
      },
      {
        path: '/orders/:id',
        Component: OrderDetailScreen,
      },
      {
        path: '/categories',
        Component: CategoriesScreen,
      },
      {
        path: '/account',
        Component: AccountScreen,
      },
      {
        path: '/addresses',
        Component: SavedAddressesScreen,
      },
      {
        path: '/wishlist',
        Component: WishlistScreen,
      },
      {
        path: '/notifications',
        Component: NotificationsScreen,
      },
      {
        path: '/privacy',
        Component: PrivacySecurityScreen,
      },
      {
        path: '/help',
        Component: HelpSupportScreen,
      },
    ],
  },
  // ── Protected Admin Section ─────────────────────────────────────────────
  {
    element: <AdminProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', Component: AdminDashboardScreen },
          { path: '/admin/dashboard', Component: AdminDashboardScreen },
          { path: '/admin/products', Component: AdminProductsScreen },
          { path: '/admin/products/add', Component: AdminAddProductScreen },
          { path: '/admin/products/import', Component: AdminBulkImportScreen },
          { path: '/admin/orders', Component: AdminOrdersScreen },
          { path: '/admin/users', Component: AdminUsersScreen },
          { path: '/admin/categories', Component: AdminCategoriesScreen },
          { path: '/admin/settings', Component: AdminSettingsScreen },
        ],
      },
    ],
  },
]);
