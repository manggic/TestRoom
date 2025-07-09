import { useAuth } from "@/context/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router";

function Navbar() {
    const { currentUser, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get role from user metadata or user object
    let role = currentUser?.user?.role;
    if (!role || !['student', 'teacher', 'admin'].includes(role)) {
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
                return "/";
            case "student":
                return "/";
            case "admin":
                return "/"; // Root dashboard
            default:
                return "/";
        }
    };

    // Check if we're currently on a dashboard page
    const isOnDashboard = location.pathname === '/';
    const isOnCreateTest = location.pathname.includes('/create-test');
    const isOnStudentDashboard = location.pathname === '/student/dashboard';
    const isOnTeacherDashboard = location.pathname === '/teacher/dashboard';

    return (
        <nav className="flex justify-between items-center px-6 py-4 bg-white/60 dark:bg-zinc-900/60 shadow-md backdrop-blur-md">
            <Link
                to={getDashboardLink()}
                className="text-xl font-bold text-gray-900 dark:text-white"
            >
                TestRoom
            </Link>

            <div className="flex items-center gap-4">
                {currentUser ? (
                    <>
                        <span className="text-sm text-muted-foreground">
                            Hi, {currentUser.user?.name}
                        </span>
                        
                        {/* Role-specific navigation */}
                        {/* Removed teacher dashboard and create test for teacher role */}
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
