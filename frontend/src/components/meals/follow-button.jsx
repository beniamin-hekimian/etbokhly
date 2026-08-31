import { useRouter } from "next/router";
import { Check, Loader2, UserPlus, UserMinus } from "lucide-react";
import { useFollow } from "@/hooks/useFollows";
import { useTranslation } from "@/hooks/useTranslation";

export default function FollowButton({ chefId, initialFollowing = false, initialCount = 0, size = "sm", className = "" }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { following, toggle, pending } = useFollow({
    chefId,
    initialFollowing,
    initialCount,
    onRequireLogin: () => router.push("/auth/login"),
  });

  const baseClasses =
    "gap-1.5 font-bold shadow-sm transition-all disabled:opacity-60 " +
    (size === "md" ? "px-5 py-2 text-sm rounded-full" : "px-3.5 py-1.5 text-sm rounded-full");

  if (following) {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-label={t.follows.unfollow}
        aria-pressed
        className={`${baseClasses} inline-flex items-center border border-border bg-background text-foreground hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive group ${className}`}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Check className="h-4 w-4 shrink-0 group-hover:hidden" />
            <UserMinus className="hidden h-4 w-4 shrink-0 group-hover:block" />
            <span className="group-hover:hidden">{t.follows.following}</span>
            <span className="hidden group-hover:inline">{t.follows.unfollow}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={t.follows.follow}
      aria-pressed={false}
      className={`${baseClasses} inline-flex items-center bg-primary text-primary-foreground hover:bg-primary/90 ${className}`}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <UserPlus className="h-4 w-4 shrink-0" />
          {t.follows.follow}
        </>
      )}
    </button>
  );
}