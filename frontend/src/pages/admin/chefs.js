import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Loading from "@/components/loading";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminChefsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedChef, setSelectedChef] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchChefRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch("/api/admin/chefs", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Failed to load chef requests.");
      }

      setChefs(result.data || []);
    } catch (err) {
      console.error("Failed to fetch chef requests:", err);
      setError(err.message || "Failed to load chef requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.role !== "ADMIN") {
      return;
    }

    queueMicrotask(() => {
      fetchChefRequests();
    });
  }, [authLoading, isAuthenticated, user]);

  const handleApprove = async (chefId) => {
    try {
      setActionLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`/api/admin/chefs/${chefId}/approve`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Failed to approve chef request.");
      }

      toast.success("Chef request approved.");

      await fetchChefRequests();
    } catch (err) {
      console.error("Failed to approve chef request:", err);
      toast.error(err.message || "Failed to approve chef request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRejectDialog = (chef) => {
    setSelectedChef(chef);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedChef) return;

    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }

    try {
      setActionLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`/api/admin/chefs/${selectedChef.id}/reject`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: rejectReason.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Failed to reject chef request.");
      }

      toast.success("Chef request rejected.");

      setRejectDialogOpen(false);
      setSelectedChef(null);
      setRejectReason("");

      await fetchChefRequests();
    } catch (err) {
      console.error("Failed to reject chef request:", err);
      toast.error(err.message || "Failed to reject chef request.");
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return <Loading />;
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center py-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to view chef requests.</CardDescription>
          </CardHeader>

          <CardContent className="flex justify-center">
            <Button>
              <Link href="/profile">Back to Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center py-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Chef Requests</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>

          <CardContent className="flex justify-center">
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Chef Requests | Etbokhly</title>
      </Head>

      <div className="mx-auto w-full max-w-6xl space-y-6 p-4">
        <div className="space-y-2 text-center">
          <h1 className="font-display text-5xl text-secondary sm:text-6xl">Chef Requests</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Review users who have requested to become chefs.</p>
        </div>

        {chefs.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-40 items-center justify-center">
              <p className="text-muted-foreground">No chef requests found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {chefs.map((chef) => {
              const avatarSrc = chef.profile_image?.trim() ? chef.profile_image : "/avatar.webp";

              const status = chef.chefRequestStatus;

              return (
                <Card key={chef.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border bg-muted">
                          <Image
                            src={avatarSrc}
                            alt={`${chef.full_name} avatar`}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <CardTitle className="truncate text-xl">{chef.full_name}</CardTitle>

                          <CardDescription className="truncate">{chef.email}</CardDescription>
                        </div>
                      </div>

                      <Badge
                        variant={
                          status === "APPROVED" ? "default" : status === "REJECTED" ? "destructive" : "secondary"
                        }
                      >
                        {status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5 grow">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border bg-background p-3">
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="mt-1 break-all text-sm">{chef.phone || "Not provided"}</p>
                      </div>

                      <div className="rounded-lg border bg-background p-3">
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="mt-1 break-all text-sm">{chef.location || "Not provided"}</p>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-background p-3">
                      <p className="text-xs text-muted-foreground">Bio</p>
                      <p className="mt-1 text-sm">{chef.bio || "No bio provided."}</p>
                    </div>

                    {status === "REJECTED" && chef.chefRequestRejectReason && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                        <p className="text-xs text-destructive">Rejection Reason</p>
                        <p className="mt-1 text-sm">{chef.chefRequestRejectReason}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex items-center justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={actionLoading || status === "APPROVED" || status === "REJECTED"}
                      onClick={() => handleOpenRejectDialog(chef)}
                    >
                      Reject
                    </Button>

                    <Button
                      type="button"
                      disabled={actionLoading || status === "APPROVED" || status === "REJECTED"}
                      onClick={() => handleApprove(chef.id)}
                    >
                      Approve
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={rejectDialogOpen}
        onOpenChange={(open) => {
          if (!actionLoading) {
            setRejectDialogOpen(open);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Chef Request</DialogTitle>

            <DialogDescription>
              Enter a reason for rejecting {selectedChef?.full_name}&apos;s chef request.
            </DialogDescription>
          </DialogHeader>

          <Input
            id="reject-reason"
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            disabled={actionLoading}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRejectDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectReason.trim()}
            >
              {actionLoading ? "Rejecting..." : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
