import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useAdminChefs } from "@/hooks/useAdmin";
import { useTranslation } from "@/hooks/useTranslation";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ChefCard from "@/components/admin/chef-card";
import RejectChefDialog from "@/components/admin/reject-chef-dialog";

export default function AdminChefsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { chefs, loading, error, actionLoading, fetchChefRequests, approveChef, rejectChef } = useAdminChefs();
  const { t } = useTranslation();

  const [selectedChef, setSelectedChef] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === "ADMIN") {
      queueMicrotask(() => fetchChefRequests());
    }
  }, [authLoading, isAuthenticated, user, fetchChefRequests]);

  if (authLoading || loading) return <Loading />;

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center py-20">
        <Card className="w-full max-w-md border-border/60 bg-card shadow-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl font-bold text-foreground">{t.admin.chefs.accessDeniedTitle}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t.admin.chefs.accessDeniedDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/profile">
              <Button>{t.admin.chefs.backToProfile}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center py-20">
        <Card className="w-full max-w-md border-border/60 bg-card shadow-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl font-bold text-foreground">{t.admin.chefs.title}</CardTitle>
            <CardDescription className="text-xs font-medium text-destructive">{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="secondary" onClick={() => window.location.reload()}>
              {t.admin.chefs.retry}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function handleRejectConfirm() {
    if (!selectedChef || !rejectReason.trim()) return;
    const ok = await rejectChef(selectedChef.id, rejectReason);
    if (ok) {
      setRejectDialogOpen(false);
      setSelectedChef(null);
      setRejectReason("");
    }
  }

  return (
    <>
      <Head>
        <title>{t.admin.chefs.metaTitle}</title>
      </Head>

      <div className="mx-auto w-full max-w-6xl space-y-6 p-4">
        <div className="space-y-2 text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t.admin.chefs.title}
          </h1>
          <p className="text-sm text-muted-foreground">{t.admin.chefs.description}</p>
        </div>

        {chefs.length === 0 ? (
          <Card className="border-border/60 bg-card shadow-sm">
            <CardContent className="flex min-h-40 items-center justify-center">
              <p className="text-sm text-muted-foreground">{t.admin.chefs.emptyState}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {chefs.map((chef) => (
              <ChefCard
                key={chef.id}
                chef={chef}
                actionLoading={actionLoading}
                onApprove={approveChef}
                onOpenReject={(c) => {
                  setSelectedChef(c);
                  setRejectReason("");
                  setRejectDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <RejectChefDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        chef={selectedChef}
        reason={rejectReason}
        setReason={setRejectReason}
        actionLoading={actionLoading}
        onConfirm={handleRejectConfirm}
      />
    </>
  );
}
