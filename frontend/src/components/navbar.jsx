import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, UserCircle2, LogOut, ShoppingCart, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useTranslation } from "@/hooks/useTranslation";
import { useCart } from "@/hooks/useCart";

function isActive(pathname, href) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function LogoIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10c0-4 4-7 9-7s9 3 9 7" />
      <path d="M4 10h16l-1.2 8.2A2 2 0 0 1 16.8 20H7.2a2 2 0 0 1-2-1.8L4 10z" />
    </svg>
  );
}

function NavLinks({ links, isAdmin, pathname, navLinkClass, t }) {
  return (
    <>
      {links.map(({ href, label }) => (
        <Link key={href} href={href} className={navLinkClass(href)}>
          {label}
        </Link>
      ))}

      {isAdmin && (
        <>
          <Link href="/admin/chefs" className={navLinkClass("/admin/chefs")}>
            {t.nav.chefRequests}
          </Link>
          <Link href="/admin/meals" className={navLinkClass("/admin/meals")}>
            {t.nav.mealRequests}
          </Link>
        </>
      )}
    </>
  );
}

export function Navbar() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { cartData, fetchCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/meals", label: t.nav.meals },
    { href: "/orders", label: t.nav.orders },
  ];

  // Fetch cart on mount and whenever route finishes changing (e.g. returning from adding to cart)
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }

    const handleRouteChange = () => {
      setMenuOpen(false);
      if (isAuthenticated) {
        fetchCart();
      }
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [isAuthenticated, fetchCart, router.events]);

  const totalItemCount = cartData.reduce((acc, order) => {
    const itemsCount = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
    return acc + itemsCount;
  }, 0);

  if (loading) {
    return <header className="sticky top-0 z-50 h-16 w-full border-b bg-background/80 backdrop-blur-md" />;
  }

  const navLinkClass = (href) =>
    `relative py-1.5 font-bold transition-colors after:absolute after:bottom-0 after:right-0 after:h-0.5 after:bg-primary after:transition-all ${
      isActive(router.pathname, href)
        ? "text-primary after:w-full"
        : "text-foreground hover:text-primary after:w-0 hover:after:w-full"
    }`;

  const renderCartIcon = (
    <Link href="/cart">
      <Button size="icon" variant="outline" className="relative rounded-full">
        <ShoppingCart className="h-5 w-5" />
        {totalItemCount > 0 && (
          <Badge className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.7rem] font-extrabold text-primary-foreground">
            {totalItemCount}
          </Badge>
        )}
      </Button>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 flex h-16 w-full items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 text-xl font-bold">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <LogoIcon />
          </div>
          <span>{t.nav.brand}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <NavLinks
            links={navLinks}
            isAdmin={user?.role === "ADMIN"}
            pathname={router.pathname}
            navLinkClass={navLinkClass}
            t={t}
          />
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle />
          <ThemeToggle />

          {renderCartIcon}

          {isAuthenticated ? (
            <>
              <Link href="/profile">
                <Button size="icon" variant="outline">
                  <UserCircle2 />
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="gap-2 font-bold text-destructive hover:bg-destructive/10"
                onClick={logout}
              >
                <LogOut />
                {t.nav.logout}
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button className="px-4 font-bold shadow-md shadow-primary/20">{t.nav.signIn}</Button>
            </Link>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <ThemeToggle />

          {renderCartIcon}

          {isAuthenticated && (
            <Link href="/profile">
              <Button size="icon" variant="outline">
                <UserCircle2 />
              </Button>
            </Link>
          )}

          <Button size="icon" variant="outline" onClick={() => setMenuOpen((prev) => !prev)}>
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="border-t bg-background px-6 py-4 md:hidden">
          <nav className="flex flex-col items-start gap-4">
            <NavLinks
              links={navLinks}
              isAdmin={user?.role === "ADMIN"}
              pathname={router.pathname}
              navLinkClass={navLinkClass}
              t={t}
            />

            {/* Auth Action in Mobile Drawer */}
            <div className="mt-2 w-full border-t pt-3">
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  className="h-auto p-0 font-bold text-destructive hover:bg-transparent hover:text-destructive"
                  onClick={logout}
                >
                  <LogOut />
                  {t.nav.logout}
                </Button>
              ) : (
                <Link href="/auth/login" className="flex items-center justify-center gap-2">
                  <Button className="w-full rounded-full font-bold shadow-md shadow-primary/20">
                    <LogIn />
                    {t.nav.signIn}
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
