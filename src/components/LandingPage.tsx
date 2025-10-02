import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/useAuth';
import {
  GraduationCap,
  ShieldCheck,
  Users,
  ClipboardList,
  BarChart2,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router';
import { ScrollToTop } from './ScrollToTop';

import { MobileMenu } from './MobileMenu';

function LandingNavbar() {
  const { currentUser } = useAuth();
  const navLinks = [
    { href: '#why-test-room', label: 'Why Test Room' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#features', label: 'Features' },
    { href: '#contact-us', label: 'Contact Us' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b shadow-md bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Logo */}
        <Link to={'/'} className="text-xl font-bold text-gray-900 dark:text-white">
          <img src={'/images/logo.png'} width={'133px'} height={'40px'} />
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
            ''
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

          <a href="#features" className="text-muted-foreground hover:text-foreground transition">
            Features
          </a>
          <a href="#contact-us" className="text-muted-foreground hover:text-foreground transition">
            Contact Us
          </a>
        </nav>

        {/* Mobile Menu (Hamburger) */}
        <MobileMenu currentUser={currentUser} navLinks={navLinks} />
      </div>
    </header>
  );
}

const features = [
  {
    title: 'Students',
    icon: GraduationCap,
    description:
      'Take tests created by parents, teachers, or admins. Review your attempts and download results instantly.',
  },
  {
    title: 'Teachers',
    icon: ClipboardList,
    description:
      'Easily create and manage MCQ tests, track student progress, and analyze performance data.',
  },
  {
    title: 'Admins',
    icon: ShieldCheck,
    description:
      'As soon as you sign up, you become an Admin. Manage your own space with teachers, students, and tests.',
  },
  {
    title: 'Detailed Reports',
    icon: BarChart2,
    description: 'Instant performance reports with per-question analytics for smarter evaluation.',
  },
  {
    title: 'Role-based Access',
    icon: Users,
    description: 'Every role gets the right access – secure, simple, and organized.',
  },
  {
    title: 'Smart Authentication',
    icon: UserCheck,
    description: 'Quick signup and secure login. Start creating tests in seconds.',
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
            Create Tests & Manage Students with{' '}
            <span className="bg-gradient-to-r from-yellow-300 via-pink-500 to-purple-600 text-transparent bg-clip-text drop-shadow-lg">
              Test Room
            </span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-white/90">
            Whether you’re a parent, tutor, or institute – Test Room lets you create online tests,
            track performance, and manage everything in one place.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="text-base font-semibold">
              <Link to="/register-org">🚀 Get Started for Free</Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-base text-white border bg-white/10 hover:bg-white/20"
            >
              <Link to="/demo">🎯 Try Demo</Link>
            </Button>

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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">How It Works</h2>
          <p className="text-muted-foreground text-lg mb-10">
            Getting started is quick and easy – no waiting, no verification needed.
          </p>
          <div className="grid gap-10 sm:grid-cols-3 text-left">
            <div className="p-6 bg-muted rounded-2xl shadow-lg border border-border hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold mb-2">1. Sign Up</h3>
              <p className="text-muted-foreground">
                Just enter your name, email, and password to create your account.
              </p>
            </div>
            <div className="p-6 bg-muted rounded-2xl shadow-lg border border-border hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold mb-2">2. Start Creating Tests</h3>
              <p className="text-muted-foreground">
                You’re instantly an Admin. Add teachers or students, and begin building your first
                test.
              </p>
            </div>
            <div className="p-6 bg-muted rounded-2xl shadow-lg border border-border hover:shadow-xl transition-all duration-300">
              <h3 className="text-xl font-semibold mb-2">3. Share & Track Results</h3>
              <p className="text-muted-foreground">
                Students can log in, attempt tests, and results are available instantly for review.
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose Test Room?</h2>
          <p className="text-muted-foreground text-lg mb-6">
            Designed for parents, tutors, and institutes alike – Test Room makes online assessments
            simple:
          </p>
          <ul className="text-left max-w-2xl mx-auto text-base text-muted-foreground space-y-4 list-disc pl-6">
            <li>Create and assign unlimited MCQ tests</li>
            <li>Instant results with performance analytics</li>
            <li>Role-based dashboard for Admin, Teacher, Student</li>
            <li>Secure login & real-time submissions</li>
            <li>Optimized for both desktop and mobile</li>
          </ul>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Made for Everyone</h2>
          <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-muted p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border"
              >
                <feature.icon className="h-10 w-10 mb-4 mx-auto text-primary" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-indigo-700 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to create your first test?</h2>
          <p className="text-lg mb-8">
            Join thousands of users who are already testing smarter with Test Room.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg font-semibold">
            <Link to="/register-org">Get Started</Link>
          </Button>
        </div>
      </section>

      <section
        id="contact-us"
        className="bg-muted/10 py-20 px-6 text-center border-t border-border"
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold">Need Help?</h2>
          <p className="text-muted-foreground mt-3 text-lg">
            Our team is here to support you. Reach out for help, feedback, or demo.
          </p>
          <Link to="/contact-us">
            <Button className="mt-6 text-base px-6 py-2">📬 Contact Us</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background text-muted-foreground text-sm py-6 border-t mt-auto text-center">
        <p>© {new Date().getFullYear()} Test Room. All rights reserved.</p>
      </footer>

      <ScrollToTop />
    </div>
  );
};

export default LandingPage;
