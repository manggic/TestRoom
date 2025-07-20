import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/useAuth";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  allowedRoles?: ("teacher" | "student" | "admin")[];
  children?: ReactNode; // ✅ allow children too
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { currentUser, loading } = useAuth();

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" replace />;

  const role = currentUser?.user?.role;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <div className="text-center text-red-500 p-6">
      🚫 Access Denied. You are not authorized to view this page.
    </div>;
  }

  return <>{children || <Outlet />}</>; // ✅ supports both
};

export default ProtectedRoute;
