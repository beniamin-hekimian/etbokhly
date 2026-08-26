import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft, ArrowRight } from "lucide-react";

import useChefProfile from "@/hooks/useChefProfile";
import { useTranslation } from "@/hooks/useTranslation";

import Loading from "@/components/loading";
import Error from "@/components/error";
import ProfileInfoCard from "@/components/profile/profile-info-card";
import ChefPublicMeals from "@/components/chefs/chef-public-meals";

export default function ChefProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { t, isRTL } = useTranslation();
  const { chef, meals, isLoading, error } = useChefProfile(id);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  if (isLoading || !id) {
    return <Loading />;
  }

  if (error || !chef) {
    return (
      <Error
        title={t.chefProfile.metaTitle}
        message={t.chefProfile.notFound}
        onRetry={() => router.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <Head>
        <title>{`${chef.full_name} | ${t.chefProfile.metaTitle}`}</title>
      </Head>

      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Back Link */}
        <Link
          href="/meals"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <BackIcon className="h-4 w-4" />
          {t.meals.details.backToDiscover}
        </Link>

        {/* Page Header */}
        <div className="space-y-2 border-b border-border pb-6">
          <h1 className="font-display text-4xl font-bold text-foreground sm:text-5xl">{t.chefProfile.title}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{t.chefProfile.description}</p>
        </div>

        {/* Chef Info Card */}
        <ProfileInfoCard profile={chef} />

        {/* Chef Meals */}
        <div className="space-y-6 pt-4">
          <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl md:text-4xl">
            {t.chefProfile.mealsTitle}
          </h2>

          <ChefPublicMeals meals={meals} />
        </div>
      </div>
    </div>
  );
}
