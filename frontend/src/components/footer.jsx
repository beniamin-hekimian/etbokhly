import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

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

export function Footer() {
  const { t } = useTranslation();

  const NAV_LINKS = [
    { label: t.footer.home, href: "/" },
    { label: t.footer.meals, href: "/meals" },
    { label: t.footer.orders, href: "/orders" },
    { label: t.footer.profile, href: "/profile" },
  ];

  return (
    <footer className="bg-[#1f2939] dark:bg-[#131b27] text-gray-400 pt-12 pb-0">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Content */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 pb-8 border-b border-white/10">
          {/* Brand Info */}
          <div className="max-w-md text-center md:text-start">
            <Link href="/" className="inline-flex items-center gap-3 text-xl font-bold text-white mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <LogoIcon />
              </div>
              <span>{t.footer.brandName}</span>
            </Link>
            <p className="text-sm leading-relaxed">{t.footer.description}</p>
          </div>

          {/* Horizontal Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer Bottom Bar */}
        <div className="text-center py-6">
          <p className="text-sm text-gray-400">{t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
