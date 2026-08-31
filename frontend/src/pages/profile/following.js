import Head from "next/head";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Users } from "lucide-react";

import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useMyFollowing } from "@/hooks/useFollows";
import { useTranslation } from "@/hooks/useTranslation";
import ChefCard from "@/components/chefs/chef-follow-card";

export default function MyFollowingPage() {
  const router = useRouter();
  const { t, isRTL } = useTranslation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { chefs, loading, error, page, setPage, meta, retry } = useMyFollowing();

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  useEffect(
    function () {
      if (!authLoading && !isAuthenticated) {
        toast.error(t.toast.loginRequired, { id: "following-auth-required" });
        router.replace("/auth/login");
      }
    },
    [authLoading, isAuthenticated, router, t],
  );

  if (authLoading || !isAuthenticated) {
    return <Loading />;
  }

  if (loading) {
    return <Loading />;
  }

  const totalPages = meta?.totalPages || 1;
  const hasPrev = (meta?.page || 1) > 1;
  const hasNext = (meta?.page || 1) < totalPages;

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <Head>
        <title>{t.follows.pageMetaTitle}</title>
      </Head>

      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Back Link */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <BackIcon className="h-4 w-4" />
          {t.follows.backToProfile}
        </Link>

        {/* Page Header */}
        <div className="space-y-2 border-b border-border pb-6">
          <h1 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">{t.follows.title}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{t.follows.description}</p>
        </div>

        {error ? (
          <Card className="border-border/60 bg-card shadow-sm">
            <CardContent className="flex min-h-60 flex-col items-center justify-center gap-4">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" onClick={retry}>
                {t.follows.retry}
              </Button>
            </CardContent>
          </Card>
        ) : chefs.length === 0 ? (
          <Card className="border-border/60 bg-card shadow-sm">
            <CardContent className="flex min-h-60 flex-col items-center justify-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-8 w-8" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-foreground">{t.follows.emptyFollowingTitle}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.follows.emptyFollowingDescription}</p>
              </div>
              <Link href="/meals">
                <Button className="font-bold">{t.follows.discoverChefs}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {chefs.map((chef) => (
                <ChefCard key={chef.id} chef={chef} />
              ))}
            </div>

            {(hasPrev || hasNext) && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" disabled={!hasPrev} onClick={() => setPage((p) => p - 1)}>
                  {t.likes.prevPage}
                </Button>
                <span className="text-sm font-bold text-muted-foreground">
                  {meta.page} / {totalPages}
                </span>
                <Button variant="outline" disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>
                  {t.likes.nextPage}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}