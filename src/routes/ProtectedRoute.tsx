// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/useAuth";

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth();


  if (loading) {
    return <div className="text-center p-4">Loading authentication...</div>;
  }

  // 👇 Prevent early redirect if currentUser is not yet available
  if (!currentUser || !currentUser.profile?.email) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
