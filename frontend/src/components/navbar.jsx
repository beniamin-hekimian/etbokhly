import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, UserCircle2, LogOut, ShoppingCart, LogIn, ChevronDown } from "lucide-react";
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

function NavLinks({ links, isChef, pathname, navLinkClass, t }) {
  return (
    <>
      {links.map(({ href, label }) => (
        <Link key={href} href={href} className={navLinkClass(href)}>
          {label}
        </Link>
      ))}

      {isChef && (
        <Link href="/chef/orders" className={navLinkClass("/chef/orders")}>
          {t.nav.receivedOrders}
        </Link>
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
  const [desktopAdminOpen, setDesktopAdminOpen] = useState(false);
  const [mobileAdminOpen, setMobileAdminOpen] = useState(false);
  const desktopAdminRef = useRef(null);

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/meals", label: t.nav.meals },
    { href: "/orders", label: t.nav.orders },
  ];

  const adminMenuItems = [
    { href: "/admin/chefs", label: t.admin.chefs.title },
    { href: "/admin/meals", label: t.admin.meals.title },
    { href: "/admin/meal-edits", label: t.admin.mealEdits.title },
  ];

  // Close the desktop dashboard dropdown when clicking outside of it
  useEffect(() => {
    if (!desktopAdminOpen) return;

    const handleOutsideClick = (event) => {
      if (desktopAdminRef.current && !desktopAdminRef.current.contains(event.target)) {
        setDesktopAdminOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [desktopAdminOpen]);

  // Fetch the cart on mount and whenever the user becomes authenticated.
  // The cart badge is fed live by the shared CartProvider afterwards.
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }

    const handleRouteChange = () => {
      setMenuOpen(false);
      setDesktopAdminOpen(false);
      setMobileAdminOpen(false);
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
            isChef={user?.role === "CHEF"}
            pathname={router.pathname}
            navLinkClass={navLinkClass}
            t={t}
          />

          {user?.role === "ADMIN" && (
            <div className="relative" ref={desktopAdminRef}>
              <button
                type="button"
                onClick={() => setDesktopAdminOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 py-1.5 font-bold transition-colors ${
                  isActive(router.pathname, "/admin")
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {t.nav.dashboard}
                <ChevronDown className={`h-4 w-4 transition-transform ${desktopAdminOpen ? "rotate-180" : ""}`} />
              </button>

              {desktopAdminOpen && (
                <div className="absolute top-full ltr:left-0 rtl:right-0 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                  {adminMenuItems.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`block px-4 py-2.5 text-sm font-semibold transition-colors ${
                        isActive(router.pathname, href)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
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
              isChef={user?.role === "CHEF"}
              pathname={router.pathname}
              navLinkClass={navLinkClass}
              t={t}
            />

            {user?.role === "ADMIN" && (
              <div className="w-full">
                <button
                  type="button"
                  onClick={() => setMobileAdminOpen((prev) => !prev)}
                  className={`flex w-full items-center justify-between py-1.5 font-bold transition-colors ${
                    isActive(router.pathname, "/admin")
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  <span>{t.nav.dashboard}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileAdminOpen ? "rotate-180" : ""}`} />
                </button>

                {mobileAdminOpen && (
                  <div className="mt-2 flex flex-col gap-3 border-s-2 border-border ps-4">
                    {adminMenuItems.map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className={`text-sm font-semibold transition-colors ${
                          isActive(router.pathname, href)
                            ? "text-primary"
                            : "text-foreground hover:text-primary"
                        }`}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

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
