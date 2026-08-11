import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Loading from "@/components/loading";

export default function HomePage() {
  const { user, loading, logout, isAuthenticated } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {isAuthenticated ? (
        <div className="bg-card p-6 rounded-lg shadow-sm border">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user.full_name}! 👋</h1>
          <p className="text-muted-foreground">
            Logged in account email: <span className="font-medium text-foreground">{user.email}</span>
          </p>
          <p className="text-muted-foreground">
            Account Role Status: <span className="font-mono text-sm px-2 py-0.5 bg-muted rounded">{user.role}</span>
          </p>

          <button
            onClick={logout}
            className="mt-6 px-4 py-2 bg-destructive text-destructive-foreground font-semibold rounded hover:bg-destructive/90 transition"
          >
            Logout Securely
          </button>
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 font-display">Welcome to Etbokhly</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover home-cooked premium meal orders right at your fingertips.
          </p>
          <div className="space-x-4">
            <Link
              href="/auth/signup"
              className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded shadow hover:bg-primary/90"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-3 bg-secondary text-secondary-foreground font-medium rounded shadow hover:bg-secondary/90"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
