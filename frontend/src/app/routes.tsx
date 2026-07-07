import { createBrowserRouter } from 'react-router';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import CartScreen from './screens/CartScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import OrderSuccessScreen from './screens/OrderSuccessScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import AccountScreen from './screens/AccountScreen';

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
    path: '/login',
    Component: LoginScreen,
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
    path: '/categories',
    Component: CategoriesScreen,
  },
  {
    path: '/account',
    Component: AccountScreen,
  },
]);
