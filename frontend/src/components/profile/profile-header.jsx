import Link from "next/link";
import { Circle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

export default function ProfileHeader({ role, chefRequestStatus }) {
  const { t } = useTranslation();

  const isChefRequestPending = chefRequestStatus === "PENDING";
  const isChefRequestRejected = chefRequestStatus === "REJECTED";

  return (
    <div className="space-y-2 text-center sm:text-start">
      <h1 className="font-sans text-3xl font-extrabold text-foreground sm:text-4xl">{t.profile.headerTitle}</h1>

      <p className="text-sm text-muted-foreground sm:text-base">{t.profile.headerDescription}</p>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/profile/edit">
            <Button className="font-bold shadow-sm">{t.profile.editProfile}</Button>
          </Link>

          <Link href="/profile/change-password">
            <Button variant="outline" className="font-bold">
              {t.profile.changePasswordBtn}
            </Button>
          </Link>

          <Link href="/profile/likes">
            <Button variant="outline" className="gap-2 font-bold">
              <Heart className="h-4 w-4" />
              {t.profile.myLikes}
            </Button>
          </Link>
        </div>

        {role === "CUSTOMER" && (
          <Link href="/profile/become-a-chef">
            <Button variant="outline" disabled={isChefRequestPending} className="gap-2 font-bold">
              {isChefRequestPending ? (
                <>
                  <Circle className="h-2.5 w-2.5 animate-pulse fill-amber-500 stroke-none" />
                  {t.profile.chefRequestPending}
                </>
              ) : isChefRequestRejected ? (
                <>
                  <Circle className="h-2.5 w-2.5 animate-pulse fill-red-500 stroke-none" />
                  {t.profile.chefRequestRejected}
                </>
              ) : (
                t.profile.becomeChefBtn
              )}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
