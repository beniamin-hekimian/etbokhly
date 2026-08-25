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

export default function LoginPage() {
  const { handleLogin, isLoggingIn, loginError } = useAuth();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Head>
        <title>{t.auth.login.metaTitle}</title>
      </Head>

      <Card className="w-full max-w-md shadow-md border-border">
        <CardHeader className="text-center">
          <CardTitle className="font-sans text-3xl font-extrabold text-foreground">{t.auth.login.title}</CardTitle>

          <CardDescription className="text-muted-foreground">{t.auth.login.description}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.login.emailLabel}</Label>

              <Input
                {...register("email", {
                  required: t.auth.validation.emailRequired,
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t.auth.validation.emailInvalid,
                  },
                })}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
              />

              {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t.auth.login.passwordLabel}</Label>

              <Input
                {...register("password", {
                  required: t.auth.validation.passwordRequired,
                  minLength: {
                    value: 8,
                    message: t.auth.validation.passwordMinLength,
                  },
                })}
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
              />

              {errors.password && <p className="text-sm font-medium text-destructive">{errors.password.message}</p>}
            </div>

            {loginError && <p className="text-center text-sm font-medium text-destructive">{loginError}</p>}

            <Button type="submit" className="w-full font-bold shadow-sm" disabled={isLoggingIn}>
              {isLoggingIn ? t.auth.login.loggingInButton : t.auth.login.submitButton}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground gap-1">
          <span>{t.auth.login.noAccountText}</span>
          <Link
            href="/auth/signup"
            className="font-semibold text-blue-500 hover:text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {t.auth.login.signUpLink}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
