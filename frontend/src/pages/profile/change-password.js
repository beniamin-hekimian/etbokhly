import { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/loading";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, login } = useAuth();
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
        throw new Error(result.message || "Failed to update your password.");
      }

      if (result.status === "success") {
        // Overwrite old storage with the fresh session token issued by your Express server
        login(result.token, result.data.user);

        toast.success("Password changed successfully!");

        // Push user back to the primary profile card view
        router.push("/profile");
      }
    } catch (err) {
      setServerError(err.message);
      toast.error(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Guard loading pass
  if (authLoading) {
    return (
      <Loading />
    );
  }

  // Security Auth guard boundary
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Update Password</CardTitle>
            <CardDescription>Sign in first to adjust your security credentials.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Head>
        <title>Change Password | Etbokhly</title>
      </Head>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-4xl text-secondary">Update Password</CardTitle>
          <CardDescription>Change your security credentials. Updates your session token automatically.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Current Password Field */}
            <div className="space-y-2">
              <Label htmlFor="passwordCurrent">Current Password</Label>
              <Input
                {...register("passwordCurrent", {
                  required: "Current password is required",
                })}
                id="passwordCurrent"
                type="password"
                placeholder="••••••••"
              />
              {errors.passwordCurrent && <p className="text-sm text-red-500">{errors.passwordCurrent.message}</p>}
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                {...register("password", {
                  required: "New password is required",
                  minLength: { value: 8, message: "Minimum 8 characters" },
                })}
                id="password"
                type="password"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            {/* Confirm New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (val) => val === getValues("password") || "Passwords do not match",
                })}
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            {/* Isolated Backend Response Error Container */}
            {serverError && (
              <p className="text-sm font-medium text-red-500 text-center bg-red-50/50 p-2 rounded border border-red-100">
                {serverError}
              </p>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Link href="/profile">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>

              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating password..." : "Update Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
