import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Circle, Loader2 } from "lucide-react";

import Loading from "@/components/loading";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BecomeChefPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  const [profile, setProfile] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phone: "",
      location: "",
      bio: "",
    },
  });

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [profileResponse, statusResponse] = await Promise.all([
          fetch("/api/user/profile", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch("/api/user/chefrequeststatus", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const profileResult = await profileResponse.json();
        const statusResult = await statusResponse.json();

        if (!profileResponse.ok || profileResult.status !== "success") {
          throw new Error(profileResult.message || t?.profile?.becomeChef?.loadError);
        }

        const userProfile = profileResult.data;

        setProfile(userProfile);

        reset({
          phone: userProfile.phone ?? "",
          location: userProfile.location ?? "",
          bio: userProfile.bio ?? "",
        });

        if (statusResponse.ok && statusResult.status === "success") {
          setRequestStatus(statusResult.data.chefRequestStatus);
          setRejectReason(statusResult.data.chefRequestRejectReason || "");
        }
      } catch (error) {
        console.error("Failed to load become-a-chef page:", error);
        setPageError(error.message || t?.profile?.becomeChef?.loadError);
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [authLoading, isAuthenticated, reset, t]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setPageError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/user/requestchef", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: data.phone,
          location: data.location,
          bio: data.bio,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || t?.profile?.becomeChef?.submitError);
      }

      setRequestStatus("PENDING");
      setRejectReason("");

      toast.success(result.message || t?.profile?.becomeChef?.pendingNotice);

      router.push("/profile");
    } catch (error) {
      console.error("Failed to send chef request:", error);
      setPageError(error.message);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || (isAuthenticated && isFetching)) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
        <Head>
          <title>{t?.profile?.becomeChef?.metaTitle} | Etbokhly</title>
        </Head>

        <Card className="w-full max-w-md border-border bg-card shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
              {t?.profile?.becomeChef?.title}
            </CardTitle>

            <CardDescription className="text-muted-foreground">
              {t?.profile?.becomeChef?.signInRequired}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex justify-center">
            <Link href="/auth/login">
              <Button className="font-bold shadow-xs">{t?.profile?.becomeChef?.goToLogin}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pageError && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
        <Head>
          <title>{t?.profile?.becomeChef?.metaTitle} | Etbokhly</title>
        </Head>

        <Card className="w-full max-w-md border-border bg-card shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
              {t?.profile?.becomeChef?.title}
            </CardTitle>

            <CardDescription className="text-muted-foreground">{pageError}</CardDescription>
          </CardHeader>

          <CardContent className="flex justify-center">
            <Link href="/profile">
              <Button variant="outline" className="font-bold shadow-xs">
                {t?.profile?.becomeChef?.backToProfile}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPending = requestStatus === "PENDING";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Head>
        <title>{t?.profile?.becomeChef?.metaTitle} | Etbokhly</title>
      </Head>

      <Card className="w-full max-w-md border-border bg-card shadow-sm">
        <CardHeader className="text-center space-y-1.5">
          <CardTitle className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
            {t?.profile?.becomeChef?.title}
          </CardTitle>

          <CardDescription className="text-sm text-muted-foreground">
            {t?.profile?.becomeChef?.subtitle}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          {isPending && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
              <Circle className="h-2.5 w-2.5 shrink-0 animate-pulse fill-amber-500 stroke-none" />
              {t?.profile?.becomeChef?.pendingNotice}
            </div>
          )}

          {requestStatus === "REJECTED" && rejectReason && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-red-700">
                <Circle className="h-2.5 w-2.5 shrink-0 animate-pulse fill-red-500 stroke-none" />
                {t?.profile?.becomeChef?.rejectedNotice}
              </div>

              <p className="mt-1 text-sm text-red-600">{rejectReason}</p>

              <p className="mt-2 text-xs text-red-600">{t?.profile?.becomeChef?.updateInfoHint}</p>
            </div>
          )}

          {requestStatus === "REJECTED" && !rejectReason && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <Circle className="h-2.5 w-2.5 shrink-0 animate-pulse fill-red-500 stroke-none" />
              {t?.profile?.becomeChef?.rejectedNoticeNew}
            </div>
          )}

          {pageError && <p className="mb-4 text-center text-xs font-medium text-destructive">{pageError}</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="font-semibold text-foreground">
                {t?.profile?.becomeChef?.phone}
              </Label>

              <Input
                {...register("phone", {
                  required: t?.profile?.becomeChef?.phoneRequired,
                })}
                id="phone"
                type="text"
                autoComplete="tel"
                placeholder={t?.profile?.becomeChef?.phonePlaceholder}
                disabled={isPending || isSubmitting}
              />

              {errors.phone && <p className="text-xs font-medium text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="font-semibold text-foreground">
                {t?.profile?.becomeChef?.location}
              </Label>

              <Input
                {...register("location", {
                  required: t?.profile?.becomeChef?.locationRequired,
                })}
                id="location"
                type="text"
                placeholder={t?.profile?.becomeChef?.locationPlaceholder}
                disabled={isPending || isSubmitting}
              />

              {errors.location && <p className="text-xs font-medium text-destructive">{errors.location.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="font-semibold text-foreground">
                {t?.profile?.becomeChef?.bio}
              </Label>

              <Input
                {...register("bio", {
                  required: t?.profile?.becomeChef?.bioRequired,
                })}
                id="bio"
                type="text"
                placeholder={t?.profile?.becomeChef?.bioPlaceholder}
                disabled={isPending || isSubmitting}
              />

              {errors.bio && <p className="text-xs font-medium text-destructive">{errors.bio.message}</p>}
            </div>

            <Button type="submit" className="w-full gap-2 font-bold shadow-xs" disabled={isPending || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t?.profile?.becomeChef?.submitting}
                </>
              ) : isPending ? (
                t?.profile?.becomeChef?.requestPending
              ) : (
                t?.profile?.becomeChef?.submitRequest
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-border/60 pt-4 text-sm text-muted-foreground">
          <Link href="/profile" className="font-medium text-blue-500 hover:text-blue-600 hover:underline">
            {t?.profile?.becomeChef?.backToProfile}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}