import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";

export default function MealEditCard({ meal, tagNameById, actionLoading, onApprove, onOpenReject }) {
  const { t } = useTranslation();

  const mealPhotoSrc = meal.photo?.trim() ? meal.photo : "/placeholder-meal.webp";
  const proposedPhotoSrc = meal.pendingPhoto?.trim() ? meal.pendingPhoto : null;
  const chefAvatarSrc = meal.user?.profile_image?.trim() ? meal.user.profile_image : "/avatar.webp";

  const currentTagIds = (meal.tags || [])
    .map((item) => item.tag_id || item.tag?.id)
    .filter(Boolean);
  const currentTags = (meal.tags || []).map((item) => item.tag?.name).filter(Boolean);
  const proposedTagIds = Array.isArray(meal.pendingTagIds) ? meal.pendingTagIds : null;
  const proposedTags = proposedTagIds === null ? null : proposedTagIds.map((id) => tagNameById?.[id] || String(id));

  const tagsChanged =
    proposedTagIds !== null &&
    !(currentTagIds.length === proposedTagIds.length && currentTagIds.every((id) => proposedTagIds.includes(id)));

  const rows = [];
  const photoDiff = proposedPhotoSrc && proposedPhotoSrc !== mealPhotoSrc;

  if (meal.pendingTitle && meal.pendingTitle !== meal.title) {
    rows.push({ label: t.admin.mealEdits.card.titleLabel, current: meal.title, proposed: meal.pendingTitle });
  }

  if (
    meal.pendingPrice !== null &&
    meal.pendingPrice !== undefined &&
    Number(meal.pendingPrice) !== Number(meal.price)
  ) {
    rows.push({
      label: t.admin.mealEdits.card.priceLabel,
      current: `${meal.price} ${t.latestMeals?.priceLabel || ""}`,
      proposed: `${meal.pendingPrice} ${t.latestMeals?.priceLabel || ""}`,
    });
  }

  if (meal.pendingContent && meal.pendingContent !== meal.content) {
    rows.push({ label: t.admin.mealEdits.card.descriptionLabel, current: meal.content, proposed: meal.pendingContent });
  }

  if (tagsChanged) {
    rows.push({
      label: t.admin.mealEdits.card.tagsLabel,
      current: currentTags.length ? currentTags.join(", ") : "—",
      proposed: proposedTags.length ? proposedTags.join(", ") : "—",
    });
  }

  const arrow = (className) => (
    <>
      <ArrowRight className={`hidden ltr:inline ${className}`} />
      <ArrowLeft className={`hidden rtl:inline ${className}`} />
    </>
  );

  return (
    <Card className="flex flex-col sm:flex-row gap-0 overflow-hidden border border-amber-500/30 bg-card shadow-sm py-0">
      {/* Left side current photo */}
      <div className="relative h-48 sm:h-auto sm:w-64 shrink-0 bg-muted/40 border-b sm:border-b-0 sm:border-r border-border/60">
        <Link href={`/meals/${meal.id}`} className="relative block h-full w-full">
          <Image
            src={mealPhotoSrc}
            alt={meal.title}
            fill
            sizes="(max-width: 640px) 100vw, 256px"
            className="object-cover"
          />
        </Link>
        <div className="absolute top-2.5 rtl:right-2.5 ltr:left-2.5">
          <Badge className="bg-blue-600 text-white text-[11px] px-2.5 py-1 font-bold">
            {t.admin.mealEdits.card.editPending}
          </Badge>
        </div>
      </div>

      {/* Right side content & actions */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/meals/${meal.id}`} className="hover:text-primary transition-colors min-w-0">
              <CardTitle className="truncate text-lg sm:text-xl font-bold text-foreground">{meal.title}</CardTitle>
            </Link>
          </div>

          {/* Chef profile information box */}
          <div className="rounded-md border border-border/50 bg-muted/30 p-2 text-xs">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">
              {t.admin.mealEdits.card.chefDetailsHeader}
            </p>
            {meal.user?.id ? (
              <Link href={`/chef/${meal.user.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
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
                  <span className="font-medium text-foreground">{meal.user?.full_name}</span>
                  {meal.user?.email && (
                    <span className="text-muted-foreground ltr:ml-1.5 rtl:mr-1.5 hidden sm:inline">
                      • {meal.user.email}
                    </span>
                  )}
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-border bg-background">
                  <Image
                    src={chefAvatarSrc}
                    alt={t.admin.mealEdits.card.unknownChef}
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                </div>
                <span className="font-medium text-muted-foreground">
                  {t.admin.mealEdits.card.unknownChef}
                </span>
              </div>
            )}
          </div>

          {/* Photo diff */}
          {photoDiff && (
            <div className="rounded-md border border-border/50 bg-muted/30 p-2.5">
              <p className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span>{t.admin.mealEdits.card.currentLabel}</span>
                <span>{t.admin.mealEdits.card.proposedLabel}</span>
              </p>
              <div className="flex items-center gap-3">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-background">
                  <Image src={mealPhotoSrc} alt={meal.title} fill sizes="80px" className="object-cover" />
                </div>
                {arrow("h-4 w-4 shrink-0 text-primary")}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-primary/40 bg-background">
                  <Image
                    src={proposedPhotoSrc}
                    alt={meal.pendingTitle || meal.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Field diffs */}
          {rows.map((row) => (
            <div key={row.label} className="rounded-md border border-border/50 bg-muted/30 p-2.5">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {row.label}
              </p>
              <div className="flex items-start gap-2 text-xs">
                <span className="flex-1 text-muted-foreground whitespace-pre-line wrap-break-word">{row.current}</span>
                {arrow("h-3.5 w-3.5 shrink-0 mt-0.5 text-primary")}
                <span className="flex-1 font-bold text-foreground whitespace-pre-line wrap-break-word">{row.proposed}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <Button type="button" variant="outline" size="sm" disabled={actionLoading} onClick={() => onOpenReject(meal)}>
            {t.admin.mealEdits.card.rejectButton}
          </Button>
          <Button type="button" size="sm" disabled={actionLoading} onClick={() => onApprove(meal.id)}>
            {t.admin.mealEdits.card.approveButton}
          </Button>
        </div>
      </div>
    </Card>
  );
}