import Link from "next/link";
import Head from "next/head";
import { useForm } from "react-hook-form";
import useAuth from "@/hooks/useAuth";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const { handleSignup, isRegistering, registerError } = useAuth();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Head>
        <title>Create Account | Etbokhly</title>
      </Head>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-4xl text-secondary">Create Account</CardTitle>

          <CardDescription>Sign up to order meals on Etbokhly</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(handleSignup)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Name</Label>

              <Input
                {...register("full_name", {
                  required: "Name is required",
                })}
                id="full_name"
                type="text"
                placeholder="Your full name"
              />

              {errors.full_name && <p className="text-sm text-red-500">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <Input
                {...register("email", {
                  required: "Email is required",
                })}
                id="email"
                type="email"
                placeholder="name@example.com"
              />

              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <Input
                {...register("password", {
                  required: "Password is required",
                })}
                id="password"
                type="password"
                placeholder="••••••••"
              />

              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>

              <Input
                {...register("confirmPassword", {
                  required: "Please confirm password",
                  validate: (value) => value === getValues("password") || "Passwords do not match",
                })}
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
              />

              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            {registerError && <p className="text-center text-sm text-red-500">{registerError}</p>}

            <Button type="submit" disabled={isRegistering} className="w-full">
              {isRegistering ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          Already have an account?&nbsp;
          <Link href="/auth/login" className="font-medium text-accent hover:underline">
            Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
