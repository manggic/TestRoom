// routes/ProtectedRoute.tsx

import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/useAuth";

/**
 * Props:
 * - allowedRoles (optional): restricts access to users with specific roles like "teacher" or "student".
 */
interface ProtectedRouteProps {
  allowedRoles?: ("teacher" | "student" | "admin")[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { currentUser, loading } = useAuth();

  // ⏳ Show loading while auth state is resolving
  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  // 🔒 Redirect unauthenticated users to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Get role directly from your user object (as you've confirmed)
  const role = currentUser?.user?.role;

  // ⛔ If route is restricted and user role is not allowed
  if (allowedRoles && !allowedRoles.includes(role)) {
  return <div className="text-center text-red-500 p-6">
    🚫 Access Denied. You are not authorized to view this page.
  </div>;
}

  // ✅ Access granted
  return <Outlet />;
};

export default ProtectedRoute;
