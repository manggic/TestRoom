import { Outlet } from "react-router";
import { motion } from "framer-motion";
import Navbar from "../Navbar";
import { useAuth } from "@/context/useAuth";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { isDemoLogin } from "@/lib/constants";

export default function AuthLayout() {

  const {currentUser} = useAuth()
  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-zinc-800 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >

       
        <Navbar />
         {currentUser?.user?.name && isDemoLogin(currentUser?.user?.name) ? (
                <Alert className="mt-4 border-yellow-300 bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                    <Info className="h-4 w-4" />
                    <AlertTitle>You are in Demo Mode</AlertTitle>
                </Alert>
            ) : (
                ""
            )}
        <Outlet />
      </motion.div>
    </div>
  );
}
