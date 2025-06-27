// src/pages/Home.tsx
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-zinc-800 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-6"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Welcome to TestRoom
        </h1>
        <p className="text-muted-foreground text-lg">
          Create and take tests with ease.
        </p>

        <div className="flex gap-4 justify-center">
          <Link to="/register">
            <Button>Get Started</Button>
          </Link>
          
        </div>
      </motion.div>
    </div>
  );
}
