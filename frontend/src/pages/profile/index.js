import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import useProfile from "@/hooks/useProfile";
import { useTranslation } from "@/hooks/useTranslation";

import Loading from "@/components/loading";
import Error from "@/components/error";
import ChefMealsGrid from "@/components/profile/chef-meals-grid";
import ProfileRoleBanner from "@/components/profile/profile-role-banner";
import ProfileHeader from "@/components/profile/profile-header";
import ProfileInfoCard from "@/components/profile/profile-info-card";

// Main profile index page
export default function ProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, profile, profileError, chefRequestStatus, retryProfile } = useProfile();

  // Redirect to login if user is not authenticated after loading
  useEffect(
    function () {
      if (!isLoading && !isAuthenticated) {
        toast.error("Please sign in to view your profile.", { id: "auth-required" });
        router.replace("/auth/login");
      }
    },
    [isLoading, isAuthenticated, router],
  );

  // Show loading page
  if (isLoading || !isAuthenticated) {
    return <Loading />;
  }

  // Handle fetch errors
  if (profileError || !profile) {
    return (
      <Error
        title={t.profile.headerTitle}
        message="We could not load your profile details right now."
        onRetry={retryProfile}
      />
    );
  }

  // Render Profile Page
  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <Head>
        <title>{t.profile.metaTitle}</title>
      </Head>

      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Show user role banner */}
        <ProfileRoleBanner role={profile.role} />

        {/* Page header title & buttons */}
        <ProfileHeader role={profile.role} chefRequestStatus={chefRequestStatus} />

        {/* Profile Info Card */}
        <ProfileInfoCard profile={profile} />

        {/* Render Chef Meals if Role is CHEF */}
        {profile.role === "CHEF" && <ChefMealsGrid chefId={profile.id} />}
      </div>
    </div>
  );
}
