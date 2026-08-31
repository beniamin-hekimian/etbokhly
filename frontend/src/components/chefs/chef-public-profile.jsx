import Image from "next/image";
import { ChefHat, Mail, MapPin, Phone } from "lucide-react";

import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/context/AuthContext";
import FollowButton from "@/components/meals/follow-button";

const DEFAULT_GRADIENT = "from-[#FFD59E] to-primary";

export default function ChefPublicProfile({ chef, mealsCount = 0 }) {
  const { t } = useTranslation();
  const { user: viewer, isAuthenticated } = useAuth();

  const isOwnProfile = isAuthenticated && viewer?.id === chef?.id;
  const avatarSrc = chef?.profile_image?.trim() ? chef.profile_image : "/avatar.webp";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Hero */}
      <div className="p-6">
        {/* Identity + details */}
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-start">
          {/* Avatar */}
          <div className={`relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${DEFAULT_GRADIENT} p-1`}>
            <Image
              src={avatarSrc}
              alt={chef?.full_name || "chef"}
              width={120}
              height={120}
              className="h-full w-full rounded-full border-2 border-card object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col items-center space-y-2.5 sm:items-start">
            <h2 className="font-sans text-2xl font-extrabold text-foreground sm:text-3xl">{chef?.full_name}</h2>

            {chef?.bio && (
              <p className="flex max-w-2xl items-center gap-1.5 text-sm leading-relaxed text-muted-foreground">
                <ChefHat className="h-4 w-4 shrink-0" />
                {chef.bio}
              </p>
            )}

            {chef?.location && (
              <p className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
                <MapPin className="h-4 w-4 shrink-0" />
                {chef.location}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground sm:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-4 w-4 shrink-0" />
                {chef?.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4 shrink-0" />
                {chef?.phone || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats + follow row */}
        <div className="mt-5 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-5 sm:flex-row">
          <div className="flex items-center justify-center gap-10 sm:justify-start">
            <div className="text-center sm:text-start">
              <p className="text-2xl font-extrabold text-foreground">{mealsCount}</p>
              <p className="text-sm text-muted-foreground">{t.follows.mealsLabel}</p>
            </div>
            <div className="text-center sm:text-start">
              <p className="text-2xl font-extrabold text-foreground">{chef?.followingCount ?? 0}</p>
              <p className="text-sm text-muted-foreground">{t.follows.followingLabel}</p>
            </div>
            <div className="text-center sm:text-start">
              <p className="text-2xl font-extrabold text-foreground">{chef?.followersCount ?? 0}</p>
              <p className="text-sm text-muted-foreground">{t.follows.followers}</p>
            </div>
          </div>

          {!isOwnProfile && (
            <FollowButton
              chefId={chef?.id}
              initialFollowing={chef?.isFollowing}
              initialCount={chef?.followersCount}
              size="md"
              className="shrink-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}