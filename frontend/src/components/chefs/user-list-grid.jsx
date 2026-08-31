import Image from "next/image";
import Link from "next/link";
import { Check, Loader2, MapPin, UserMinus } from "lucide-react";
import { useRouter } from "next/router";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/context/AuthContext";
import { useFollow } from "@/hooks/useFollows";

const ROLE_BADGE_STYLES = {
  CHEF: "bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold",
  CUSTOMER: "bg-blue-500/20 border-blue-500/40 text-blue-700 dark:text-blue-300 font-bold",
};

function RowFollowButton({ user, className = "" }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { following, toggle, pending } = useFollow({
    chefId: user?.id,
    initialFollowing: user?.isFollowing,
    initialCount: user?.followersCount,
    onRequireLogin: () => router.push("/auth/login"),
  });

  if (user?.isViewer) return null;
  if (user?.role !== "CHEF") return null;

  if (following) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={toggle}
        className="w-full gap-1.5 font-bold shadow-xs group hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
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
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      disabled={pending}
      onClick={toggle}
      className="w-full gap-1.5 font-bold shadow-sm"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t.follows.follow}</>}
    </Button>
  );
}

export default function UserListGrid({ users = [] }) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  if (users.length === 0) {
    return (
      <Card className="border-border/60 bg-card shadow-sm">
        <CardContent className="flex min-h-40 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
          {t.follows.emptyFollowingListTitle}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => {
        const roleBadgeClass = ROLE_BADGE_STYLES[user?.role?.toUpperCase()] || ROLE_BADGE_STYLES.CUSTOMER;
        const isChef = user?.role === "CHEF";
        const avatarSrc = user?.profile_image?.trim() ? user.profile_image : "/avatar.webp";
        const inner = (
          <Card className="flex h-full flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="relative mb-3 h-18 w-18 overflow-hidden rounded-full border border-border bg-muted">
              <Image src={avatarSrc} alt={user.full_name || "user"} fill sizes="4.5rem" className="object-cover" />
            </div>

            <span className={`mb-1 inline-flex rounded-full border px-2.5 py-0.5 text-[0.7rem] uppercase tracking-wide ${roleBadgeClass}`}>
              {user.role}
            </span>

            <h3 className="text-sm font-bold text-foreground">{user.full_name}</h3>

            {user.location && (
              <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="line-clamp-1 text-right">{user.location}</span>
              </span>
            )}

            <div className="mt-3 w-full">
              {isChef ? (
                <RowFollowButton user={user} />
              ) : (
                <span className="inline-flex w-full items-center justify-center rounded-full border border-border bg-muted/40 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
                  {t.follows.followers}
                </span>
              )}
            </div>
          </Card>
        );

        if (isChef) {
          return (
            <Link key={user.id} href={`/chef/${user.id}`} className="block">
              {inner}
            </Link>
          );
        }

        return <div key={user.id}>{inner}</div>;
      })}
    </div>
  );
}