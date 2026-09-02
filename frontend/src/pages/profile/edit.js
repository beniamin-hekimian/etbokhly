import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
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

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  const [isUpdating, setIsUpdating] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [serverError, setServerError] = useState("");

  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      full_name: "",
      email: "",
      bio: "",
      phone: "",
      location: "",
    },
  });

  // Fetch latest profile data
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    async function fetchLatestProfile() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("/api/user/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (response.ok && result.status === "success") {
          reset({
            full_name: result.data.full_name || "",
            email: result.data.email || "",
            bio: result.data.bio || "",
            phone: result.data.phone || "",
            location: result.data.location || "",
          });

          setAvatarPreview(result.data.profile_image || "");
          setHasFetched(true);
        } else {
          setServerError(result.message || t?.profile?.edit?.loadProfileError);
        }
      } catch (err) {
        console.error("Error updating edit form inputs:", err);
        setServerError(t?.profile?.edit?.loadProfileError);
      }
    }

    fetchLatestProfile();
  }, [authLoading, isAuthenticated, reset, t]);

  // Handle avatar file selection & upload
  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.type)) {
      toast.error(t?.profile?.edit?.invalidImageType);
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error(t?.profile?.edit?.imageTooLarge);
      event.target.value = "";
      return;
    }

    setIsUploadingAvatar(true);
    setServerError("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || t?.profile?.edit?.uploadAvatarError);
      }

      setAvatarPreview(result.url);
      toast.success(t?.profile?.edit?.avatarSuccess);
    } catch (err) {
      setServerError(err.message);
      toast.error(err.message);
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const onSubmit = async (formData) => {
    setIsUpdating(true);
    setServerError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`/api/user/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          bio: formData.bio,
          phone: formData.phone || null,
          location: formData.location || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || t?.profile?.edit?.updateError);
      }

      if (result.status === "User was updated") {
        toast.success(t?.profile?.edit?.updateSuccess);
        router.push("/profile");
      }
    } catch (err) {
      let friendlyMessage = err.message;

      if (err.message.includes("Unique constraint failed") && err.message.includes("email")) {
        friendlyMessage = t?.profile?.edit?.emailTaken;
      }

      setServerError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const isLoading = authLoading || (isAuthenticated && !hasFetched && !serverError);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-muted/30 px-4 py-10">
        <Head>
          <title>{t?.profile?.edit?.title} | Etbokhly</title>
        </Head>

        <div className="mx-auto flex w-full max-w-2xl items-center justify-center">
          <Card className="w-full border-border bg-card shadow-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-extrabold text-foreground sm:text-3xl">
                {t?.profile?.edit?.title}
              </CardTitle>
              <CardDescription className="text-muted-foreground">{t?.profile?.edit?.signInToEdit}</CardDescription>
            </CardHeader>

            <CardFooter className="justify-center pt-2">
              <Link href="/auth/login">
                <Button className="font-bold shadow-xs">Login</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <Head>
        <title>{t?.profile?.edit?.title} | Etbokhly</title>
      </Head>

      <div className="mx-auto flex w-full max-w-2xl items-center justify-center">
        <Card className="w-full border-border bg-card shadow-sm">
          <CardHeader className="space-y-1.5 text-center">
            <CardTitle className="text-2xl font-extrabold text-foreground sm:text-3xl">
              {t?.profile?.edit?.title}
            </CardTitle>

            <CardDescription className="text-sm text-muted-foreground">{t?.profile?.edit?.subtitle}</CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Row 1: Full Name and Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="font-semibold text-foreground">
                    {t?.profile?.edit?.fullName}
                  </Label>

                  <Input
                    {...register("full_name", {
                      required: t?.profile?.edit?.fullNameRequired,
                      minLength: {
                        value: 2,
                        message: t?.profile?.edit?.minTwoChars,
                      },
                    })}
                    id="full_name"
                    type="text"
                    placeholder={t?.profile?.edit?.fullNamePlaceholder}
                  />

                  {errors.full_name && (
                    <p className="text-xs font-medium text-destructive">{errors.full_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold text-foreground">
                    {t?.profile?.edit?.emailAddress}
                  </Label>

                  <Input
                    {...register("email", {
                      required: t?.profile?.edit?.emailRequired,
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: t?.profile?.edit?.invalidEmail,
                      },
                    })}
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                  />

                  {errors.email && <p className="text-xs font-medium text-destructive">{errors.email.message}</p>}
                </div>
              </div>

              {/* Row 2: Phone Number and Location */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-semibold text-foreground">
                    {t?.profile?.edit?.phoneNumber}
                  </Label>

                  <Input
                    {...register("phone", {
                      pattern: {
                        value: /^\d{10}$/,
                        message: t?.profile?.edit?.phoneInvalid,
                      },
                    })}
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    onChange={(e) => setValue("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder={t?.profile?.edit?.notProvided}
                  />

                  {errors.phone && <p className="text-xs font-medium text-destructive">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="font-semibold text-foreground">
                    {t?.profile?.edit?.location}
                  </Label>

                  <Input
                    {...register("location")}
                    id="location"
                    type="text"
                    placeholder={t?.profile?.edit?.locationPlaceholder}
                  />
                </div>
              </div>

              {/* Row 3: Biography */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="font-semibold text-foreground">
                  {t?.profile?.edit?.biography}
                </Label>

                <Input {...register("bio")} id="bio" type="text" placeholder={t?.profile?.edit?.bioPlaceholder} />
              </div>

              {/* Profile Image Section */}
              <div className="space-y-2 pt-2">
                <Label htmlFor="profile_image" className="font-semibold text-foreground">
                  {t?.profile?.edit?.profileImage}
                </Label>

                <Input
                  id="profile_image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                  className="cursor-pointer text-sm"
                />

                <p className="text-xs text-muted-foreground">Allowed: JPG, PNG, WEBP, GIF. Max size: 5MB.</p>

                {avatarPreview ? (
                  <div className="mt-3 flex items-center gap-3.5 rounded-lg border border-border bg-muted/40 p-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-card">
                      <Image
                        src={avatarPreview}
                        alt={t?.profile?.edit?.avatarPreviewAlt || "Profile image preview"}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-semibold text-foreground">{t?.profile?.edit?.yourProfileImage}</p>

                      {isUploadingAvatar ? (
                        <p className="text-xs font-medium text-primary flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          {t?.profile?.edit?.updatingImage}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">{t?.profile?.edit?.imageUploadedNotice}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">{t?.profile?.edit?.noImageSelected}</p>
                )}
              </div>

              {/* Server Error Banner */}
              {serverError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-center text-xs font-medium text-destructive">
                  {serverError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
                <Link href="/profile">
                  <Button type="button" variant="outline" className="font-bold shadow-xs">
                    {t?.profile?.edit?.cancel}
                  </Button>
                </Link>

                <Button type="submit" disabled={isUpdating || isUploadingAvatar} className="gap-2 font-bold shadow-xs">
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t?.profile?.edit?.savingChanges}
                    </>
                  ) : (
                    t?.profile?.edit?.saveChanges
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
