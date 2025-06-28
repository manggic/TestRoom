import { Outlet } from "react-router";
import { motion } from "framer-motion";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-zinc-800 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        {/* Optional Header or Logo */}
        {/* <div className="text-center mb-6">
          <img src="/logo.svg" alt="Logo" className="h-10 mx-auto" />
          <h1 className="text-xl font-semibold mt-2">Welcome to TestRoom</h1>
        </div> */}

        <Outlet />
      </motion.div>
    </div>
  );
}
