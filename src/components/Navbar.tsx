import { useAuth } from "@/context/useAuth";

import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";

function Navbar() {
    const { currentUser, signOut } = useAuth();

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate("/login");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };
    return (
        <nav className="flex justify-between items-center px-6 py-4 bg-white/60 dark:bg-zinc-900/60 shadow-md backdrop-blur-md">
            <Link
                to="/"
                className="text-xl font-bold text-gray-900 dark:text-white"
            >
                TestRoom
            </Link>

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
    );
}

export default Navbar;
