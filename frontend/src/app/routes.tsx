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
import LoginScreen from './screens/LoginScreen';

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

  return <Outlet />;
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
    ],
  },
]);
