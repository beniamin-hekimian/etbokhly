import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
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

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

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

  // Fetch the latest profile data from the server on mount
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

          // Load the current profile image
          setAvatarPreview(result.data.profile_image || "");

          setHasFetched(true);
        } else {
          setServerError(result.message || "Could not retrieve fresh profile records.");
        }
      } catch (err) {
        console.error("Error updating edit form inputs:", err);
        setServerError("Failed to balance connection with your user record.");
      }
    }

    fetchLatestProfile();
  }, [authLoading, isAuthenticated, reset]);

  // Upload avatar immediately after selecting an image
  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Validate file type
    if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.type)) {
      toast.error("Please select a JPG, PNG, WEBP, or GIF image.");
      event.target.value = "";
      return;
    }

    // Validate file size
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error("Image size must be 5MB or less.");
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
        throw new Error(result.message || "Failed to upload profile image.");
      }

      // Display the newly uploaded Cloudinary image
      setAvatarPreview(result.url);

      toast.success("Profile image uploaded successfully.");
    } catch (err) {
      setServerError(err.message);
      toast.error(err.message);
    } finally {
      setIsUploadingAvatar(false);

      // Allow selecting the same image again if needed
      event.target.value = "";
    }
  };

  const onSubmit = async (formData) => {
    setIsUpdating(true);
    setServerError("");

    try {
      const token = localStorage.getItem("token");

      // Updates your profile based on the current user's ID
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
        throw new Error(result.message || "Failed to update your profile data.");
      }

      if (result.status === "User was updated") {
        toast.success("Profile updated successfully!");
        router.push("/profile");
      }
    } catch (err) {
      let friendlyMessage = err.message;

      // Check if the server response is an unhandled raw Prisma unique constraint error
      if (err.message.includes("Unique constraint failed") && err.message.includes("email")) {
        friendlyMessage = "This email address is already taken. Please choose another one.";
      }

      setServerError(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  // CLEAN DERIVED LOADING STATE
  const isLoading = authLoading || (isAuthenticated && !hasFetched && !serverError);

  // Render initialization loader
  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-muted/30 px-4 py-10">
        <Head>
          <title>Edit Profile | Etbokhly</title>
        </Head>

        <div className="mx-auto flex w-full max-w-3xl items-center justify-center">
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="font-display text-5xl text-secondary sm:text-6xl">Edit Profile</CardTitle>

              <CardDescription>Sign in first to edit your profile.</CardDescription>
            </CardHeader>

            <CardFooter className="justify-center">
              <Link href="/auth/login">
                <Button>Go to Login</Button>
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
        <title>Edit Profile | Etbokhly</title>
      </Head>

      <div className="mx-auto flex w-full max-w-3xl items-center justify-center">
        <Card className="w-full max-w-3xl">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-5xl text-secondary sm:text-6xl">Edit Profile</CardTitle>

            <CardDescription>Update your account details and save when you are ready.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Row 1: Full Name and Email */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>

                  <Input
                    {...register("full_name", {
                      required: "Name parameter is required",
                      minLength: {
                        value: 2,
                        message: "Minimum 2 characters",
                      },
                    })}
                    id="full_name"
                    type="text"
                    placeholder="Your full name"
                  />

                  {errors.full_name && <p className="text-sm text-red-500">{errors.full_name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>

                  <Input
                    {...register("email", {
                      required: "Email parameter is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email address formatting",
                      },
                    })}
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                  />

                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
              </div>

              {/* Row 2: Phone Number and Location */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>

                  <Input {...register("phone")} id="phone" type="tel" placeholder="Not provided" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>

                  <Input {...register("location")} id="location" type="text" placeholder="Your location" />
                </div>
              </div>

              {/* Row 3: Biography Text Input */}
              <div className="space-y-2">
                <Label htmlFor="bio">Biography / Description</Label>

                <Input {...register("bio")} id="bio" type="text" placeholder="Tell us about yourself..." />
              </div>

              {/* Profile Image */}
              <div className="space-y-2">
                <Label htmlFor="profile_image">Profile Image</Label>

                <Input
                  id="profile_image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                />

                {isUploadingAvatar && <p className="text-sm text-muted-foreground">Uploading profile image...</p>}

                <p className="text-xs text-muted-foreground">Allowed: JPG, PNG, WEBP, GIF. Max size: 5MB.</p>

                {avatarPreview ? (
                  <div className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-full border border-border bg-card">
                      <Image
                        src={avatarPreview}
                        alt="Profile image preview"
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-muted-foreground">Your profile image</p>

                      {isUploadingAvatar && <p className="text-xs text-muted-foreground">Updating image...</p>}
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">No profile image currently selected.</p>
                )}
              </div>

              {/* Server Error Warning Banner */}
              {serverError && (
                <p className="rounded border border-red-100 bg-red-50/50 p-2 text-center text-sm font-medium text-red-500">
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

                <Button type="submit" disabled={isUpdating || isUploadingAvatar}>
                  {isUpdating ? "Saving changes..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
