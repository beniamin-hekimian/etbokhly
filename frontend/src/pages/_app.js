import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Cairo, Tajawal } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useTranslation } from "@/hooks/useTranslation";
import "@/styles/globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

export default function App({ Component, pageProps }) {
  const { locale } = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = locale || "ar";
  }, [locale]);

  return (
    <div className={`${cairo.className} ${cairo.variable} ${tajawal.variable}`}>
      <Head>
        <title>{t.meta.title}</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <Navbar />
          <Component {...pageProps} />
          <Footer />
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}
