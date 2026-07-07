import { RouterProvider } from 'react-router';
import { router } from './routes';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <CartProvider>
      <div className="size-full flex items-center justify-center bg-white">
        <div className="w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto">
          <RouterProvider router={router} />
        </div>
      </div>
    </CartProvider>
  );
}