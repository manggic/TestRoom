// src/pages/Home.tsx
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // Load user from localStorage (or context if using)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-zinc-800">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 bg-white/60 dark:bg-zinc-900/60 shadow-md backdrop-blur-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">TestRoom</h2>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground">Hi, {user.name}</span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center h-[calc(100vh-80px)] px-4">
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

          {!user && (
            <div className="flex gap-4 justify-center">
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
