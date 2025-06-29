import { useEffect } from "react";
import { useAuth } from "@/context/useAuth";
import { useNavigate } from "react-router";
// import AdminDashboard from "./AdminDashboard";
// import StudentDashboard from "./StudentDashboard";

import { motion } from "framer-motion";
import TeacherDashboard from "./teacher/TeacherDashboard";

export default function Home() {
  const { currentUser, loading } = useAuth();

  const { profile } = currentUser || {}
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate("/login");
    }
  }, [currentUser, loading]);

  console.log({currentUser});
  

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

  const renderDashboard = () => {
    switch (profile?.role) {
    //   case "admin":
    //     return <AdminDashboard />;
      case "teacher":
        return <TeacherDashboard />;
    //   case "student":
    //     return <StudentDashboard />;
      default:
        return (
          <div className="text-center text-red-500">
            Unknown role: {profile?.role}
          </div>
        );
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
