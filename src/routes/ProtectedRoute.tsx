// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/context/useAuth';

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
}