import { createBrowserRouter } from 'react-router';
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

export const router = createBrowserRouter([
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
]);
