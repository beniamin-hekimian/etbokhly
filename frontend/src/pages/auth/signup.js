import Link from "next/link";
import Head from "next/head";
import { useForm } from "react-hook-form";
import useAuth from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const { handleSignup, isRegistering, registerError } = useAuth();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Head>
        <title>{t.auth.signup.metaTitle}</title>
      </Head>

      <Card className="w-full max-w-md shadow-md border-border">
        <CardHeader className="text-center">
          <CardTitle className="font-sans text-3xl font-extrabold text-foreground">{t.auth.signup.title}</CardTitle>

          <CardDescription className="text-muted-foreground">{t.auth.signup.description}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(handleSignup)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">{t.auth.signup.nameLabel}</Label>

              <Input
                {...register("full_name", {
                  required: t.auth.validation.nameRequired,
                })}
                id="full_name"
                type="text"
                placeholder="Your full name"
              />

              {errors.full_name && <p className="text-sm font-medium text-destructive">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.signup.emailLabel}</Label>

              <Input
                {...register("email", {
                  required: t.auth.validation.emailRequired,
                })}
                id="email"
                type="email"
                placeholder="name@example.com"
              />

              {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.auth.signup.passwordLabel}</Label>

              <Input
                {...register("password", {
                  required: t.auth.validation.passwordRequired,
                })}
                id="password"
                type="password"
                placeholder="••••••••"
              />

              {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t.auth.signup.confirmPasswordLabel}</Label>

              <Input
                {...register("confirmPassword", {
                  required: t.auth.validation.confirmPasswordRequired,
                  validate: (value) => value === getValues("password") || t.auth.validation.passwordsDoNotMatch,
                })}
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
              />

              {errors.confirmPassword && (
                <p className="text-sm font-medium text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {registerError && <p className="text-center text-sm font-medium text-destructive">{registerError}</p>}

            <Button type="submit" disabled={isRegistering} className="w-full font-bold shadow-sm">
              {isRegistering ? t.auth.signup.signingUpButton : t.auth.signup.submitButton}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground gap-1">
          <span>{t.auth.signup.hasAccountText}</span>
          <Link
            href="/auth/login"
            className="font-semibold text-blue-500 hover:text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {t.auth.signup.loginLink}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
