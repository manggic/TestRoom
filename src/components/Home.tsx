import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/context/useAuth";
import { Link, useNavigate } from "react-router";

export default function Home() {
    const { currentUser, signOut } = useAuth();
    const navigate = useNavigate();

    if (!currentUser) {
        navigate("/login");
    }

    const handleLogout = async () => {
        try {
            await signOut();
            navigate("/login");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-zinc-800">
            {/* Navbar */}
            <nav className="flex justify-between items-center px-6 py-4 bg-white/60 dark:bg-zinc-900/60 shadow-md backdrop-blur-md">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    TestRoom
                </h2>

                <div className="flex items-center gap-4">
                    {currentUser ? (
                        <>
                            <span className="text-sm text-muted-foreground">
                                Hi, {currentUser?.profile?.name}
                            </span>
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

                    {!currentUser && (
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
