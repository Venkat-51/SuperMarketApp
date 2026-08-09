import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useCart } from '../context/CartContext';

export default function AdminProtectedRoute() {
  const { user, isAuthLoading } = useCart();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-gray-600">Verifying Admin Privileges...</p>
        </div>
      </div>
    );
  }

  // Check if user exists and has Admin role
  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
