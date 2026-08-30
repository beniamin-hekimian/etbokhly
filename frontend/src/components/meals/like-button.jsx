import { useRouter } from "next/router";
import { Heart, Loader2 } from "lucide-react";
import { useLike } from "@/hooks/useLikes";
import { useTranslation } from "@/hooks/useTranslation";

export default function LikeButton({ meal, className = "" }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { liked, likesCount, toggle, pending } = useLike({
    mealId: meal?.id,
    initialLiked: meal?.likedByMe,
    initialCount: meal?.likesCount,
    onRequireLogin: () => router.push("/auth/login"),
  });

  const label = liked ? t.likes.unlike : t.likes.like;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={label}
      aria-pressed={liked}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold shadow-sm backdrop-blur transition-all disabled:opacity-60 ${className}`}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={`h-4 w-4 shrink-0 transition-all ${liked ? "fill-destructive text-destructive" : ""}`}
        />
      )}
      <span>{likesCount}</span>
    </button>
  );
}