import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";

export default function ChefCard({ chef, actionLoading, onApprove, onOpenReject }) {
  const { t } = useTranslation();
  const avatarSrc = chef.profile_image?.trim() ? chef.profile_image : "/avatar.webp";
  const status = chef.chefRequestStatus;
  const isPending = status !== "APPROVED" && status !== "REJECTED";

  const getStatusLabel = (statusKey) => {
    switch (statusKey) {
      case "APPROVED":
        return t.admin.chefs.card.status.approved;
      case "REJECTED":
        return t.admin.chefs.card.status.rejected;
      default:
        return t.admin.chefs.card.status.pending;
    }
  };

  return (
    <Card className="flex flex-col justify-between overflow-hidden border-border/60 bg-card shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
              <Image src={avatarSrc} alt={`${chef.full_name} avatar`} fill sizes="64px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-lg font-bold text-foreground">{chef.full_name}</CardTitle>
              <CardDescription className="truncate text-xs">{chef.email}</CardDescription>
            </div>
          </div>
          <Badge variant={status === "APPROVED" ? "default" : status === "REJECTED" ? "destructive" : "secondary"}>
            {getStatusLabel(status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 grow">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/50 bg-background/50 p-3">
            <p className="text-xs text-muted-foreground">{t.admin.chefs.card.phoneLabel}</p>
            <p className="mt-1 break-all text-sm font-medium">{chef.phone || t.admin.chefs.card.notProvided}</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-background/50 p-3">
            <p className="text-xs text-muted-foreground">{t.admin.chefs.card.locationLabel}</p>
            <p className="mt-1 break-all text-sm font-medium">{chef.location || t.admin.chefs.card.notProvided}</p>
          </div>
        </div>

        <div className="rounded-lg border border-border/50 bg-background/50 p-3">
          <p className="text-xs text-muted-foreground">{t.admin.chefs.card.bioLabel}</p>
          <p className="mt-1 text-sm">{chef.bio || t.admin.chefs.card.noBio}</p>
        </div>

        {status === "REJECTED" && chef.chefRequestRejectReason && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-xs font-semibold text-destructive">{t.admin.chefs.card.rejectionReasonLabel}</p>
            <p className="mt-1 text-sm text-foreground">{chef.chefRequestRejectReason}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={actionLoading || !isPending}
          onClick={() => onOpenReject(chef)}
        >
          {t.admin.chefs.card.rejectButton}
        </Button>
        <Button type="button" disabled={actionLoading || !isPending} onClick={() => onApprove(chef.id)}>
          {t.admin.chefs.card.approveButton}
        </Button>
      </CardFooter>
    </Card>
  );
}
