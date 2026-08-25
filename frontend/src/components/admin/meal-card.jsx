import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";

export default function MealCard({ meal, actionLoading, onApprove, onOpenReject }) {
  const { t } = useTranslation();
  const mealPhotoSrc = meal.photo?.trim() ? meal.photo : "/placeholder-meal.webp";
  const chefAvatarSrc = meal.user?.profile_image?.trim() ? meal.user.profile_image : "/avatar.webp";
  const status = meal.mealRequestStatus;
  const isPending = status !== "APPROVED" && status !== "REJECTED";

  const getStatusLabel = (statusKey) => {
    switch (statusKey) {
      case "APPROVED":
        return t.admin.meals.card.status.approved;
      case "REJECTED":
        return t.admin.meals.card.status.rejected;
      default:
        return t.admin.meals.card.status.pending;
    }
  };

  return (
    <Card className="flex flex-col sm:flex-row gap-0 overflow-hidden border border-border/60 bg-card shadow-sm py-0">
      {/* Left side meal photo */}
      <div className="relative h-48 sm:h-auto sm:w-48 shrink-0 bg-muted/40 border-b sm:border-b-0 sm:border-r border-border/60">
        <Image
          src={mealPhotoSrc}
          alt={meal.title}
          fill
          sizes="(max-width: 640px) 100vw, 192px"
          className="object-cover"
        />
        <div className="absolute top-2.5 rtl:right-2.5 ltr:left-2.5 sm:hidden">
          <Badge variant={status === "APPROVED" ? "default" : status === "REJECTED" ? "destructive" : "secondary"}>
            {getStatusLabel(status)}
          </Badge>
        </div>
      </div>

      {/* Right side content & actions */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="truncate text-lg sm:text-xl font-bold text-foreground">{meal.title}</CardTitle>
            <Badge
              className="hidden sm:inline-flex shrink-0"
              variant={status === "APPROVED" ? "default" : status === "REJECTED" ? "destructive" : "secondary"}
            >
              {getStatusLabel(status)}
            </Badge>
          </div>

          {/* Tags & Price */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-base text-primary">${meal.price}</span>
            {meal.tags?.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 ltr:border-l rtl:border-r ltr:pl-2 rtl:pr-2 border-border/60">
                {meal.tags.map((item) => (
                  <Badge key={item.tag_id} variant="outline" className="text-[11px] px-2 py-0 h-5">
                    {item.tag?.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2">
            <span className="font-bold text-foreground">{t.admin.meals.card.descriptionLabel}: </span>
            {meal.content || t.admin.meals.card.noDescription}
          </p>

          {/* Chef profile information box */}
          <div className="rounded-md border border-border/50 bg-muted/30 p-2 text-xs">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">
              {t.admin.meals.card.chefDetailsHeader}
            </p>
            <div className="flex items-center gap-2">
              <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-border bg-background">
                <Image
                  src={chefAvatarSrc}
                  alt={`${meal.user?.full_name} avatar`}
                  fill
                  sizes="28px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 truncate">
                <span className="font-medium text-foreground">
                  {meal.user?.full_name || t.admin.meals.card.unknownChef}
                </span>
                {meal.user?.email && (
                  <span className="text-muted-foreground ltr:ml-1.5 rtl:mr-1.5 hidden sm:inline">
                    • {meal.user.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {status === "REJECTED" && meal.mealRequestRejectReason && (
            <div className="rounded-md border border-destructive/20 bg-destructive/5 p-2 text-xs text-destructive">
              <span className="font-semibold">{t.admin.meals.card.rejectionReasonLabel}: </span>
              {meal.mealRequestRejectReason}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={actionLoading || !isPending}
            onClick={() => onOpenReject(meal)}
          >
            {t.admin.meals.card.rejectButton}
          </Button>
          <Button type="button" size="sm" disabled={actionLoading || !isPending} onClick={() => onApprove(meal.id)}>
            {t.admin.meals.card.approveButton}
          </Button>
        </div>
      </div>
    </Card>
  );
}
