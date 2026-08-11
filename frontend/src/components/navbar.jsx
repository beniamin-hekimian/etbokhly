import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, UserCircle2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/meals", label: "Meals" },
  { href: "/orders", label: "Orders" },
];

function isActivePath(pathname, href) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const closeMenu = () => setMobileMenuOpen(false);
    router.events.on("routeChangeStart", closeMenu);

    return () => {
      router.events.off("routeChangeStart", closeMenu);
    };
  }, [router.events]);

  if (loading) {
    return <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl h-16" />;
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <Image src="/logo.webp" alt="Etbokhly" width={40} height={40} />
          <span className="font-display text-3xl tracking-wide text-secondary sm:text-4xl">Etbokhly</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = isActivePath(router.pathname, link.href);

            return (
              <Link key={link.href} href={link.href}>
                <Button variant={active ? "secondary" : "ghost"}>{link.label}</Button>
              </Link>
            );
          })}

          {user?.role === "ADMIN" && (
            <>
              <Link href="/admin/chefs">
                <Button
                  variant={isActivePath(router.pathname, "/admin/chefs") ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  Chef Requests
                </Button>
              </Link>
              <Link href="/admin/meals">
                <Button
                  variant={isActivePath(router.pathname, "/admin/meals") ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  Meal Requests
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              {/* Added standard flex layout to alignment links without changing button core styles */}
              <Link href="/profile">
                <Button variant="outline" aria-label="Open profile" className="flex items-center gap-2">
                  <UserCircle2 className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </Link>

              <Button variant="ghost" className="text-destructive flex items-center gap-2" onClick={logout}>
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            <Link href="/auth/signup">
              <Button>Signup</Button>
            </Link>
          )}
        </div>

        {/* Mobile View Toggle & Conditional Icons */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          {isAuthenticated ? (
            <Link href="/profile">
              <Button variant="outline" size="icon" aria-label="Open profile">
                <UserCircle2 className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/auth/signup">
              <Button>Signup</Button>
            </Link>
          )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen((current) => !current)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Links */}
      <div
        id="mobile-navigation"
        className={`border-t bg-background/95 px-4 backdrop-blur-xl transition-all duration-200 md:hidden ${
          mobileMenuOpen ? "max-h-96 opacity-100 py-3" : "pointer-events-none max-h-0 overflow-hidden opacity-0"
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2">
          {navLinks.map((link) => {
            const active = isActivePath(router.pathname, link.href);

            return (
              <Link key={link.href} href={link.href}>
                <Button variant={active ? "secondary" : "ghost"} className="w-full justify-start">
                  {link.label}
                </Button>
              </Link>
            );
          })}

          {user?.role === "ADMIN" && (
            <>
              <Link href="/admin/chefs">
                <Button
                  variant={isActivePath(router.pathname, "/admin/chefs") ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  Chef Requests
                </Button>
              </Link>
              <Link href="/admin/meals">
                <Button
                  variant={isActivePath(router.pathname, "/admin/meals") ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  Meal Requests
                </Button>
              </Link>
            </>
          )}

          {isAuthenticated && (
            <Button variant="ghost" className="justify-start text-destructive flex items-center gap-2" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
