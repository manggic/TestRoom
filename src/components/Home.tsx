import { useEffect, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import TeacherDashboard from "./teacher/TeacherDashboard";
import StudentDashboard from "./student/StudentDashboard";

export default function Home() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  // Get role from user metadata or user object
  let role = currentUser?.user?.role;
  if (!role || !['student', 'teacher', 'admin'].includes(role)) {
    role = currentUser?.user?.user_metadata?.role;
  }

  // Only allow valid roles
  const allowedRoles = ['student', 'teacher', 'admin'];
  const isValidRole = allowedRoles.includes(role);

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate("/login");
    }
  }, [currentUser, loading]);

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-zinc-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xl text-gray-700 dark:text-gray-200"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!isValidRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-zinc-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="text-xl text-red-500 mb-4">
            Unknown or invalid role: {role}
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Please contact your administrator to set up your account properly.
          </div>
        </motion.div>
      </div>
    );
  }

  // Render appropriate dashboard based on role
  const renderDashboard = () => {
    switch (role) {
      case "teacher":
        return <TeacherDashboard />;
      case "student":
        return <StudentDashboard />;
      case "admin":
        return <TeacherDashboard />; // Temporary redirect to teacher dashboard
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-zinc-800">
      <div className="flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          {renderDashboard()}
        </motion.div>
      </div>
    </div>
  );
}
