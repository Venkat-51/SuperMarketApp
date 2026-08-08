import { RouterProvider } from 'react-router';
import { router } from './routes';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <CartProvider>
      <div className="w-full min-h-screen bg-gray-100 flex justify-center items-start lg:block lg:bg-gray-50">
        <div className="w-full max-w-md min-h-screen bg-white shadow-2xl overflow-y-auto lg:max-w-none lg:shadow-none lg:overflow-visible">
          <RouterProvider router={router} />
        </div>
      </div>
    </CartProvider>
  );
}