import { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import Loading from "@/components/loading";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, login } = useAuth();
  const { t } = useTranslation();

  const [isUpdating, setIsUpdating] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      passwordCurrent: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (formData) => {
    setIsUpdating(true);
    setServerError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/user/updatepassword", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          passwordCurrent: formData.passwordCurrent,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || t?.profile?.changePassword?.updateError);
      }

      if (result.status === "success") {
        login(result.token, result.data.user);
        toast.success(t?.profile?.changePassword?.successToast);
        router.push("/profile");
      }
    } catch (err) {
      setServerError(err.message);
      toast.error(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
        <Head>
          <title>{t?.profile?.changePassword?.metaTitle} | Etbokhly</title>
        </Head>

        <Card className="w-full max-w-md border-border bg-card shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
              {t?.profile?.changePassword?.title}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t?.profile?.changePassword?.signInRequired}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/auth/login">
              <Button className="font-bold shadow-xs">{t?.profile?.changePassword?.goToLogin}</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Head>
        <title>{t?.profile?.changePassword?.metaTitle} | Etbokhly</title>
      </Head>

      <Card className="w-full max-w-md border-border bg-card shadow-sm">
        <CardHeader className="text-center space-y-1.5">
          <CardTitle className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
            {t?.profile?.changePassword?.title}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {t?.profile?.changePassword?.subtitle}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Current Password Field */}
            <div className="space-y-2">
              <Label htmlFor="passwordCurrent" className="font-semibold text-foreground">
                {t?.profile?.changePassword?.currentPassword}
              </Label>
              <Input
                {...register("passwordCurrent", {
                  required: t?.profile?.changePassword?.currentPasswordRequired,
                })}
                id="passwordCurrent"
                type="password"
                placeholder="••••••••"
                disabled={isUpdating}
              />
              {errors.passwordCurrent && (
                <p className="text-xs font-medium text-destructive">{errors.passwordCurrent.message}</p>
              )}
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-foreground">
                {t?.profile?.changePassword?.newPassword}
              </Label>
              <Input
                {...register("password", {
                  required: t?.profile?.changePassword?.newPasswordRequired,
                  minLength: {
                    value: 8,
                    message: t?.profile?.changePassword?.minEightChars,
                  },
                })}
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={isUpdating}
              />
              {errors.password && <p className="text-xs font-medium text-destructive">{errors.password.message}</p>}
            </div>

            {/* Confirm New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-semibold text-foreground">
                {t?.profile?.changePassword?.confirmPassword}
              </Label>
              <Input
                {...register("confirmPassword", {
                  required: t?.profile?.changePassword?.confirmPasswordRequired,
                  validate: (val) => val === getValues("password") || t?.profile?.changePassword?.passwordsDoNotMatch,
                })}
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                disabled={isUpdating}
              />
              {errors.confirmPassword && (
                <p className="text-xs font-medium text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Isolated Backend Response Error Container */}
            {serverError && (
              <p className="rounded border border-destructive/20 bg-destructive/10 p-2 text-center text-xs font-medium text-destructive">
                {serverError}
              </p>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Link href="/profile">
                <Button type="button" variant="outline" className="font-bold shadow-xs">
                  {t?.profile?.changePassword?.cancel}
                </Button>
              </Link>

              <Button type="submit" className="gap-2 font-bold shadow-xs" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t?.profile?.changePassword?.updating}
                  </>
                ) : (
                  t?.profile?.changePassword?.submit
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
