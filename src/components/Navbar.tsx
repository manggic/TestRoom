import { useAuth } from "@/context/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";

function Navbar({ withoutAuth = false }) {
    const { currentUser, signOut } = useAuth();
    const navigate = useNavigate();

    // Get role from user metadata or user object
    let role = currentUser?.user?.role;
    if (!role || !["student", "teacher", "admin"].includes(role)) {
        role = currentUser?.user?.user_metadata?.role;
    }

    const handleLogout = async () => {
        try {
            await signOut();
            navigate("/login");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const getDashboardLink = () => {
        switch (role) {
            case "teacher":
                return "/teacher";
            case "student":
                return "/student";
            case "admin":
                return "/admin"; // Root dashboard
            default:
                return "/";
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full backdrop-blur-md shadow-md border-b border-muted bg-white/70 dark:bg-zinc-900/70 supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-zinc-900/40 px-4 py-4 flex justify-between items-center transition-colors">
            <Link
                to={getDashboardLink()}
                className="text-xl font-bold text-gray-900 dark:text-white"
            >
                <img
                    src={"/images/logo.png"}
                    width={"133px"}
                    height={"40px"}
                    alt="Test Room Logo"
                />
            </Link>

            {!withoutAuth ? (
                <div className="flex items-center gap-4">
                    {currentUser ? (
                        <>
                            <span className="text-sm text-muted-foreground">
                                Hi, {currentUser.user?.name}
                            </span>
                            <Button
                                variant="outline"
                                className="cursor-pointer"
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="ghost" className="cursor-pointer">Login</Button>
                            </Link>
                            <Link to="/register">
                                <Button className="cursor-pointer">Register</Button>
                            </Link>
                        </>
                    )}
                </div>
            ) : (
                ""
            )}
        </nav>
    );
}

export default Navbar;
