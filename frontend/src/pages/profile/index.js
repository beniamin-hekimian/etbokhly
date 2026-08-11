import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { Circle } from "lucide-react";
import Loading from "@/components/loading";
import ChefMealsGrid from "@/components/chef-meals-grid";

import useProfile from "@/hooks/useProfile";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const profileFields = [
  { label: "Name", key: "full_name" },
  // { label: "Email", key: "email" },
  // { label: "Role", key: "role" },
  // { label: "User ID", key: "id" },
  { label: "Phone", key: "phone" },
  { label: "Location", key: "location" },
  { label: "Bio", key: "bio" },
];

export default function ProfilePage() {
  const { isAuthenticated, isLoading, profile, profileError, chefRequestStatus, retryProfile } = useProfile();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30 px-4 py-10">
        <Head>
          <title>Profile | Etbokhly</title>
        </Head>

        <div className="mx-auto flex w-full max-w-4xl items-center justify-center">
          <Card className="w-full max-w-xl">
            <CardHeader className="text-center">
              <CardTitle className="font-display text-5xl text-secondary">Profile</CardTitle>

              <CardDescription>Sign in to view your account information.</CardDescription>
            </CardHeader>

            <CardContent className="flex justify-center pb-2">
              <Link href="/auth/login">
                <Button>Go to Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-muted/30 px-4 py-10">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-center">
          <Card className="w-full max-w-xl">
            <CardHeader className="text-center">
              <CardTitle className="font-display text-5xl text-secondary">Profile</CardTitle>

              <CardDescription>We could not load your profile details right now.</CardDescription>
            </CardHeader>

            <CardContent className="flex justify-center pb-2">
              <Button variant="secondary" onClick={retryProfile}>
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const avatarSrc = profile.profile_image?.trim() ? profile.profile_image : "/avatar.webp";

  const profileValueMap = {
    full_name: profile.full_name,
    email: profile.email,
    role: profile.role,
    id: profile.id,
    phone: profile.phone ?? "Not provided",
    location: profile.location ?? "Not provided",
    bio: profile.bio ?? "No bio added yet.",
  };

  const isChefRequestPending = chefRequestStatus === "PENDING";

  const isChefRequestRejected = chefRequestStatus === "REJECTED";

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <Head>
        <title>My Profile | Etbokhly</title>
      </Head>

      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="font-display text-5xl text-secondary sm:text-6xl">Profile</h1>

          <p className="text-sm text-muted-foreground sm:text-base">
            A simple account view for your name, email, role, and avatar.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/profile/edit">
                <Button>Edit Profile</Button>
              </Link>

              <Link href="/profile/change-password">
                <Button variant="outline">Change Password</Button>
              </Link>
            </div>

            {profile.role === "CUSTOMER" && (
              <Link href="/profile/become-a-chef">
                <Button variant="outline" disabled={isChefRequestPending} className="gap-2">
                  {isChefRequestPending ? (
                    <>
                      <Circle className="h-2.5 w-2.5 animate-pulse fill-amber-500 stroke-none" />
                      Your chef request is pending
                    </>
                  ) : isChefRequestRejected ? (
                    <>
                      <Circle className="h-2.5 w-2.5 animate-pulse fill-red-500 stroke-none" />
                      Your request was rejected
                    </>
                  ) : (
                    "Become a Chef"
                  )}
                </Button>
              </Link>
            )}
          </div>
        </div>

        <Card className="overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="grid gap-0 md:grid-cols-[auto_1fr]">
              <div className="border-b bg-card p-8 md:border-b-0 md:border-r">
                <div className="flex flex-col items-center gap-4 text-center md:text-left">
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border bg-muted shadow-sm sm:h-36 sm:w-36">
                    <Image
                      src={avatarSrc}
                      alt={`${profileValueMap.full_name} avatar`}
                      fill
                      priority
                      sizes="(max-width: 768px) 8rem, 9rem"
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <CardTitle className="font-heading text-2xl sm:text-3xl">{profileValueMap.full_name}</CardTitle>

                    <CardDescription className="text-sm sm:text-base">{profileValueMap.email}</CardDescription>

                    <Button variant="secondary" size="sm" disabled className="cursor-default">
                      {profileValueMap.role}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid gap-4 sm:grid-cols-2 h-full">
                  {profileFields.map((field) => (
                    <Card key={field.key} className="bg-background">
                      <CardHeader>
                        <CardDescription>{field.label}</CardDescription>
                      </CardHeader>

                      <CardContent className="text-lg sm:text-2xl">{profileValueMap[field.key]}</CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Render Chef Meals Grid if Role is CHEF */}
        {profile.role === "CHEF" && <ChefMealsGrid chefId={profile.id} />}
      </div>
    </div>
  );
}
