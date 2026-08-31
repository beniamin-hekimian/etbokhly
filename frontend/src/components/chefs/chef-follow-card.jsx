import Image from "next/image";
import Link from "next/link";
import { Check, Loader2, MapPin, UserMinus } from "lucide-react";
import { useRouter } from "next/router";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useFollow } from "@/hooks/useFollows";

export default function ChefFollowCard({ chef }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { following, toggle, pending } = useFollow({
    chefId: chef?.id,
    initialFollowing: chef?.isFollowing,
    initialCount: chef?.followersCount,
    onRequireLogin: () => router.push("/auth/login"),
  });

  const avatarSrc = chef?.profile_image?.trim() ? chef.profile_image : "/avatar.webp";

  const inner = (
    <Card className="overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex w-full items-center gap-4">
        {/* Column 1 — Avatar */}
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#FFD59E] to-primary p-1">
          <Image
            src={avatarSrc}
            alt={chef?.full_name || "chef"}
            width={56}
            height={56}
            className="h-full w-full rounded-full border-2 border-card object-cover"
          />
        </div>

        {/* Column 2 — Details */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-foreground sm:text-lg">{chef?.full_name}</h3>

          {chef?.bio && (
            <p className="hidden md:block mt-0.5 line-clamp-1 text-sm text-muted-foreground">{chef.bio}</p>
          )}
        </div>

        {/* Column 3 — Follow button (right corner) */}
        <div className="shrink-0">
          {following ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle();
              }}
              className="gap-1.5 font-bold shadow-xs group whitespace-nowrap hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 group-hover:hidden" />
                  <UserMinus className="hidden h-4 w-4 group-hover:block" />
                  <span className="group-hover:hidden">{t.follows.following}</span>
                  <span className="hidden group-hover:inline">{t.follows.unfollow}</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle();
              }}
              className="gap-1.5 whitespace-nowrap font-bold shadow-sm"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t.follows.follow}</>}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <Link href={`/chef/${chef?.id}`} className="block">
      {inner}
    </Link>
  );
}