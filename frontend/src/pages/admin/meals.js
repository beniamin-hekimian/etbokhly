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

export default function AdminMealsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedMeal, setSelectedMeal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMealRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch("/api/admin/meals", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Failed to load meal requests.");
      }

      setMeals(result.data || []);
    } catch (err) {
      console.error("Failed to fetch meal requests:", err);
      setError(err.message || "Failed to load meal requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.role !== "ADMIN") {
      return;
    }

    queueMicrotask(() => {
      fetchMealRequests();
    });
  }, [authLoading, isAuthenticated, user]);

  const handleApprove = async (mealId) => {
    try {
      setActionLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`/api/admin/meals/${mealId}/approve`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Failed to approve meal request.");
      }

      toast.success("Meal request approved.");

      await fetchMealRequests();
    } catch (err) {
      console.error("Failed to approve meal request:", err);
      toast.error(err.message || "Failed to approve meal request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRejectDialog = (meal) => {
    setSelectedMeal(meal);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedMeal) return;

    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }

    try {
      setActionLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(`/api/admin/meals/${selectedMeal.id}/reject`, {
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
        throw new Error(result.message || "Failed to reject meal request.");
      }

      toast.success("Meal request rejected.");

      setRejectDialogOpen(false);
      setSelectedMeal(null);
      setRejectReason("");

      await fetchMealRequests();
    } catch (err) {
      console.error("Failed to reject meal request:", err);
      toast.error(err.message || "Failed to reject meal request.");
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
            <CardDescription>You do not have permission to view meal requests.</CardDescription>
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
            <CardTitle>Meal Requests</CardTitle>
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
        <title>Meal Requests | Etbokhly</title>
      </Head>

      <div className="mx-auto w-full max-w-6xl space-y-6 p-4">
        <div className="space-y-2 text-center">
          <h1 className="font-display text-5xl text-secondary sm:text-6xl">Meal Requests</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Review meals submitted by chefs for approval.</p>
        </div>

        {meals.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-40 items-center justify-center">
              <p className="text-muted-foreground">No meal requests found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {meals.map((meal) => {
              const mealPhotoSrc = meal.photo?.trim() ? meal.photo : "/placeholder-meal.webp";
              const chefAvatarSrc = meal.user?.profile_image?.trim() ? meal.user.profile_image : "/avatar.webp";
              const status = meal.mealRequestStatus;

              return (
                <Card key={meal.id} className="flex gap-0 flex-col sm:flex-row overflow-hidden border py-0">
                  {/* Left Side: Meal Image Container */}
                  <div className="relative h-48 sm:h-auto sm:w-48 shrink-0 bg-muted/40 border-b sm:border-b-0 sm:border-r">
                    <Image
                      src={mealPhotoSrc}
                      alt={meal.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 192px"
                      className="object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 sm:hidden">
                      <Badge
                        variant={
                          status === "APPROVED" ? "default" : status === "REJECTED" ? "destructive" : "secondary"
                        }
                      >
                        {status}
                      </Badge>
                    </div>
                  </div>

                  {/* Right Side: Details & Actions */}
                  <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
                    <div className="space-y-2.5">
                      {/* Header: Title & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="truncate text-lg sm:text-xl font-bold">{meal.title}</CardTitle>
                        <Badge
                          className="hidden sm:inline-flex shrink-0"
                          variant={
                            status === "APPROVED" ? "default" : status === "REJECTED" ? "destructive" : "secondary"
                          }
                        >
                          {status}
                        </Badge>
                      </div>

                      {/* Price & Tags Inline */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-primary">${meal.price}</span>
                        {meal.tags?.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 border-l pl-2">
                            {meal.tags.map((item) => (
                              <Badge key={item.tag_id} variant="outline" className="text-[11px] px-2 py-0 h-5">
                                {item.tag?.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Inline Description */}
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        <span className="font-bold text-foreground">Description: </span>
                        {meal.content || "No description provided."}
                      </p>

                      {/* Boxed Chef Details Field */}
                      <div className="rounded-md border bg-muted/30 p-2 text-xs">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">
                          Chef Details
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border bg-background">
                            <Image
                              src={chefAvatarSrc}
                              alt={`${meal.user?.full_name} avatar`}
                              fill
                              sizes="28px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1 truncate">
                            <span className="font-medium text-foreground">
                              {meal.user?.full_name || "Unknown Chef"}
                            </span>
                            {meal.user?.email && (
                              <span className="text-muted-foreground ml-1.5 hidden sm:inline">• {meal.user.email}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Rejection Reason Display */}
                      {status === "REJECTED" && meal.mealRequestRejectReason && (
                        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-2 text-xs text-destructive">
                          <span className="font-semibold">Reason: </span>
                          {meal.mealRequestRejectReason}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={actionLoading || status === "APPROVED" || status === "REJECTED"}
                        onClick={() => handleOpenRejectDialog(meal)}
                      >
                        Reject
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        disabled={actionLoading || status === "APPROVED" || status === "REJECTED"}
                        onClick={() => handleApprove(meal.id)}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Reason Modal */}
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
            <DialogTitle>Reject Meal Request</DialogTitle>
            <DialogDescription>Enter a reason for rejecting &quot;{selectedMeal?.title}&quot;.</DialogDescription>
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
