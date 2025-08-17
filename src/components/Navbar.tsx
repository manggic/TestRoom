import { useAuth } from "@/context/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { Home } from "lucide-react";

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
      <nav className="sticky top-0 z-50 w-full backdrop-blur-md shadow-md border-b border-muted 
                bg-white/70 dark:bg-zinc-900/70 
                supports-[backdrop-filter]:bg-white/40 
                dark:supports-[backdrop-filter]:bg-zinc-900/40 
                px-4 py-3 flex justify-between items-center transition-colors">

  {/* Logo - shrink a bit on mobile */}
  <Link
    to={getDashboardLink()}
    className="text-xl font-bold text-gray-900 dark:text-white"
  >
    <img
      src={"/images/logo.png"}
      width={"110px"}
      height={"32px"}
      alt="Test Room Logo"
      className="md:w-[133px] md:h-[40px] w-[110px] h-[32px]"
    />
  </Link>

  {!withoutAuth ? (
    <div className="flex items-center gap-3 md:gap-4">
      
      {/* Home link */}
      <Link
        to="/"
        className="relative flex items-center gap-1 font-semibold 
                   hover:opacity-90 transition-all duration-300"
      >
        {/* Icon - only mobile */}
        <Home className="w-5 h-5 block md:hidden text-indigo-500" />

        {/* Text - only desktop */}
        <span className="hidden md:inline bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Home
        </span>
      </Link>

      {currentUser ? (
        <>
          {/* Greeting only desktop */}
          <span className="hidden md:inline text-sm text-muted-foreground">
            Hi, {currentUser.user?.name}
          </span>

          {/* Logout button */}
          <Button
            variant="outline"
            className="cursor-pointer px-3 py-1 text-sm md:px-4 md:py-2"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </>
      ) : (
        <>
          {/* Smaller buttons for mobile */}
          <Link to="/login">
            <Button variant="ghost" className="cursor-pointer px-3 py-1 text-sm md:px-4 md:py-2">Login</Button>
          </Link>
          {/* <Link to="/register">
            <Button className="cursor-pointer px-3 py-1 text-sm md:px-4 md:py-2">Register</Button>
          </Link> */}
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
