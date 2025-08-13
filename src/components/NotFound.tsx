// src/pages/NotFound.tsx
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useAuth";
import { motion } from "framer-motion";
import { Ghost } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {

  const {currentUser}=useAuth()
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-zinc-800 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        <div className="flex justify-center">
          <Ghost className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground text-lg">
          The page you're looking for doesn't exist.
        </p>

        <Link to={currentUser?.user?.role?`/${currentUser?.user?.role}`:"/"}>
          <Button className="cursor-pointer">Go Home</Button>
        </Link>
      </motion.div>
    </div>
  );
}
