import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useAuth";
import {
    GraduationCap,
    ShieldCheck,
    Users,
    ClipboardList,
    BarChart2,
    UserCheck,
} from "lucide-react";
import { Link } from "react-router";

function LandingNavbar() {
    const { currentUser } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full border-b shadow-md bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl transition-colors">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
                {/* Logo */}
                <Link
                    to={"/"}
                    className="text-xl font-bold text-gray-900 dark:text-white"
                >
                    <img
                        src={"/images/logo.png"}
                        width={"133px"}
                        height={"40px"}
                    ></img>
                </Link>

                {/* Desktop Menu */}
                <nav className="hidden gap-6 text-sm font-medium md:flex">
                    {currentUser?.user?.role ? (
                        <Link
                            to={`/${currentUser?.user?.role}`}
                            className="relative font-semibold 
             bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
             bg-clip-text text-transparent
             hover:opacity-90 transition-all duration-300
             after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 
             after:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
             hover:after:w-full after:transition-all after:duration-300"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        ""
                    )}
                    <a
                        href="#why-test-room"
                        className="text-muted-foreground hover:text-foreground transition"
                    >
                        Why Test Room
                    </a>
                    <a
                        href="#how-it-works"
                        className="text-muted-foreground hover:text-foreground transition"
                    >
                        How It Works
                    </a>

                    <a
                        href="#features"
                        className="text-muted-foreground hover:text-foreground transition"
                    >
                        Features
                    </a>
                    <a
                        href="#contact-us"
                        className="text-muted-foreground hover:text-foreground transition"
                    >
                        Contact Us
                    </a>
                </nav>
            </div>
        </header>
    );
}

const features = [
    {
        title: "Students",
        icon: GraduationCap,
        description:
            "Take tests assigned by teachers, view your attempts, and download result summaries instantly.",
    },
    {
        title: "Teachers",
        icon: ClipboardList,
        description:
            "Create MCQ-based tests, track student performance, and manage test data effectively.",
    },
    {
        title: "Admins",
        icon: ShieldCheck,
        description:
            "Full control over users and tests. Manage teachers, students, and audit test activities globally.",
    },
    {
        title: "Detailed Reports",
        icon: BarChart2,
        description:
            "Auto-generated performance reports with per-question analytics for better evaluation.",
    },
    {
        title: "Role-based Access",
        icon: Users,
        description:
            "Every user gets tailored access – keeping things secure, organized, and efficient.",
    },
    {
        title: "Smart Authentication",
        icon: UserCheck,
        description:
            "Secure login/signup with real-time session management across all roles.",
    },
];

const LandingPage = () => {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <LandingNavbar />
            {/* Hero Section */}
            <section className="relative py-28 px-6 text-center bg-gradient-to-br from-blue-700 to-indigo-800 text-white overflow-hidden border-t border-white/10">
                <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
                <div className="max-w-5xl mx-auto z-10 relative">
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
                        Empower Your Coaching Institute with{" "}
                        <span className="bg-gradient-to-r from-yellow-300 via-pink-500 to-purple-600 text-transparent bg-clip-text drop-shadow-lg">
                            Test Room
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-white/90">
                        Conduct online tests, analyze performance, and manage
                        students and teachers seamlessly – all in one place.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button
                            asChild
                            size="lg"
                            variant="secondary"
                            className="text-base font-semibold"
                        >
                            <Link to="/register-org">
                                Register Your Organization
                            </Link>
                        </Button>

                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="text-base text-white border bg-white/10 hover:bg-white/20"
                        >
                            <Link to="/demo">🚀 Try Demo</Link>
                        </Button>

                        {/* New Login Button */}
                        <Button
                            asChild
                            size="lg"
                            variant="ghost"
                            className="text-base text-white border border-white/20 hover:bg-white/10"
                        >
                            <Link to="/login">🔑 Login</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section
                id="how-it-works"
                className="py-20 px-6 bg-background text-center border-b border-border"
            >
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        How Organizations Get Started
                    </h2>
                    <p className="text-muted-foreground text-lg mb-10">
                        Setting up your coaching institute on Test Room is
                        simple and secure. Here’s the process:
                    </p>
                    <div className="grid gap-10 sm:grid-cols-3 text-left">
                        <div className="p-6 bg-muted rounded-2xl shadow-lg border border-border hover:shadow-xl transition-all duration-300">
                            <h3 className="text-xl font-semibold mb-2">
                                1. Verify Email via OTP
                            </h3>
                            <p className="text-muted-foreground">
                                Enter your email and we will send a One-Time
                                Password (OTP). Use it to verify that your email
                                is valid.
                            </p>
                        </div>
                        <div className="p-6 bg-muted rounded-2xl shadow-lg border border-border hover:shadow-xl transition-all duration-300">
                            <h3 className="text-xl font-semibold mb-2">
                                2. Enter Organization Details
                            </h3>
                            <p className="text-muted-foreground">
                                After email verification, fill in your
                                institute’s details to complete the registration
                                form.
                            </p>
                        </div>
                        <div className="p-6 bg-muted rounded-2xl shadow-lg border border-border hover:shadow-xl transition-all duration-300">
                            <h3 className="text-xl font-semibold mb-2">
                                3. Receive Admin Credentials
                            </h3>
                            <p className="text-muted-foreground">
                                Once submitted successfully, we will email your
                                admin credentials so you can start managing your
                                organization.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Test Room */}
            <section
                id="why-test-room"
                className="py-20 px-6 bg-background text-center border-b border-border"
            >
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Why Choose Test Room?
                    </h2>
                    <p className="text-muted-foreground text-lg mb-6">
                        Designed for coaching classes, schools, and tutors, Test
                        Room brings powerful test-taking tools into your hands:
                    </p>
                    <ul className="text-left max-w-2xl mx-auto text-base text-muted-foreground space-y-4 list-disc pl-6">
                        <li>
                            Create and assign unlimited MCQ tests with time
                            limits
                        </li>
                        <li>
                            Monitor student performance with accuracy and timing
                            insights
                        </li>
                        <li>
                            Admin-level control for organization-wide visibility
                        </li>
                        <li>
                            Secure login, real-time submissions, and
                            downloadable result summaries
                        </li>
                        <li>Optimized for both desktop and mobile access</li>
                    </ul>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6 bg-background">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12">
                        Made for Modern Educators
                    </h2>
                    <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="bg-muted p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border"
                            >
                                <feature.icon className="h-10 w-10 mb-4 mx-auto text-primary" />
                                <h3 className="text-xl font-semibold mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-indigo-700 text-white text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to simplify your test management process?
                    </h2>
                    <p className="text-lg mb-8">
                        Join hundreds of educators using Test Room to digitize
                        assessments and accelerate student results.
                    </p>
                    <Button
                        asChild
                        size="lg"
                        variant="secondary"
                        className="text-lg font-semibold"
                    >
                        <Link to="/login">Get Started</Link>
                    </Button>
                </div>
            </section>

            <section
                id="contact-us"
                className="bg-muted/10 py-20 px-6 text-center border-t border-border"
            >
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold">
                        Need Help or Have a Question?
                    </h2>
                    <p className="text-muted-foreground mt-3 text-lg">
                        Our team is always ready to support you. Reach out for
                        help, feedback, or demo.
                    </p>
                    <Link to="/contact-us">
                        <Button className="mt-6 text-base px-6 py-2">
                            📬 Contact Us
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-background text-muted-foreground text-sm py-6 border-t mt-auto text-center">
                <p>
                    © {new Date().getFullYear()} Test Room. All rights reserved.
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;
