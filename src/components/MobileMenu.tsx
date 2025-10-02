import { useLocation } from 'react-router';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';

export function MobileMenu({ currentUser, navLinks }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        {/* Trigger button */}
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>

        {/* Sidebar content */}
        <SheetContent side="right" className="w-72 p-0">
          {/* Header */}
          <div
            className="sticky top-0 z-10 flex items-center justify-between 
                        bg-gradient-to-r from-indigo-600 to-purple-700 
                        px-5 py-4 text-white shadow-md"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">Menus</span>
            </div>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
              >
                ✕
              </Button>
            </SheetTrigger>
          </div>

          {/* Links */}
          <div className="px-6 py-4 flex flex-col gap-4">
            {currentUser?.user?.role && (
              <Link
                to={`/${currentUser.user.role}`}
                className={`font-semibold transition text-base ${
                  location.pathname === `/${currentUser.user.role}`
                    ? 'text-indigo-600'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setOpen(false)} // close sidebar on click
              >
                Dashboard
              </Link>
            )}

            {navLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className={`transition text-base ${
                  location.pathname === link.href
                    ? 'text-indigo-600 font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setOpen(false)} // close sidebar on click
              >
                {link.label}
              </a>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
